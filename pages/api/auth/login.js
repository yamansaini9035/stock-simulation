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

    // Demo fallback
    if (enrollmentNo === '12345678901' && password === 'password123') {
      return res.status(200).json({ success: true, user: { id: 'demo', enrollmentNo } });
    }

    const user = await prisma.user.findUnique({ where: { enrollmentNo: String(enrollmentNo) } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    return res.status(200).json({ success: true, user: { id: user.id, enrollmentNo: user.enrollmentNo } });
  } catch (err) {
    console.error('auth/login error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}







