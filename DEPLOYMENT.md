# Environment Variables for Production

## Required Environment Variables for Vercel Deployment

Add these environment variables in your Vercel dashboard:

### Database Configuration
```
DATABASE_URL=your_postgresql_connection_string
```

### Authentication
```
JWT_SECRET=your_secure_jwt_secret_minimum_32_characters
```

### Application Settings
```
NODE_ENV=production
```

## Database Setup Instructions

1. **Create a PostgreSQL database** (recommended options):
   - **Neon** (free tier): https://neon.tech/
   - **Supabase** (free tier): https://supabase.com/
   - **Railway** (free tier): https://railway.app/
   - **PlanetScale** (free tier): https://planetscale.com/

2. **Get your connection string** from your chosen provider

3. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

## Vercel Deployment Steps

1. **Connect your GitHub repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your app

## Important Notes

- Make sure your `DATABASE_URL` uses PostgreSQL (not SQLite)
- Use a strong, random `JWT_SECRET` (minimum 32 characters)
- The app will automatically run `npx prisma generate` during build
- Database migrations should be run manually after deployment
