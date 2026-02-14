-- Migration 0008: Fix users table schema inconsistencies
-- Created: 2026-02-14
-- Purpose: Add missing columns and fix naming inconsistencies

-- Add display_name column (same as name for compatibility)
ALTER TABLE users ADD COLUMN display_name TEXT;
UPDATE users SET display_name = name WHERE display_name IS NULL;

-- Add role column (same as user_type for compatibility)
ALTER TABLE users ADD COLUMN role TEXT;
UPDATE users SET role = user_type WHERE role IS NULL;

-- Add kyc_status column (for KYC verification status)
ALTER TABLE users ADD COLUMN kyc_status TEXT DEFAULT 'unverified' CHECK(kyc_status IN ('unverified', 'pending', 'verified', 'rejected'));
UPDATE users SET kyc_status = 'verified' WHERE verified = 1 AND kyc_status IS NULL;

-- Add email_verified column (boolean for email verification)
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
UPDATE users SET email_verified = verified WHERE email_verified IS NULL;

-- Add email_verification_token column (for email verification)
ALTER TABLE users ADD COLUMN email_verification_token TEXT;

-- Add email_verification_expires column (expiration timestamp)
ALTER TABLE users ADD COLUMN email_verification_expires TEXT;

-- Add cover_image_url column (if not exists from previous migration)
-- ALTER TABLE users ADD COLUMN cover_image_url TEXT; -- Already exists from 0005

-- Add phone_number column (if not exists)
-- ALTER TABLE users ADD COLUMN phone_number TEXT; -- Check if exists

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(email_verification_token);

-- Update existing users to have consistent data
UPDATE users SET 
    display_name = COALESCE(display_name, name),
    role = COALESCE(role, user_type),
    kyc_status = COALESCE(kyc_status, CASE WHEN verified = 1 THEN 'verified' ELSE 'unverified' END),
    email_verified = COALESCE(email_verified, verified)
WHERE display_name IS NULL OR role IS NULL OR kyc_status IS NULL OR email_verified IS NULL;
