-- 修正版マイグレーションSQL（実際のスキーマに合わせて修正）

-- ステップ1: 管理者ユーザー作成
INSERT INTO users (user_id, email, password_hash, name, user_type, avatar_url, verified, created_at) 
VALUES ('u-admin-main-001', 'admin@linkup.live', '$2b$10$Mb.KR4l9x9RT3A.g8j3BX.YsavWYa4a5/XcD9UbzQvL7jn9bXhswO', 'LinkUp 管理者', 'admin', 'https://ui-avatars.com/api/?name=Admin&background=DC2626&color=fff', 1, datetime('now'));

-- ステップ2: オーガナイザーユーザー作成
INSERT INTO users (user_id, email, password_hash, name, user_type, avatar_url, verified, created_at) 
VALUES ('u-organizer-main-001', 'organizer@linkup.live', '$2b$10$6VauxbSlpDPKHHDthU6Qa.K1Y2glUdrlKxAQkxJANBOE88WPZOlYO', 'テストイベント主催者', 'organizer', 'https://ui-avatars.com/api/?name=Organizer&background=2563EB&color=fff', 1, datetime('now'));

-- ステップ3: 一般ユーザー作成
INSERT INTO users (user_id, email, password_hash, name, user_type, avatar_url, verified, created_at) 
VALUES ('u-user-main-001', 'user@linkup.live', '$2b$10$gfNMVDIyPBgCpLgsHMcJVe63975OIwfnhJuoguK8NWSTq8fS.QuOu', '一般テストユーザー', 'participant', 'https://ui-avatars.com/api/?name=User&background=10B981&color=fff', 1, datetime('now'));

-- ステップ4: 既存ユーザー更新
UPDATE users SET user_type = 'participant', verified = 1 WHERE email = 'iwama@inre.co.jp';

-- ステップ5: オーガナイザープロフィール作成
INSERT OR IGNORE INTO organizer_profiles (organizer_id, user_id, name, description, icon_url, created_at) 
VALUES ('org-main-001', 'u-organizer-main-001', 'テストイベント主催者', 'LinkUpプラットフォームのテスト用主催者アカウントです。', 'https://ui-avatars.com/api/?name=Organizer&background=2563EB&color=fff', datetime('now'));

-- ステップ6: 確認クエリ
SELECT user_id, email, name, user_type, verified FROM users WHERE email IN ('admin@linkup.live', 'organizer@linkup.live', 'user@linkup.live', 'iwama@inre.co.jp') ORDER BY user_type DESC;
