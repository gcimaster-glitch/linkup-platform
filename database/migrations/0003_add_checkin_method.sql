-- ============================================
-- Migration: Add check-in method to events
-- ============================================

-- イベントにチェックイン方式を追加
ALTER TABLE events ADD COLUMN checkin_method TEXT CHECK(checkin_method IN ('qr', 'manual')) DEFAULT 'qr';

-- インデックス追加
CREATE INDEX idx_events_checkin_method ON events(checkin_method);
