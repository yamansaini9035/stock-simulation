const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Priority order: Wi-Fi first, then other wireless adapters, then Ethernet
  const priorityOrder = ['Wi-Fi', 'WiFi', 'Wireless', 'WLAN', 'Ethernet', 'Local Area Connection'];
  
  // First pass: look for Wi-Fi/Wireless adapters
  for (const priorityName of priorityOrder) {
    for (const name of Object.keys(interfaces)) {
      if (name.toLowerCase().includes(priorityName.toLowerCase())) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            if (iface.address.startsWith('192.168.') || 
                iface.address.startsWith('10.') || 
                iface.address.startsWith('172.')) {
              console.log(`📶 Found ${name} adapter with IP: ${iface.address}`);
              return iface.address;
            }
          }
        }
      }
    }
  }
  
  // Second pass: any non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || 
            iface.address.startsWith('10.') || 
            iface.address.startsWith('172.')) {
          console.log(`🔌 Found ${name} adapter with IP: ${iface.address}`);
          return iface.address;
        }
      }
    }
  }
  
  // Fallback to any non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`🌐 Fallback to ${name} adapter with IP: ${iface.address}`);
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

function updateEnvFile() {
  const envPath = path.join(__dirname, '..', 'env.local');
  const currentIP = getLocalIP();
  
  console.log(`🔍 Detected IP address: ${currentIP}`);
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ env.local file not found');
    return false;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update WebSocket URL
  envContent = envContent.replace(
    /NEXT_PUBLIC_WEBSOCKET_URL=http:\/\/[^:]+:3000/g,
    `NEXT_PUBLIC_WEBSOCKET_URL=http://${currentIP}:3000`
  );
  
  // Update API Base URL
  envContent = envContent.replace(
    /NEXT_PUBLIC_API_BASE=http:\/\/[^:]+:3000/g,
    `NEXT_PUBLIC_API_BASE=http://${currentIP}:3000`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Updated env.local with IP: ${currentIP}`);
  console.log(`📡 WebSocket URL: http://${currentIP}:3000`);
  console.log(`🔗 API Base URL: http://${currentIP}:3000`);
  
  return true;
}

// Run the update
if (require.main === module) {
  updateEnvFile();
}

module.exports = { updateEnvFile, getLocalIP };
