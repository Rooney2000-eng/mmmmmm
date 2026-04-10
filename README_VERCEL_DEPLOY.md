Vercel settings

- Root Directory: ./
- Install Command: npm install --legacy-peer-deps --include=dev
- Build Command: npm run build
- Output Directory: build/client

Environment variables:
- ADMIN_EMAIL=soufianechahid30@gmail.com
- ADMIN_PASSWORD=admin123
- AUTH_URL=https://your-project.vercel.app
- AUTH_SECRET=change-this-to-a-long-random-secret
- DATABASE_URL=
- RESEND_API_KEY=
- BOOKING_FROM_EMAIL=onboarding@resend.dev
- OWNER_NOTIFICATION_EMAIL=soufianechahid30@gmail.com

Important:
- Leave DATABASE_URL empty if you do not have a real PostgreSQL/Neon database.
- Redeploy after changing environment variables.
