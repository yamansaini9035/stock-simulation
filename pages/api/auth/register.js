import bcrypt from 'bcryptjs';

import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  // Set CORS headers for actual request
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  try {
    const { enrollmentNo, password } = req.body || {};
    if (!enrollmentNo || !password) return res.status(400).json({ error: 'enrollmentNo and password required' });
    
    // Test database connection first
    await prisma.$connect();
    
    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.upsert({
      where: { enrollmentNo: String(enrollmentNo) },
      update: { passwordHash },
      create: { enrollmentNo: String(enrollmentNo), passwordHash },
    });
    
    return res.status(200).json({ success: true, user: { id: user.id, enrollmentNo: user.enrollmentNo } });
  } catch (err) {
    console.error('auth/register error', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      meta: err.meta
    });
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}







