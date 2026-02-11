-- ========================================
-- LinkUp Platform Database Schema
-- ========================================
-- Version: 1.0.0
-- Created: 2026-02-11
-- Database: Cloudflare D1
-- ========================================

-- ========================================
-- 1. USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    user_type TEXT DEFAULT 'participant' CHECK(user_type IN ('participant', 'organizer', 'admin')),
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);

-- ========================================
-- 2. VENUES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS venues (
    venue_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL,
    lng REAL,
    capacity INTEGER,
    layout_rows INTEGER,
    layout_cols INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name);

-- ========================================
-- 3. EVENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS events (
    event_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK(category IN ('tech', 'business', 'art', 'music', 'social', 'sports', 'food', 'festival')),
    cover_image_url TEXT,
    venue_id TEXT,
    venue_name TEXT,
    venue_address TEXT,
    lat REAL,
    lng REAL,
    start_datetime TEXT NOT NULL,
    end_datetime TEXT,
    organizer_id TEXT NOT NULL,
    organizer_name TEXT,
    organizer_rating REAL DEFAULT 0.0,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'cancelled', 'completed')),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    is_online INTEGER DEFAULT 0,
    online_url TEXT,
    tags TEXT, -- JSON array as text
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(user_id),
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
);

CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);

-- ========================================
-- 4. TICKETS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    ticket_type TEXT NOT NULL,
    ticket_name TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL,
    sold_count INTEGER DEFAULT 0,
    purchase_limit INTEGER DEFAULT 4,
    description TEXT,
    sales_start TEXT,
    sales_end TEXT,
    is_reserved_seating INTEGER DEFAULT 0,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'sold_out', 'hidden')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- ========================================
-- 5. ORDERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    ticket_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount INTEGER NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_intent_id TEXT, -- Stripe Payment Intent ID
    seats TEXT, -- JSON array of selected seats
    attendee_info TEXT, -- JSON object with attendee details
    qr_code TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- ========================================
-- 6. CHECK-INS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS checkins (
    checkin_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    checked_in_at TEXT DEFAULT CURRENT_TIMESTAMP,
    checked_in_by TEXT, -- Staff user_id
    seat_number TEXT,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_checkins_order ON checkins(order_id);
CREATE INDEX IF NOT EXISTS idx_checkins_event ON checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);

-- ========================================
-- 7. RESERVATIONS TABLE (Seat Management)
-- ========================================
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    ticket_id TEXT NOT NULL,
    seat_id TEXT NOT NULL,
    order_id TEXT,
    user_id TEXT,
    status TEXT DEFAULT 'temporary' CHECK(status IN ('temporary', 'confirmed', 'released')),
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_reservations_event ON reservations(event_id);
CREATE INDEX IF NOT EXISTS idx_reservations_seat ON reservations(event_id, seat_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE UNIQUE INDEX idx_reservations_event_seat ON reservations(event_id, seat_id) WHERE status = 'confirmed';

-- ========================================
-- 8. CATEGORY_IMAGES TABLE (Replace hardcoded IMGS)
-- ========================================
CREATE TABLE IF NOT EXISTS category_images (
    category TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 9. ADMIN_SETTINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS admin_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 10. AUDIT_LOG TABLE (Optional - for tracking changes)
-- ========================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- ========================================
-- END OF SCHEMA
-- ========================================
