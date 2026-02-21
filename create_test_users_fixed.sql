-- 正しいスキーマに基づいたテストユーザー作成
-- 実際のカラム: user_id, email, password_hash, name, user_type, avatar_url, verified, created_at

-- パスワード: Admin1234! のハッシュ
INSERT OR REPLACE INTO users (user_id, email, password_hash, name, user_type, avatar_url, verified, created_at) 
VALUES ('u-admin-main-001', 'admin@linkup.live', '$2b$10$Mb.KR4l9x9RT3A.g8j3BX.YsavWYa4a5/XcD9UbzQvL7jn9bXhswO', 'LinkUp 管理者', 'admin', 'https://ui-avatars.com/api/?name=Admin&background=DC2626&color=fff', 1, datetime('now'));

-- パスワード: Organizer1234! のハッシュ
INSERT OR REPLACE INTO users (user_id, email, password_hash, name, user_type, avatar_url, verified, created_at) 
VALUES ('u-organizer-main-001', 'organizer@linkup.live', '$2b$10$6VauxbSlpDPKHHDthU6Qa.K1Y2glUdrlKxAQkxJANBOE88WPZOlYO', 'テストイベント主催者', 'organizer', 'https://ui-avatars.com/api/?name=Organizer&background=2563EB&color=fff', 1, datetime('now'));

-- パスワード: User1234! のハッシュ  
INSERT OR REPLACE INTO users (user_id, email, password_hash, name, user_type, avatar_url, verified, created_at) 
VALUES ('u-user-main-001', 'user@linkup.live', '$2b$10$gfNMVDIyPBgCpLgsHMcJVe63975OIwfnhJuoguK8NWSTq8fS.QuOu', '一般テストユーザー', 'participant', 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff', 1, datetime('now'));

-- 確認
SELECT user_id, email, name, user_type, verified FROM users WHERE email IN ('admin@linkup.live', 'organizer@linkup.live', 'user@linkup.live') ORDER BY user_type;
