import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to query the database
    const userCount = await prisma.user.count();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Database connected successfully',
      userCount: userCount,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  } catch (error) {
    console.error('Database connection test error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  } finally {
    await prisma.$disconnect();
  }
}
