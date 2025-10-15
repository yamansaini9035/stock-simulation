# 📈 Stock Trading Simulation App

A comprehensive real-time stock trading simulation platform built with Next.js, featuring live price updates, portfolio management, trade history, and user authentication. Perfect for educational purposes, college events, and trading practice.

## 🚀 Features

### 📊 **Core Trading Features**
- **Real-time Price Updates**: Live stock price simulation with WebSocket connections
- **Buy/Sell Orders**: Execute trades with instant portfolio updates
- **Portfolio Management**: Track holdings, balance, and P&L
- **Trade History**: Complete transaction history with realized P&L calculation
- **Market Depth**: Order book visualization with bid/ask spreads
- **Live Charts**: Interactive candlestick charts with technical indicators

### 👥 **User Management**
- **User Authentication**: Secure login/registration system
- **Data Isolation**: Each user has completely separate portfolio and trade data
- **Session Management**: Persistent login sessions with JWT tokens
- **Multi-user Support**: Handle 100+ concurrent users

### 📱 **User Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Professional trading interface
- **Real-time Updates**: Live data without page refresh
- **Intuitive Navigation**: Easy-to-use trading interface

### 🎯 **Educational Features**
- **Simulation Mode**: Practice trading without real money
- **Realistic Data**: Simulated market conditions and price movements
- **Performance Tracking**: Monitor trading performance over time
- **Risk Management**: Learn trading strategies safely

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14**: React framework with SSR/SSG
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Lightweight Charts**: Professional trading charts
- **Socket.io Client**: Real-time WebSocket communication

### **Backend**
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Database ORM with type safety
- **SQLite**: Lightweight database (upgradeable to PostgreSQL)
- **Socket.io**: WebSocket server for real-time updates
- **bcryptjs**: Password hashing and security

### **Database Schema**
- **Users**: Authentication and profile data
- **Trades**: Transaction history with P&L calculation
- **Holdings**: Current portfolio positions
- **Orders**: Pending and executed orders
- **Sessions**: Trading session management

## 📦 Installation

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Quick Start**

```bash
# Clone the repository
git clone <repository-url>
cd stock-trading-app

# Install dependencies
npm install

# Set up environment variables
cp env.local.example env.local
# Edit env.local with your configuration

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### **Environment Variables**

Create `env.local` file:

```env
# JWT Secret - Generate a strong secret key (32+ characters)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Database URL
DATABASE_URL=file:./dev.db

# Node Environment
NODE_ENV=development

# Port (optional)
PORT=3000
```

## 🚀 Deployment

### **Cloud Hosting (Recommended)**

#### **Vercel (Free Tier)**
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/trading-app.git
git push -u origin main

# Deploy on Vercel
# 1. Go to vercel.com
# 2. Sign up with GitHub
# 3. Import repository
# 4. Add environment variables
# 5. Deploy!
```

#### **Railway (Free Tier)**
```bash
# Connect GitHub to Railway
# 1. Go to railway.app
# 2. Sign up with GitHub
# 3. Create new project
# 4. Connect repository
# 5. Add environment variables
# 6. Deploy!
```

### **Local Server Setup**

#### **For College LAN (100 users)**
```bash
# Install PostgreSQL (replace SQLite)
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt install postgresql

# Install Redis (for WebSocket scaling)
# Windows: Download from redis.io
# Mac: brew install redis
# Linux: sudo apt install redis

# Update environment variables
DATABASE_URL=postgresql://user:pass@localhost:5432/trading_db
REDIS_URL=redis://localhost:6379

# Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "trading-app" -- run start
```

## 📊 Usage

### **For Students**
1. **Access the app**: Visit the deployed URL or local IP
2. **Register**: Create account with enrollment number
3. **Login**: Use credentials to access trading platform
4. **Start Trading**: Buy/sell stocks with simulated money
5. **Track Performance**: Monitor portfolio and trade history

### **For Instructors**
1. **Deploy**: Set up on cloud hosting or local server
2. **Share URL**: Provide access link to students
3. **Monitor**: Watch student trading activity
4. **Analyze**: Review performance and trading patterns

### **Access Methods**
- **Cloud URL**: `https://your-app.vercel.app`
- **Local IP**: `http://192.168.1.100:3000`
- **QR Code**: Generate for easy mobile access
- **Short URL**: Use bit.ly for easy sharing

## 🔧 Configuration

### **Trading Parameters**
- **Starting Balance**: $10,000 (configurable)
- **Price Update Interval**: 1 second
- **Session Duration**: 90 minutes
- **Max Users**: 100+ concurrent

### **Database Options**
- **SQLite**: Default, good for <20 users
- **PostgreSQL**: Recommended for 20+ users
- **MySQL**: Alternative option

### **Scaling Options**
- **Single Server**: Up to 50 users
- **With Redis**: Up to 200 users
- **Cloud Hosting**: Unlimited users

## 📈 Performance

### **Capacity Estimates**
- **Local Server**: 10-20 users (SQLite), 50-100 users (PostgreSQL)
- **Cloud Hosting**: 100+ users easily
- **Response Time**: 1-2 seconds
- **Uptime**: 99%+ (cloud), 95%+ (local)

### **Resource Requirements**
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: 2+ cores
- **Storage**: 1GB for database
- **Network**: Stable internet connection

## 🔒 Security

### **Authentication**
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt encryption
- **User Isolation**: Complete data separation

### **Data Protection**
- **Environment Variables**: Secrets not in code
- **CORS Protection**: Configured for production
- **Input Validation**: Zod schema validation

## 🎓 Educational Use Cases

### **College Events**
- **Trading Competitions**: 2-hour events with 100+ students
- **Finance Classes**: Practical trading experience
- **Workshops**: Learn trading concepts hands-on

### **Learning Objectives**
- **Risk Management**: Practice without real money
- **Market Analysis**: Understand price movements
- **Portfolio Management**: Learn diversification
- **Trading Psychology**: Experience market emotions

## 🛠️ Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

### **Project Structure**
```
├── components/          # React components
│   ├── DashboardNew.js  # Main trading interface
│   ├── TradeHistoryTable.js
│   └── WebSocketProvider.js
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   ├── dashboard.js   # Trading dashboard
│   └── trade-history.js
├── prisma/            # Database schema
├── lib/               # Utility functions
└── styles/            # CSS styles
```

### **Adding Features**
1. Create components in `components/` directory
2. Add API routes in `pages/api/` directory
3. Update database schema in `prisma/schema.prisma`
4. Add new pages in `pages/` directory

## 🐛 Troubleshooting

### **Common Issues**

#### **Connection Errors**
```bash
# Check if server is running
curl http://localhost:3000/health

# Restart development server
npm run dev
```

#### **Database Issues**
```bash
# Reset database
npx prisma db push --force-reset

# Regenerate Prisma client
npx prisma generate
```

#### **Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
```

### **Performance Issues**
- **Slow Response**: Upgrade to PostgreSQL
- **High Memory**: Add Redis for WebSocket scaling
- **Connection Timeouts**: Increase timeout settings

## 📞 Support

### **Getting Help**
- **Issues**: Create GitHub issue
- **Documentation**: Check this README
- **Community**: Join discussions

### **Contributing**
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Prisma Team**: For the excellent ORM
- **Tailwind CSS**: For the utility-first CSS
- **Lightweight Charts**: For professional trading charts

---

**Built with ❤️ for educational purposes**

*Perfect for college events, trading competitions, and learning financial markets!*
