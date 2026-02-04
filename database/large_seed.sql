
-- Clean up
DELETE FROM tickets;
DELETE FROM events;
DELETE FROM groups;
DELETE FROM users;

-- Users
INSERT INTO users (user_id, email, password_hash, display_name, role, avatar_url, created_at) VALUES 
('user-admin', 'admin@linkup.com', '$2a$10$dummyhash', 'LinkUp Admin', 'admin', 'https://ui-avatars.com/api/?name=Admin', CURRENT_TIMESTAMP),
('user-org1', 'tech@org.com', '$2a$10$dummyhash', 'Tech Japan', 'organizer', 'https://ui-avatars.com/api/?name=Tech', CURRENT_TIMESTAMP),
('user-org2', 'creative@org.com', '$2a$10$dummyhash', 'Creative Tokyo', 'organizer', 'https://ui-avatars.com/api/?name=Creative', CURRENT_TIMESTAMP);

-- Groups
INSERT INTO groups (group_id, organizer_id, group_name, slug, description, category, is_public, created_at) VALUES
('group-1', 'user-org1', 'Tech Japan Community', 'tech-japan', '日本の技術力を底上げするコミュニティ', 'tech', 1, CURRENT_TIMESTAMP),
('group-2', 'user-org2', 'Creative Minds', 'creative-tokyo', 'クリエイターのための交流の場', 'art', 1, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-1', 'group-2', 'user-org2', '現代アート展 "Future"', 'slug-0', 'これはartに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'art', 'WeWork 渋谷スクランブルスクエア', '東京都渋谷区渋谷2-24-12', '2026-02-25 19:00:00', '2026-02-25 21:00:00', 'published', 47, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-1-a', 'event-1', '一般参加枠', '標準的なチケットです', 0, 26, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-2', 'group-2', 'user-org2', '週末BBQ & Networking', 'slug-1', 'これはsocialに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'social', 'WeWork 渋谷スクランブルスクエア', '東京都渋谷区渋谷2-24-12', '2026-03-26 19:00:00', '2026-03-26 21:00:00', 'published', 94, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-2-a', 'event-2', '一般参加枠', '標準的なチケットです', 3000, 22, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-2-b', 'event-2', 'VIPチケット', '優先入場と懇親会参加権', 8000, 9, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-3', 'group-1', 'user-org1', 'Web3ハッカソン Tokyo Vol.8', 'slug-2', 'これはtechに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'tech', 'WeWork 渋谷スクランブルスクエア', '東京都渋谷区渋谷2-24-12', '2026-03-21 19:00:00', '2026-03-21 21:00:00', 'published', 49, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-3-a', 'event-3', '一般参加枠', '標準的なチケットです', 5000, 44, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-4', 'group-2', 'user-org2', '写真家ポートフォリオレビュー Vol.9', 'slug-3', 'これはartに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'art', '渋谷ストリームホール', '東京都渋谷区渋谷3-21-3', '2026-02-22 19:00:00', '2026-02-22 21:00:00', 'published', 60, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-4-a', 'event-4', '一般参加枠', '標準的なチケットです', 0, 17, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-4-b', 'event-4', 'VIPチケット', '優先入場と懇親会参加権', 5000, 7, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-5', 'group-2', 'user-org2', '写真家ポートフォリオレビュー Vol.4', 'slug-4', 'これはartに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'art', '六本木ヒルズ', '東京都港区六本木6-10-1', '2026-02-17 19:00:00', '2026-02-17 21:00:00', 'published', 198, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-5-a', 'event-5', '一般参加枠', '標準的なチケットです', 5000, 39, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-6', 'group-1', 'user-org1', 'HRテックカンファレンス', 'slug-5', 'これはbusinessに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'business', '東京国際フォーラム', '東京都千代田区丸の内3-5-1', '2026-03-12 19:00:00', '2026-03-12 21:00:00', 'published', 105, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-6-a', 'event-6', '一般参加枠', '標準的なチケットです', 10000, 19, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-6-b', 'event-6', 'VIPチケット', '優先入場と懇親会参加権', 15000, 9, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-7', 'group-2', 'user-org2', '写真家ポートフォリオレビュー', 'slug-6', 'これはartに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'art', '六本木ヒルズ', '東京都港区六本木6-10-1', '2026-02-23 19:00:00', '2026-02-23 21:00:00', 'published', 177, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-7-a', 'event-7', '一般参加枠', '標準的なチケットです', 1000, 39, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-8', 'group-2', 'user-org2', 'Electronic Music Festival', 'slug-7', 'これはmusicに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'online', 'music', 'オンライン開催', 'Zoom / Google Meet', '2026-02-22 19:00:00', '2026-02-22 21:00:00', 'published', 155, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-8-a', 'event-8', '一般参加枠', '標準的なチケットです', 0, 16, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-8-b', 'event-8', 'VIPチケット', '優先入場と懇親会参加権', 5000, 9, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-9', 'group-1', 'user-org1', '起業家ネットワーキング Vol.10', 'slug-8', 'これはbusinessに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'business', '虎ノ門ヒルズフォーラム', '東京都港区虎ノ門1-23-3', '2026-02-06 19:00:00', '2026-02-06 21:00:00', 'published', 91, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-9-a', 'event-9', '一般参加枠', '標準的なチケットです', 10000, 41, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-10', 'group-1', 'user-org1', '外資系企業キャリアフォーラム', 'slug-9', 'これはcareerに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'career', '渋谷ストリームホール', '東京都渋谷区渋谷3-21-3', '2026-03-16 19:00:00', '2026-03-16 21:00:00', 'published', 62, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-10-a', 'event-10', '一般参加枠', '標準的なチケットです', 3000, 27, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-11', 'group-2', 'user-org2', 'Jazz Night Tokyo', 'slug-10', 'これはmusicに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'music', '東京国際フォーラム', '東京都千代田区丸の内3-5-1', '2026-03-28 19:00:00', '2026-03-28 21:00:00', 'published', 192, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-11-a', 'event-11', '一般参加枠', '標準的なチケットです', 1000, 24, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-12', 'group-1', 'user-org1', 'AWSアーキテクチャ設計', 'slug-11', 'これはtechに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'online', 'tech', 'オンライン開催', 'Zoom / Google Meet', '2026-02-26 19:00:00', '2026-02-26 21:00:00', 'published', 166, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-12-a', 'event-12', '一般参加枠', '標準的なチケットです', 3000, 27, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-13', 'group-1', 'user-org1', 'Python機械学習ワークショップ', 'slug-12', 'これはtechに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'tech', '東京国際フォーラム', '東京都千代田区丸の内3-5-1', '2026-03-23 19:00:00', '2026-03-23 21:00:00', 'published', 153, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-13-a', 'event-13', '一般参加枠', '標準的なチケットです', 1000, 47, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-13-b', 'event-13', 'VIPチケット', '優先入場と懇親会参加権', 6000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-14', 'group-1', 'user-org1', 'Go言語ミートアップ Vol.10', 'slug-13', 'これはtechに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'tech', '六本木ヒルズ', '東京都港区六本木6-10-1', '2026-03-28 19:00:00', '2026-03-28 21:00:00', 'published', 128, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-14-a', 'event-14', '一般参加枠', '標準的なチケットです', 10000, 33, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-15', 'group-2', 'user-org2', '写真家ポートフォリオレビュー', 'slug-14', 'これはartに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'art', '虎ノ門ヒルズフォーラム', '東京都港区虎ノ門1-23-3', '2026-02-28 19:00:00', '2026-02-28 21:00:00', 'published', 144, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-15-a', 'event-15', '一般参加枠', '標準的なチケットです', 1000, 21, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-15-b', 'event-15', 'VIPチケット', '優先入場と懇親会参加権', 6000, 5, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-16', 'group-1', 'user-org1', '外資系企業キャリアフォーラム', 'slug-15', 'これはcareerに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'career', '渋谷ストリームホール', '東京都渋谷区渋谷3-21-3', '2026-02-14 19:00:00', '2026-02-14 21:00:00', 'published', 51, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-16-a', 'event-16', '一般参加枠', '標準的なチケットです', 3000, 13, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-16-b', 'event-16', 'VIPチケット', '優先入場と懇親会参加権', 8000, 9, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-17', 'group-1', 'user-org1', 'Cloudflare Workers実践講座', 'slug-16', 'これはtechに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'tech', '秋葉原UDX', '東京都千代田区外神田4-14-1', '2026-02-22 19:00:00', '2026-02-22 21:00:00', 'published', 145, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-17-a', 'event-17', '一般参加枠', '標準的なチケットです', 5000, 41, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-18', 'group-2', 'user-org2', '国際交流パーティー', 'slug-17', 'これはsocialに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'social', '秋葉原UDX', '東京都千代田区外神田4-14-1', '2026-03-06 19:00:00', '2026-03-06 21:00:00', 'published', 90, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-18-a', 'event-18', '一般参加枠', '標準的なチケットです', 5000, 46, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-18-b', 'event-18', 'VIPチケット', '優先入場と懇親会参加権', 10000, 6, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-19', 'group-2', 'user-org2', 'Electronic Music Festival Vol.6', 'slug-18', 'これはmusicに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'music', '秋葉原UDX', '東京都千代田区外神田4-14-1', '2026-02-07 19:00:00', '2026-02-07 21:00:00', 'published', 172, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-19-a', 'event-19', '一般参加枠', '標準的なチケットです', 5000, 11, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-20', 'group-1', 'user-org1', 'Go言語ミートアップ', 'slug-19', 'これはtechに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'tech', '六本木ヒルズ', '東京都港区六本木6-10-1', '2026-02-13 19:00:00', '2026-02-13 21:00:00', 'published', 72, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-20-a', 'event-20', '一般参加枠', '標準的なチケットです', 10000, 46, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-20-b', 'event-20', 'VIPチケット', '優先入場と懇親会参加権', 15000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-21', 'group-1', 'user-org1', '起業家ネットワーキング Vol.3', 'slug-20', 'これはbusinessに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'business', '虎ノ門ヒルズフォーラム', '東京都港区虎ノ門1-23-3', '2026-03-24 19:00:00', '2026-03-24 21:00:00', 'published', 182, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-21-a', 'event-21', '一般参加枠', '標準的なチケットです', 1000, 48, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-21-b', 'event-21', 'VIPチケット', '優先入場と懇親会参加権', 6000, 6, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-22', 'group-2', 'user-org2', '現代アート展 "Future" Vol.7', 'slug-21', 'これはartに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'online', 'art', 'オンライン開催', 'Zoom / Google Meet', '2026-03-16 19:00:00', '2026-03-16 21:00:00', 'published', 50, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-22-a', 'event-22', '一般参加枠', '標準的なチケットです', 5000, 46, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-22-b', 'event-22', 'VIPチケット', '優先入場と懇親会参加権', 10000, 5, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-23', 'group-1', 'user-org1', 'スタートアップCTO対談', 'slug-22', 'これはtechに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'tech', '六本木ヒルズ', '東京都港区六本木6-10-1', '2026-02-11 19:00:00', '2026-02-11 21:00:00', 'published', 92, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-23-a', 'event-23', '一般参加枠', '標準的なチケットです', 3000, 48, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-24', 'group-1', 'user-org1', 'エンジニア転職フェア', 'slug-23', 'これはcareerに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'career', '渋谷ストリームホール', '東京都渋谷区渋谷3-21-3', '2026-02-05 19:00:00', '2026-02-05 21:00:00', 'published', 176, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-24-a', 'event-24', '一般参加枠', '標準的なチケットです', 1000, 23, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-24-b', 'event-24', 'VIPチケット', '優先入場と懇親会参加権', 6000, 7, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-25', 'group-1', 'user-org1', 'エンジニア転職フェア', 'slug-24', 'これはcareerに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'online', 'career', 'オンライン開催', 'Zoom / Google Meet', '2026-02-10 19:00:00', '2026-02-10 21:00:00', 'published', 35, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-25-a', 'event-25', '一般参加枠', '標準的なチケットです', 5000, 42, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-26', 'group-2', 'user-org2', 'デジタルアート・インスタレーション', 'slug-25', 'これはartに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'art', 'WeWork 渋谷スクランブルスクエア', '東京都渋谷区渋谷2-24-12', '2026-02-03 19:00:00', '2026-02-03 21:00:00', 'published', 136, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-26-a', 'event-26', '一般参加枠', '標準的なチケットです', 5000, 23, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-27', 'group-1', 'user-org1', '外資系企業キャリアフォーラム Vol.2', 'slug-26', 'これはcareerに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'career', '虎ノ門ヒルズフォーラム', '東京都港区虎ノ門1-23-3', '2026-02-19 19:00:00', '2026-02-19 21:00:00', 'published', 56, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-27-a', 'event-27', '一般参加枠', '標準的なチケットです', 1000, 28, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-27-b', 'event-27', 'VIPチケット', '優先入場と懇親会参加権', 6000, 6, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-28', 'group-1', 'user-org1', 'HRテックカンファレンス Vol.9', 'slug-27', 'これはbusinessに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'business', '秋葉原UDX', '東京都千代田区外神田4-14-1', '2026-03-19 19:00:00', '2026-03-19 21:00:00', 'published', 142, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-28-a', 'event-28', '一般参加枠', '標準的なチケットです', 0, 24, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-28-b', 'event-28', 'VIPチケット', '優先入場と懇親会参加権', 5000, 9, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-29', 'group-1', 'user-org1', 'Go言語ミートアップ', 'slug-28', 'これはtechに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'tech', '東京国際フォーラム', '東京都千代田区丸の内3-5-1', '2026-03-15 19:00:00', '2026-03-15 21:00:00', 'published', 180, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-29-a', 'event-29', '一般参加枠', '標準的なチケットです', 10000, 18, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-29-b', 'event-29', 'VIPチケット', '優先入場と懇親会参加権', 15000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-30', 'group-2', 'user-org2', '写真家ポートフォリオレビュー Vol.8', 'slug-29', 'これはartに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'online', 'art', 'オンライン開催', 'Zoom / Google Meet', '2026-03-10 19:00:00', '2026-03-10 21:00:00', 'published', 184, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-30-a', 'event-30', '一般参加枠', '標準的なチケットです', 5000, 32, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-31', 'group-1', 'user-org1', 'Web3ハッカソン Tokyo Vol.3', 'slug-30', 'これはtechに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'tech', '虎ノ門ヒルズフォーラム', '東京都港区虎ノ門1-23-3', '2026-02-17 19:00:00', '2026-02-17 21:00:00', 'published', 162, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-31-a', 'event-31', '一般参加枠', '標準的なチケットです', 3000, 29, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-32', 'group-2', 'user-org2', '写真家ポートフォリオレビュー Vol.6', 'slug-31', 'これはartに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'art', '渋谷ストリームホール', '東京都渋谷区渋谷3-21-3', '2026-04-01 19:00:00', '2026-04-01 21:00:00', 'published', 112, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-32-a', 'event-32', '一般参加枠', '標準的なチケットです', 5000, 28, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-33', 'group-2', 'user-org2', 'Underground DJ Event Vol.3', 'slug-32', 'これはmusicに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'music', '虎ノ門ヒルズフォーラム', '東京都港区虎ノ門1-23-3', '2026-02-02 19:00:00', '2026-02-02 21:00:00', 'published', 122, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-33-a', 'event-33', '一般参加枠', '標準的なチケットです', 0, 44, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-34', 'group-1', 'user-org1', '資金調達ピッチイベント Vol.10', 'slug-33', 'これはbusinessに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'offline', 'business', '秋葉原UDX', '東京都千代田区外神田4-14-1', '2026-03-18 19:00:00', '2026-03-18 21:00:00', 'published', 38, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-34-a', 'event-34', '一般参加枠', '標準的なチケットです', 1000, 13, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('event-35', 'group-2', 'user-org2', 'Underground DJ Event Vol.10', 'slug-34', 'これはmusicに関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', 'online', 'music', 'オンライン開催', 'Zoom / Google Meet', '2026-02-13 19:00:00', '2026-02-13 21:00:00', 'published', 105, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&w=1000&q=80', CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-35-a', 'event-35', '一般参加枠', '標準的なチケットです', 3000, 12, CURRENT_TIMESTAMP);

