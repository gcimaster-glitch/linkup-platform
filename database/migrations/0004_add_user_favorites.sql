-- ========================================
-- Migration: Add User Favorites Table
-- ========================================
-- Version: 0004
-- Created: 2026-02-12
-- Description: お気に入りイベント機能のテーブル追加
-- ========================================

-- ========================================
-- USER_FAVORITES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_favorites (
    favorite_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_event ON user_favorites(event_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created ON user_favorites(created_at);

-- ========================================
-- Notes:
-- - favorite_id: UUID形式の主キー
-- - user_id: ユーザーID（外部キー）
-- - event_id: イベントID（外部キー）
-- - created_at: お気に入り追加日時
-- - UNIQUE(user_id, event_id): 同じユーザーが同じイベントを重複してお気に入りできないように制約
-- ========================================
