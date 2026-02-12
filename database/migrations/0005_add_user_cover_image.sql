-- ========================================
-- Migration: Add User Cover Image
-- ========================================
-- Version: 0005
-- Created: 2026-02-12
-- Description: ユーザープロフィールにカバー画像フィールド追加
-- ========================================

-- Add cover_image_url column to users table
ALTER TABLE users ADD COLUMN cover_image_url TEXT;

-- ========================================
-- Notes:
-- - cover_image_url: カバー画像のURL（ダッシュボードヘッダーに表示）
-- - NULLの場合はデフォルトのグラデーション背景を使用
-- ========================================
