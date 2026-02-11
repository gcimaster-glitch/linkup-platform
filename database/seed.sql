-- ========================================
-- LinkUp Platform Seed Data
-- ========================================
-- Generated: 2026-02-11T06:02:28.207Z
-- Source: data/seed.json
-- ========================================


-- Category Images
DELETE FROM category_images;
INSERT INTO category_images (category, image_url, thumbnail_url, description) VALUES ('tech', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'テクノロジー・IT関連イベント');
INSERT INTO category_images (category, image_url, thumbnail_url, description) VALUES ('business', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'ビジネス・経営関連イベント');
INSERT INTO category_images (category, image_url, thumbnail_url, description) VALUES ('art', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'アート・デザイン関連イベント');
INSERT INTO category_images (category, image_url, thumbnail_url, description) VALUES ('music', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', '音楽・ライブイベント');
INSERT INTO category_images (category, image_url, thumbnail_url, description) VALUES ('social', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', '交流会・ネットワーキング');
INSERT INTO category_images (category, image_url, thumbnail_url, description) VALUES ('festival', 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'フェスティバル・大型イベント');
INSERT INTO category_images (category, image_url, thumbnail_url, description) VALUES ('food', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'グルメ・食イベント');
INSERT INTO category_images (category, image_url, thumbnail_url, description) VALUES ('startups', 'https://images.unsplash.com/photo-1559136555-930d72f1d300?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1559136555-930d72f1d300?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', 'スタートアップ・起業イベント');

-- Users
DELETE FROM users WHERE user_id LIKE 'usr_demo_%' OR user_id LIKE 'usr_organizer_%' OR user_id LIKE 'usr_admin_%';
INSERT INTO users (user_id, email, name, user_type, bio, verified) VALUES ('usr_demo_001', 'demo@linkup.live', 'デモユーザー', 'participant', NULL, 1);
INSERT INTO users (user_id, email, name, user_type, bio, verified) VALUES ('usr_organizer_001', 'organizer@linkup.live', 'LinkUp Official', 'organizer', 'LinkUp公式主催者アカウント', 1);
INSERT INTO users (user_id, email, name, user_type, bio, verified) VALUES ('usr_organizer_002', 'nextgen@linkup.live', 'NextGen Creators', 'organizer', '次世代クリエイターコミュニティ', 1);
INSERT INTO users (user_id, email, name, user_type, bio, verified) VALUES ('usr_admin_001', 'admin@linkup.live', '管理者', 'admin', NULL, 1);
INSERT INTO users (user_id, email, name, user_type, bio, verified) VALUES ('usr_demo_002', 'user2@linkup.live', 'テストユーザー2', 'participant', NULL, 0);

-- Venues
DELETE FROM venues WHERE venue_id LIKE 'v-%';
INSERT INTO venues (venue_id, name, address, lat, lng, capacity, layout_rows, layout_cols) VALUES ('v-1', '渋谷ストリームホール', '東京都渋谷区渋谷3-21-3', 35.6571, 139.7026, 120, 10, 12);
INSERT INTO venues (venue_id, name, address, lat, lng, capacity, layout_rows, layout_cols) VALUES ('v-2', '東京国際フォーラム', '東京都千代田区丸の内3-5-1', 35.6765, 139.7628, 400, 20, 20);
INSERT INTO venues (venue_id, name, address, lat, lng, capacity, layout_rows, layout_cols) VALUES ('v-3', 'オンライン', 'Zoom Link', NULL, NULL, 9999, NULL, NULL);

-- Events
DELETE FROM events WHERE event_id LIKE 'evt_demo_%';
INSERT INTO events (event_id, title, description, category, cover_image_url, venue_id, venue_name, venue_address, lat, lng, start_datetime, end_datetime, organizer_id, organizer_name, organizer_rating, status, max_attendees, current_attendees, is_online, tags) VALUES ('evt_demo_001', 'TECH Summit Vol.1: AI・機械学習の最前線', '<div class=''prose max-w-none''><p>AI・機械学習の最新トレンドを学べる大規模カンファレンス。業界トップエンジニアが登壇します。</p><h3>ハイライト</h3><ul><li>ChatGPT開発者による基調講演</li><li>実践的なハンズオンセッション</li><li>企業ブース展示</li></ul></div>', 'tech', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'v-2', '東京国際フォーラム', '東京都千代田区丸の内3-5-1', 35.6765, 139.7628, '2026-02-25T10:00:00+09:00', '2026-02-25T18:00:00+09:00', 'usr_organizer_001', 'LinkUp Official', 4.8, 'published', 400, 234, 0, '["AI", "機械学習", "テクノロジー"]');
INSERT INTO events (event_id, title, description, category, cover_image_url, venue_id, venue_name, venue_address, lat, lng, start_datetime, end_datetime, organizer_id, organizer_name, organizer_rating, status, max_attendees, current_attendees, is_online, tags) VALUES ('evt_demo_002', 'BUSINESS Summit Vol.1: スタートアップ成長戦略', '<div class=''prose max-w-none''><p>急成長スタートアップの経営者が語る、成長の秘訣とピボット戦略。</p></div>', 'business', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'v-1', '渋谷ストリームホール', '東京都渋谷区渋谷3-21-3', 35.6571, 139.7026, '2026-02-26T14:00:00+09:00', '2026-02-26T17:00:00+09:00', 'usr_organizer_002', 'NextGen Creators', 4.5, 'published', 120, 89, 0, '["スタートアップ", "経営", "ビジネス"]');
INSERT INTO events (event_id, title, description, category, cover_image_url, venue_id, venue_name, venue_address, lat, lng, start_datetime, end_datetime, organizer_id, organizer_name, organizer_rating, status, max_attendees, current_attendees, is_online, tags) VALUES ('evt_demo_003', 'ART Summit Vol.1: デジタルアートの未来', '<div class=''prose max-w-none''><p>NFT、メタバース時代のアート表現を探る。</p></div>', 'art', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'v-1', '渋谷ストリームホール', '東京都渋谷区渋谷3-21-3', 35.6571, 139.7026, '2026-02-27T13:00:00+09:00', '2026-02-27T16:00:00+09:00', 'usr_organizer_001', 'LinkUp Official', 4.8, 'published', 120, 67, 0, '["NFT", "デジタルアート", "メタバース"]');

-- Tickets
DELETE FROM tickets WHERE ticket_id LIKE 'tkt_demo_%';
INSERT INTO tickets (ticket_id, event_id, ticket_type, ticket_name, price, quantity, sold_count, purchase_limit, description, is_reserved_seating, status) VALUES ('tkt_demo_001_early', 'evt_demo_001', 'early_bird', '早割チケット', 8000, 100, 100, 4, '早期購入者限定の特別価格チケット（売り切れ）', 1, 'sold_out');
INSERT INTO tickets (ticket_id, event_id, ticket_type, ticket_name, price, quantity, sold_count, purchase_limit, description, is_reserved_seating, status) VALUES ('tkt_demo_001_general', 'evt_demo_001', 'general', '一般チケット', 12000, 250, 114, 4, '通常価格の一般参加チケット', 1, 'available');
INSERT INTO tickets (ticket_id, event_id, ticket_type, ticket_name, price, quantity, sold_count, purchase_limit, description, is_reserved_seating, status) VALUES ('tkt_demo_001_vip', 'evt_demo_001', 'vip', 'VIPチケット', 25000, 50, 20, 2, '最前列席確保・ランチ付き・登壇者との交流会参加権', 1, 'available');
INSERT INTO tickets (ticket_id, event_id, ticket_type, ticket_name, price, quantity, sold_count, purchase_limit, description, is_reserved_seating, status) VALUES ('tkt_demo_002_general', 'evt_demo_002', 'general', '一般チケット', 5000, 100, 79, 4, '通常参加チケット', 1, 'available');
INSERT INTO tickets (ticket_id, event_id, ticket_type, ticket_name, price, quantity, sold_count, purchase_limit, description, is_reserved_seating, status) VALUES ('tkt_demo_002_student', 'evt_demo_002', 'student', '学生チケット', 2000, 20, 10, 2, '学生限定の割引チケット（学生証確認あり）', 1, 'available');
INSERT INTO tickets (ticket_id, event_id, ticket_type, ticket_name, price, quantity, sold_count, purchase_limit, description, is_reserved_seating, status) VALUES ('tkt_demo_003_free', 'evt_demo_003', 'free', '無料チケット', 0, 120, 67, 1, '無料で参加できるチケット', 1, 'available');

-- ========================================
-- Seed data insertion complete
-- ========================================
