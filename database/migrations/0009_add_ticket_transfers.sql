-- Migration 0009: Add ticket transfer functionality
-- Created: 2026-02-14
-- Purpose: Enable users to transfer tickets to other users

-- Create ticket_transfers table
CREATE TABLE IF NOT EXISTS ticket_transfers (
    transfer_id TEXT PRIMARY KEY,
    order_ticket_id TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    to_user_id TEXT,
    to_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'cancelled', 'expired')),
    transfer_code TEXT UNIQUE NOT NULL,
    message TEXT,
    expires_at TEXT NOT NULL,
    transferred_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_order_ticket ON ticket_transfers(order_ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_from_user ON ticket_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_to_user ON ticket_transfers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_to_email ON ticket_transfers(to_email);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_status ON ticket_transfers(status);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_code ON ticket_transfers(transfer_code);

-- Add transfer tracking columns to order_tickets table
ALTER TABLE order_tickets ADD COLUMN transferred_from TEXT;
ALTER TABLE order_tickets ADD COLUMN transferred_to TEXT;
ALTER TABLE order_tickets ADD COLUMN transfer_date TEXT;

-- Create indexes for transfer tracking
CREATE INDEX IF NOT EXISTS idx_order_tickets_transferred_from ON order_tickets(transferred_from);
CREATE INDEX IF NOT EXISTS idx_order_tickets_transferred_to ON order_tickets(transferred_to);
