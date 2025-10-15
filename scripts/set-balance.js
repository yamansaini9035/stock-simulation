// Usage (PowerShell):
//   $env:DATABASE_URL="mysql://root@localhost:3306/trading_simulation"; node scripts/set-balance.js 12345678901 3000000

const { PrismaClient } = require('@prisma/client');

async function main() {
  const [,, enrollmentNoArg, balanceArg] = process.argv;
  if (!enrollmentNoArg || !balanceArg) {
    console.error('Usage: node scripts/set-balance.js <enrollmentNo> <balance>');
    process.exit(1);
  }
  const enrollmentNo = String(enrollmentNoArg);
  const balance = Number(balanceArg);
  if (!isFinite(balance) || balance < 0) {
    console.error('Invalid balance value');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.upsert({
      where: { enrollmentNo },
      update: { balance },
      create: { enrollmentNo, passwordHash: '', balance },
    });
    console.log(`Updated user ${user.enrollmentNo} → balance=${user.balance}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });







