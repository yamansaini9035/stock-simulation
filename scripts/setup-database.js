const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  console.log('🚀 Setting up Trading Simulation Database...');
  console.log('');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in environment variables');
    console.log('');
    console.log('Please create a .env file with:');
    console.log('DATABASE_URL="postgresql://username:password@localhost:5432/trading_simulation"');
    console.log('JWT_SECRET="your-super-secret-jwt-key-here"');
    console.log('');
    console.log('Or use a cloud database service like:');
    console.log('- Railway: https://railway.app');
    console.log('- Supabase: https://supabase.com');
    console.log('- Neon: https://neon.tech');
    console.log('- PlanetScale: https://planetscale.com');
    return;
  }

  const prisma = new PrismaClient();
  
  try {
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    console.log('');

    console.log('🗄️  Creating database schema...');
    // The schema will be created by prisma db push
    console.log('✅ Database schema ready');
    console.log('');

    console.log('👤 Creating test user...');
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
    console.log(`✅ Test user created: ${user.enrollmentNo}`);
    console.log('');

    console.log('📊 Creating sample holdings...');
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
    console.log('✅ Sample holdings created');
    console.log('');

    console.log('📈 Creating sample trades...');
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
    console.log('✅ Sample trades created');
    console.log('');

    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('🔑 Test user credentials:');
    console.log('   Enrollment: 12345678901');
    console.log('   Password: password123');
    console.log('');
    console.log('🚀 You can now start the application with:');
    console.log('   npm run dev:ws');
    console.log('');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your DATABASE_URL in .env file');
    console.log('3. Ensure the database exists');
    console.log('4. Run: npm run db:generate');
    console.log('5. Run: npm run db:push');
    console.log('');
    console.log('💡 For a quick start, you can use a cloud database:');
    console.log('   - Railway: https://railway.app (Free tier available)');
    console.log('   - Supabase: https://supabase.com (Free tier available)');
    console.log('   - Neon: https://neon.tech (Free tier available)');
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
