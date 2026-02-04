-- テストユーザー (パスワードはハッシュ化されていないため、ログイン不可ですが表示用に使用)
INSERT INTO users (user_id, email, password_hash, display_name, role, avatar_url, created_at)
VALUES 
('user-1', 'admin@linkup.com', 'hashed_password_dummy', 'LinkUp Admin', 'admin', 'https://ui-avatars.com/api/?name=LinkUp+Admin&background=random', CURRENT_TIMESTAMP),
('user-2', 'organizer@linkup.com', 'hashed_password_dummy', 'イベントオーガナイザー', 'organizer', 'https://ui-avatars.com/api/?name=Event+Org&background=random', CURRENT_TIMESTAMP);

-- オーガナイザープロフィール (users作成後に挿入)
INSERT INTO organizer_profiles (organizer_id, organization_name, description, website_url, total_events_held, rating, created_at)
VALUES
('user-2', 'LinkUp Events', '公式イベントオーガナイザーです。', 'https://linkup.example.com', 10, 4.8, CURRENT_TIMESTAMP);

-- テストグループ
INSERT INTO groups (group_id, organizer_id, group_name, description, slug, cover_image_url, created_at)
VALUES 
('group-1', 'user-2', 'Tech Meetup Tokyo', 'テクノロジー愛好家のためのコミュニティです。毎月ミートアップを開催しています。', 'tech-meetup-tokyo', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', CURRENT_TIMESTAMP);

-- テストイベント 1 (募集中)
INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, created_at)
VALUES 
('event-1', 'group-1', 'user-2', 'LinkUp Launch Party 🎉', 'linkup-launch-party', 'LinkUpのリリース記念パーティーです！開発者、クリエイター、ビジネスマンが集まり、新しい繋がりを作る機会を提供します。\\n\\nドリンクと軽食を用意してお待ちしております。', 'offline', 'party', 'LinkUp Base Tokyo', '東京都渋谷区道玄坂1-1-1', datetime('now', '+7 days'), datetime('now', '+7 days', '+3 hours'), 'published', 100, CURRENT_TIMESTAMP);

-- テストイベント 2 (オンライン)
INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, online_meeting_url, start_datetime, end_datetime, status, max_attendees, created_at)
VALUES 
('event-2', 'group-1', 'user-2', 'オンラインWeb開発勉強会', 'online-web-dev-study', '初心者歓迎！Next.jsとCloudflareを使った開発について学びましょう。', 'online', 'tech', 'https://zoom.us/j/123456789', datetime('now', '+14 days'), datetime('now', '+14 days', '+2 hours'), 'published', 50, CURRENT_TIMESTAMP);

-- テストチケット
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES 
('ticket-1', 'event-1', '一般参加チケット', 'ワンドリンク付き', 1000, 80, CURRENT_TIMESTAMP),
('ticket-2', 'event-1', 'VIPチケット', 'フリードリンク + VIPエリアアクセス', 5000, 20, CURRENT_TIMESTAMP),
('ticket-3', 'event-2', '無料参加枠', 'Zoom参加URLが送付されます', 0, 50, CURRENT_TIMESTAMP);
