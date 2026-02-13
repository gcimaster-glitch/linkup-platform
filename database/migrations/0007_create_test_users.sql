-- テストユーザー登録SQL
-- 実行方法: Cloudflare Dashboard > D1 Database > linkup-db > Console で実行

-- 1. 管理者ユーザー
INSERT INTO users (
    user_id, 
    email, 
    password_hash, 
    display_name, 
    role, 
    kyc_status, 
    icon_url,
    created_at
) VALUES (
    'u-admin-main-001',
    'admin@linkup.live',
    '$2b$10$Mb.KR4l9x9RT3A.g8j3BX.YsavWYa4a5/XcD9UbzQvL7jn9bXhswO',  -- Password: Admin@2026!
    'LinkUp 管理者',
    'admin',
    'verified',
    'https://ui-avatars.com/api/?name=Admin&background=DC2626&color=fff',
    datetime('now')
);

-- 2. イベントオーガナイザーユーザー  
INSERT INTO users (
    user_id, 
    email, 
    password_hash, 
    display_name, 
    role, 
    kyc_status, 
    icon_url,
    created_at
) VALUES (
    'u-organizer-main-001',
    'organizer@linkup.live',
    '$2b$10$6VauxbSlpDPKHHDthU6Qa.K1Y2glUdrlKxAQkxJANBOE88WPZOlYO',  -- Password: Organizer@2026!
    'テストイベント主催者',
    'organizer',
    'verified',
    'https://ui-avatars.com/api/?name=Organizer&background=2563EB&color=fff',
    datetime('now')
);

-- 3. 一般ユーザー
INSERT INTO users (
    user_id, 
    email, 
    password_hash, 
    display_name, 
    role, 
    kyc_status, 
    icon_url,
    created_at
) VALUES (
    'u-user-main-001',
    'user@linkup.live',
    '$2b$10$gfNMVDIyPBgCpLgsHMcJVe63975OIwfnhJuoguK8NWSTq8fS.QuOu',  -- Password: User@2026!
    '一般テストユーザー',
    'user',
    'verified',
    'https://ui-avatars.com/api/?name=User&background=10B981&color=fff',
    datetime('now')
);

-- 4. 既存ユーザー iwama@inre.co.jp を一般ユーザーに設定
UPDATE users 
SET role = 'user', 
    kyc_status = 'verified'
WHERE email = 'iwama@inre.co.jp';

-- 5. オーガナイザープロフィール作成
INSERT OR IGNORE INTO organizer_profiles (
    organizer_id,
    user_id,
    name,
    description,
    icon_url,
    created_at
) VALUES (
    'org-main-001',
    'u-organizer-main-001',
    'テストイベント主催者',
    'LinkUpプラットフォームのテスト用主催者アカウントです。',
    'https://ui-avatars.com/api/?name=Organizer&background=2563EB&color=fff',
    datetime('now')
);

-- 確認クエリ
SELECT 
    user_id, 
    email, 
    display_name, 
    role, 
    kyc_status,
    created_at
FROM users
WHERE email IN (
    'admin@linkup.live',
    'organizer@linkup.live',
    'user@linkup.live',
    'iwama@inre.co.jp'
)
ORDER BY role DESC, created_at ASC;
