#!/usr/bin/env node

/**
 * Setup verification script
 * Checks if all required environment variables are configured
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking your setup...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Run: cp env.example .env.local');
  process.exit(1);
}

console.log('✅ .env.local file exists');

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf8');

// Required variables
const required = [
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_X509_CERT_URL',
];

let allConfigured = true;
const missing = [];
const placeholders = [];

required.forEach(varName => {
  const regex = new RegExp(`${varName}=["']?([^"'\\n]+)["']?`);
  const match = envContent.match(regex);
  
  if (!match) {
    missing.push(varName);
    allConfigured = false;
  } else {
    const value = match[1];
    // Check if it's still a placeholder
    if (
      value.includes('your-') || 
      value.includes('placeholder') || 
      value.includes('YOUR_') ||
      value.includes('123456789') ||
      value.includes('abcdef')
    ) {
      placeholders.push(varName);
      allConfigured = false;
    }
  }
});

console.log('\n📋 Configuration Status:\n');

if (missing.length > 0) {
  console.log('❌ Missing variables:');
  missing.forEach(v => console.log(`   - ${v}`));
  console.log('');
}

if (placeholders.length > 0) {
  console.log('⚠️  Still using placeholder values:');
  placeholders.forEach(v => console.log(`   - ${v}`));
  console.log('');
}

if (allConfigured) {
  console.log('✅ All environment variables configured!\n');
  console.log('🚀 Ready to run: npm run dev\n');
  process.exit(0);
} else {
  console.log('❌ Configuration incomplete\n');
  console.log('📖 Follow these steps:\n');
  console.log('1. Get Gemini API key: https://aistudio.google.com/app/apikey');
  console.log('2. Set up Firebase: https://console.firebase.google.com/');
  console.log('3. Edit .env.local with your actual values');
  console.log('4. Run this script again: node setup-check.js\n');
  console.log('📚 See QUICK_START.md for detailed instructions\n');
  process.exit(1);
}

