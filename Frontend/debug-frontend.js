// Debug script for Frontend
console.log('🔍 Frontend Debug Script');
console.log('========================');

// Check if we're in the right directory
const fs = require('fs');
const path = require('path');

console.log('📁 Current directory:', process.cwd());
console.log('📁 Contents:', fs.readdirSync('.'));

// Check if package.json exists
if (fs.existsSync('package.json')) {
  console.log('✅ package.json found');
  const packageJson = JSON.parse(fs.readdirSync('package.json'));
  console.log('📦 Dependencies:', Object.keys(packageJson.dependencies || {}));
} else {
  console.log('❌ package.json not found');
}

// Check if src directory exists
if (fs.existsSync('src')) {
  console.log('✅ src directory found');
  console.log('📁 src contents:', fs.readdirSync('src'));
} else {
  console.log('❌ src directory not found');
}

// Check if main files exist
const mainFiles = ['src/App.jsx', 'src/main.tsx', 'src/index.html'];
mainFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🚀 To start the frontend:');
console.log('1. cd Frontend');
console.log('2. npm install');
console.log('3. npm run dev');
console.log('\n🌐 Then visit: http://localhost:3000');
