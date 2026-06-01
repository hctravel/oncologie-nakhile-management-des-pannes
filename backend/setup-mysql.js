#!/usr/bin/env node

/**
 * MySQL Setup Verification Script
 * Helps diagnose and fix MySQL connection issues
 */

require('dotenv').config();
const Sequelize = require('sequelize');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testConnection(host, port, user, password, database) {
  try {
    const sequelize = new Sequelize(database, user, password, {
      host,
      port,
      dialect: 'mysql',
      logging: false,
    });
    
    await sequelize.authenticate();
    await sequelize.close();
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function setup() {
  console.log('\n🔧 MySQL Setup Verification\n');
  console.log('Current configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || '3306'}`);
  console.log(`  User: ${process.env.DB_USER || 'root'}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '(set)' : '(empty)'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'medical_machine_app'}\n`);

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const user = process.env.DB_USER || 'root';
  let password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'medical_machine_app';

  console.log('🔍 Testing connection with current credentials...\n');
  let result = await testConnection(host, port, user, password, database);

  if (result.success) {
    console.log('✅ Connection successful!\n');
    rl.close();
    return true;
  }

  console.log(`❌ Connection failed: ${result.error}\n`);

  // Try some common passwords
  console.log('🔍 Trying common passwords...\n');
  
  const commonPasswords = ['root', 'password', 'mysql', '123456', ''];
  for (const pwd of commonPasswords) {
    console.log(`  Trying password: "${pwd || '(empty)'}"...`);
    result = await testConnection(host, port, user, pwd, database);
    if (result.success) {
      console.log(`✅ Success with password: "${pwd || '(empty)'}"\n`);
      console.log('📝 Update your .env file:\n');
      console.log(`DB_PASSWORD=${pwd}\n`);
      rl.close();
      return true;
    }
  }

  console.log('\n❌ Could not connect with any common passwords.\n');
  console.log('📋 Options:\n');
  console.log('1. Enter your MySQL credentials manually');
  console.log('2. Reset MySQL root password');
  console.log('3. Install MySQL (if not installed)\n');

  const choice = await question('Select option (1-3): ');

  if (choice === '1') {
    const newPassword = await question('Enter MySQL root password: ');
    console.log('\n🔍 Testing with new credentials...\n');
    result = await testConnection(host, port, user, newPassword, database);
    
    if (result.success) {
      console.log('✅ Connection successful!\n');
      console.log('📝 Update your .env file:\n');
      console.log(`DB_PASSWORD=${newPassword}\n`);
      rl.close();
      return true;
    } else {
      console.log(`❌ Still failed: ${result.error}\n`);
    }
  } else if (choice === '2') {
    console.log('\n📚 To reset MySQL root password on Windows:\n');
    console.log('1. Stop MySQL service: net stop MySQL80');
    console.log('2. Start MySQL without password: mysqld --skip-grant-tables');
    console.log('3. In another terminal: mysql -u root');
    console.log('4. Run: FLUSH PRIVILEGES;');
    console.log('5. Run: ALTER USER "root"@"localhost" IDENTIFIED BY "root";');
    console.log('6. Run: EXIT;');
    console.log('7. Restart MySQL: net start MySQL80\n');
  } else if (choice === '3') {
    console.log('\n📚 To install MySQL on Windows:\n');
    console.log('1. Download from: https://dev.mysql.com/downloads/mysql/');
    console.log('2. Run installer and set root password');
    console.log('3. Start MySQL service: net start MySQL80\n');
  }

  rl.close();
  process.exit(1);
}

setup();
