export default function handler(req, res) {
  const dbUrl = process.env.DATABASE_URL;
  
  // Parse the URL to show what Prisma sees
  try {
    const url = new URL(dbUrl);
    return res.status(200).json({
      success: true,
      databaseUrl: dbUrl ? 'Set' : 'Not set',
      parsedUrl: {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 'No port specified',
        pathname: url.pathname,
        search: url.search
      },
      fullUrl: dbUrl
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      databaseUrl: dbUrl ? 'Set but invalid' : 'Not set',
      fullUrl: dbUrl
    });
  }
}
