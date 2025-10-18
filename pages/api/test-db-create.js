import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to create a simple test record
    const testUser = await prisma.user.create({
      data: {
        enrollmentNo: 'test-' + Date.now(),
        passwordHash: 'test-hash'
      }
    });
    
    // Clean up test record
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Database is working and tables exist',
      testUserId: testUser.id
    });
  } catch (error) {
    console.error('Database test error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}
