const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.upsert({
      where: { enrollmentNo: '12345678901' },
      update: {},
      create: {
        enrollmentNo: '12345678901',
        passwordHash: hashedPassword,
        balance: 10000,
      },
    });

    console.log('Test user created:', user.enrollmentNo);

    // Create some sample holdings
    await prisma.holding.upsert({
      where: {
        userId_symbol: {
          userId: user.id,
          symbol: 'RELIANCE',
        },
      },
      update: {},
      create: {
        userId: user.id,
        symbol: 'RELIANCE',
        quantity: 5,
        avgPrice: 2500,
      },
    });

    // Create some sample trades
    await prisma.trade.create({
      data: {
        userId: user.id,
        symbol: 'RELIANCE',
        action: 'BUY',
        quantity: 5,
        price: 2500,
        value: 12500,
      },
    });

    console.log('Database setup completed successfully!');
    console.log('Test user credentials:');
    console.log('Enrollment: 12345678901');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
