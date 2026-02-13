-- Migration 0006: Add document_url and approval_status columns
-- Created: 2026-02-13

-- Add document_url column to events table
ALTER TABLE events ADD COLUMN document_url TEXT;

-- Add approval_status column (for tracking approval workflow)
ALTER TABLE events ADD COLUMN approval_status TEXT DEFAULT 'draft' CHECK(approval_status IN ('draft', 'pending', 'approved', 'rejected'));

-- Add approved_by column (admin user_id who approved)
ALTER TABLE events ADD COLUMN approved_by TEXT;

-- Add approved_at column (timestamp of approval)
ALTER TABLE events ADD COLUMN approved_at TEXT;

-- Add rejection_reason column
ALTER TABLE events ADD COLUMN rejection_reason TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_events_approval_status ON events(approval_status);
CREATE INDEX IF NOT EXISTS idx_events_document_url ON events(document_url);

-- Update existing events to have default approval_status
UPDATE events SET approval_status = 'approved' WHERE status = 'published' AND approval_status IS NULL;
UPDATE events SET approval_status = 'draft' WHERE status = 'draft' AND approval_status IS NULL;
