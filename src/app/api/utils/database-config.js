const ALLOWED_PROTOCOLS = new Set(['postgres:', 'postgresql:']);

export function normalizeDatabaseUrl(rawValue) {
  if (typeof rawValue !== 'string') return null;
  const value = rawValue.trim();
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
    if (!parsed.hostname) return null;
    const dbName = parsed.pathname.replace(/^\//, '');
    if (!dbName) return null;
    return value;
  } catch {
    return null;
  }
}

export const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
export const hasDatabase = Boolean(databaseUrl);
export const missingDatabaseErrorMessage =
  'DATABASE_URL is missing or invalid. Database-backed features are disabled until a valid PostgreSQL connection string is added.';

if (typeof process !== 'undefined' && process.env.DATABASE_URL && !databaseUrl) {
  console.warn(
    'Ignoring invalid DATABASE_URL. Expected format: postgresql://user:password@host/dbname?option=value'
  );
}
