-- Migration: Add email verification support
-- Date: 2026-02-11
-- Description: Add email verification fields to users table

-- Add email_verified column (default false)
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;

-- Add email_verification_token column
ALTER TABLE users ADD COLUMN email_verification_token TEXT;

-- Add email_verification_expires column
ALTER TABLE users ADD COLUMN email_verification_expires DATETIME;

-- Create index for email verification token lookup
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(email_verification_token);

-- Update existing users to verified (migration)
UPDATE users SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0;
