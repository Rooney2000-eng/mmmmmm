import sql, { hasDatabase } from '@/app/api/utils/sql';
import argon2 from 'argon2';

function createToken(email, userId = 'env-admin') {
  return Buffer.from(`${userId}:${email}:${Date.now()}`).toString('base64');
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!hasDatabase) {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        return Response.json(
          {
            error:
              'Admin login is disabled until DATABASE_URL or ADMIN_EMAIL/ADMIN_PASSWORD are configured',
          },
          { status: 503 }
        );
      }

      if (email !== adminEmail || password !== adminPassword) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      return Response.json({ token: createToken(email), email });
    }

    const rows = await sql(`SELECT * FROM admin_users WHERE email = $1`, [email]);

    if (rows.length === 0) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];

    let isValid = false;
    if (user.password_hash.includes('placeholder')) {
      if (password === 'admin123') {
        const newHash = await argon2.hash(password);
        await sql(`UPDATE admin_users SET password_hash = $1 WHERE id = $2`, [
          newHash,
          user.id,
        ]);
        isValid = true;
      }
    } else {
      isValid = await argon2.verify(user.password_hash, password);
    }

    if (!isValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return Response.json({
      token: createToken(user.email, user.id),
      email: user.email,
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
