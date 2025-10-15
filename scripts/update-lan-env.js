#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');

console.log('🔧 Updating environment variables for LAN access...\n');

// Get network interfaces
const interfaces = os.networkInterfaces();
const lanIPs = [];

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      lanIPs.push({
        interface: name,
        address: iface.address,
        netmask: iface.netmask
      });
    }
  }
}

if (lanIPs.length === 0) {
  console.log('❌ No LAN IP addresses found. Make sure you\'re connected to a network.');
  process.exit(1);
}

const primaryIP = lanIPs[0].address;
console.log(`📍 Using IP address: ${primaryIP}`);

// Read current env.local file
const envPath = path.join(process.cwd(), 'env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('⚠️  env.local not found, creating new one...');
}

// Update or add the environment variables
const updates = [
  { key: 'NEXT_PUBLIC_WEBSOCKET_URL', value: `http://${primaryIP}:3000` },
  { key: 'NEXT_PUBLIC_API_BASE', value: `http://${primaryIP}:3000` }
];

let newEnvContent = envContent;

updates.forEach(({ key, value }) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  
  if (regex.test(newEnvContent)) {
    // Update existing line
    newEnvContent = newEnvContent.replace(regex, line);
    console.log(`✅ Updated: ${key}=${value}`);
  } else {
    // Add new line
    newEnvContent += `\n${line}`;
    console.log(`✅ Added: ${key}=${value}`);
  }
});

// Write back to file
try {
  fs.writeFileSync(envPath, newEnvContent);
  console.log(`\n💾 Environment variables saved to env.local`);
} catch (error) {
  console.error('❌ Failed to write env.local:', error.message);
  process.exit(1);
}

console.log('\n🚀 Next steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Access from other devices: http://' + primaryIP + ':3000');
console.log('\n✅ LAN environment setup complete!');
