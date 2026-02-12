-- ========================================
-- Add Test User for Login
-- ========================================
-- Email: user@example.com
-- Password: password123
-- Created: 2026-02-12
-- ========================================

-- Insert test user (password123)
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
    '$2b$10$NA/RIRqHXVfxAlTReYEh2ujvky6qhyalhbQXhwULIp9Pmrbzao2De',
    'Test User',
    'organizer',
    'https://ui-avatars.com/api/?name=Test+User&background=2563EB&color=fff',
    'unverified',
    1,
    datetime('now')
);

-- Add organizer profile
INSERT OR REPLACE INTO organizer_profiles (
    organizer_id,
    organization_name,
    organization_type,
    rating,
    created_at
) VALUES (
    'u-test-example-001',
    'Test Organization',
    'company',
    0.0,
    datetime('now')
);

-- Verify insertion
SELECT 
    user_id,
    email,
    name,
    role,
    kyc_status
FROM users 
WHERE email = 'user@example.com';
