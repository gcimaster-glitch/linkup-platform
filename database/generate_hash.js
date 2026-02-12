#!/usr/bin/env node
/**
 * Generate bcrypt hash for test user password
 * Usage: node generate_hash.js
 */

const bcrypt = require('bcryptjs');

const password = 'password123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('\nSQL Insert Statement:');
  console.log(`
INSERT OR REPLACE INTO users (
    user_id, 
    email, 
    password_hash, 
    name, 
    role, 
    avatar_url, 
    kyc_status, 
    verified,
    created_at
) VALUES (
    'u-test-example-001',
    'user@example.com',
    '${hash}',
    'Test User',
    'organizer',
    'https://ui-avatars.com/api/?name=Test+User&background=2563EB&color=fff',
    'unverified',
    1,
    datetime('now')
);
  `);
});
