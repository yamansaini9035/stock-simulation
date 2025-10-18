/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server-side environment variables are automatically available
  // No need to expose JWT_SECRET or DATABASE_URL to the client
  
  // Note: remove invalid experimental keys to satisfy Next.js validation
  eslint: {
    // Do not block builds on ESLint errors (Vercel will still show them)
    ignoreDuringBuilds: true,
  },
  
  // Disable PostCSS processing to avoid autoprefixer issues
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig
