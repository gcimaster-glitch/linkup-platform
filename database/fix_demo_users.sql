-- ========================================
-- URGENT FIX: Update Demo User Passwords
-- ========================================
-- Issue: Demo users have invalid bcrypt hashes
-- Fix: Update with valid bcrypt hashes
-- Date: 2026-02-12
-- ========================================

-- Update organizer@demo.com password to 'demo'
UPDATE users 
SET password_hash = '$2b$10$YAZ8V9HcAeL5elpvk6av5uspTwT85Kpyfm2b2WmrFL5Qi.vt.HY9i'
WHERE email = 'organizer@demo.com';

-- Update user@demo.com password to 'demo'
UPDATE users 
SET password_hash = '$2b$10$YAZ8V9HcAeL5elpvk6av5uspTwT85Kpyfm2b2WmrFL5Qi.vt.HY9i'
WHERE email = 'user@demo.com';

-- Add/Update user@example.com with password 'password123'
INSERT OR REPLACE INTO users (
    user_id, 
    email, 
    password_hash, 
    name, 
    role, 
    avatar_url, 
    kyc_status, 
    verified,
    created_at,
    updated_at
) VALUES (
    'u-test-example-001',
    'user@example.com',
    '$2b$10$e94sMsf11HWQFYDZxma1buVUc0jG6kwy.wK./V6WmUHEtEiHa2CPC',
    'Test User',
    'organizer',
    'https://ui-avatars.com/api/?name=Test+User&background=2563EB&color=fff',
    'unverified',
    1,
    datetime('now'),
    datetime('now')
);

-- Verify updates
SELECT 
    email,
    name,
    role,
    SUBSTR(password_hash, 1, 20) || '...' as password_hash_preview,
    verified,
    kyc_status
FROM users 
WHERE email IN ('organizer@demo.com', 'user@demo.com', 'user@example.com')
ORDER BY email;

-- ========================================
-- Expected Results:
-- organizer@demo.com - password: demo
-- user@demo.com      - password: demo  
-- user@example.com   - password: password123
-- ========================================
