#!/usr/bin/env node

const os = require('os');
const { execSync } = require('child_process');

console.log('🌐 LAN Network Setup for Stock Trading App');
console.log('==========================================\n');

// Get network interfaces
const interfaces = os.networkInterfaces();
const lanIPs = [];

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    // Skip internal and non-IPv4 addresses
    if (iface.family === 'IPv4' && !iface.internal) {
      lanIPs.push({
        interface: name,
        address: iface.address,
        netmask: iface.netmask
      });
    }
  }
}

console.log('📍 Your LAN IP Addresses:');
console.log('-------------------------');
if (lanIPs.length === 0) {
  console.log('❌ No LAN IP addresses found. Make sure you\'re connected to a network.');
} else {
  lanIPs.forEach((ip, index) => {
    console.log(`${index + 1}. ${ip.interface}: ${ip.address}`);
  });
}

console.log('\n🚀 How to Access Your App on LAN:');
console.log('----------------------------------');
console.log('1. Start your development server:');
console.log('   npm run dev');
console.log('');
console.log('2. Access from other devices using:');
if (lanIPs.length > 0) {
  lanIPs.forEach((ip) => {
    console.log(`   http://${ip.address}:3000`);
  });
} else {
  console.log('   http://[YOUR_IP]:3000');
}

console.log('\n📱 Testing LAN Access:');
console.log('----------------------');
console.log('• Make sure all devices are on the same network');
console.log('• Disable firewall temporarily if connection fails');
console.log('• Try accessing from mobile browser or another computer');
console.log('• Check that port 3000 is not blocked');

console.log('\n🔧 Troubleshooting:');
console.log('-------------------');
console.log('• Windows: Check Windows Defender Firewall');
console.log('• macOS: Check System Preferences > Security & Privacy > Firewall');
console.log('• Router: Ensure devices can communicate (AP isolation disabled)');
console.log('• Network: Make sure you\'re on the same subnet');

console.log('\n✅ Configuration Applied:');
console.log('-------------------------');
console.log('• package.json: "dev": "next dev -H 0.0.0.0"');
console.log('• next.config.js: allowedDevOrigins: ["*"]');
console.log('• Server will bind to all network interfaces');

if (lanIPs.length > 0) {
  console.log('\n🔧 Environment Variables Needed:');
  console.log('----------------------------------');
  console.log('Add these to your env.local file:');
  console.log(`NEXT_PUBLIC_WEBSOCKET_URL=http://${lanIPs[0].address}:3000`);
  console.log(`NEXT_PUBLIC_API_BASE=http://${lanIPs[0].address}:3000`);
  console.log('');
  console.log('⚠️  Important: Restart your dev server after updating env.local');
}

console.log('\n🎉 Ready for LAN trading! 📈');
