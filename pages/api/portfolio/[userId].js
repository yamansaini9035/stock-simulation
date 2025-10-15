import { prisma } from '../../../lib/prisma';

async function getUserByIdOrEnrollment(idOrEnroll) {
  // Try id
  try {
    const u = await prisma.user.findUnique({ where: { id: String(idOrEnroll) } });
    if (u) return u;
  } catch (_) {}
  // Try enrollment number
  try {
    const u = await prisma.user.findUnique({ where: { enrollmentNo: String(idOrEnroll) } });
    if (u) return u;
  } catch (_) {}
  return null;
}

export default async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ success: false, error: 'userId required' });

  try {
    const user = await getUserByIdOrEnrollment(userId);
    if (!user) return res.status(404).json({ success: false, error: 'user not found' });

    const [holdings, trades, orders] = await Promise.all([
      prisma.holding.findMany({ where: { userId: user.id } }),
      prisma.trade.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);

    const portfolio = {
      id: user.id,
      balance: user.balance ?? 0,
      holdings,
      trades,
      orders,
      totalValue: (user.balance ?? 0),
    };
    return res.status(200).json({ success: true, portfolio, user: { id: user.id, enrollmentNo: user.enrollmentNo } });
  } catch (err) {
    console.error('portfolio api error', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}







