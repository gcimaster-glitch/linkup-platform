
-- 完全初期化
DELETE FROM order_tickets;
DELETE FROM orders;
DELETE FROM tickets;
DELETE FROM events;
DELETE FROM groups;
DELETE FROM organizer_profiles;
DELETE FROM users;

-- 管理者・主催者作成
INSERT INTO users (user_id, email, password_hash, display_name, role, avatar_url, created_at) VALUES 
('user-admin', 'admin@linkup.com', '$2a$10$dummyhash', 'LinkUp Admin', 'admin', 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff', CURRENT_TIMESTAMP),
('user-org1', 'tech@org.com', '$2a$10$dummyhash', 'Tech Giants', 'organizer', 'https://ui-avatars.com/api/?name=Tech&background=1a73e8&color=fff', CURRENT_TIMESTAMP);

INSERT INTO organizer_profiles (organizer_id, organization_name, total_events_held, rating) VALUES
('user-org1', 'Tech Giants Inc.', 100, 4.9);

-- グループ作成
INSERT INTO groups (group_id, organizer_id, group_name, slug, description, category, is_public, cover_image_url) VALUES
('group-1', 'user-org1', 'Tech Japan Community', 'tech-japan', '日本最大級のテックコミュニティ', 'tech', 1, 'https://images.unsplash.com/photo-1519389950476-2953d6a30406?ixlib=rb-4.0.3&w=800&q=80');

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-000', 'group-1', 'user-org1', 'LinkUp Tech Summit Vol.1', 'slug-0', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Tech領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'tech', '東京グランドホール', '東京都心部 1-1-1', '2026-02-03 19:00:00', '2026-02-03 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 1, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-0-a', 'evt-000', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-0-b', 'evt-000', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-001', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.2', 'slug-1', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Business領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'business', '大阪グランドホール', '大阪都心部 1-1-1', '2026-02-04 19:00:00', '2026-02-04 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 1, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-1-a', 'evt-001', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-1-b', 'evt-001', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-002', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.3', 'slug-2', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Music領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'music', '福岡グランドホール', '福岡都心部 1-1-1', '2026-02-05 19:00:00', '2026-02-05 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 1, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-2-a', 'evt-002', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-2-b', 'evt-002', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-003', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.4', 'slug-3', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Art領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'art', '名古屋グランドホール', '名古屋都心部 1-1-1', '2026-02-06 19:00:00', '2026-02-06 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 1, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-3-a', 'evt-003', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-3-b', 'evt-003', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-004', 'group-1', 'user-org1', 'LinkUp Social Summit Vol.5', 'slug-4', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Social領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'online', 'social', 'Zoom', 'オンライン開催', '2026-02-07 19:00:00', '2026-02-07 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 1, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-4-a', 'evt-004', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-4-b', 'evt-004', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-005', 'group-1', 'user-org1', 'LinkUp Tech Summit Vol.6', 'slug-5', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Tech領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'tech', '東京グランドホール', '東京都心部 1-1-1', '2026-02-08 19:00:00', '2026-02-08 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 1, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-5-a', 'evt-005', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-5-b', 'evt-005', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-006', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.7', 'slug-6', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Business領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'business', '大阪グランドホール', '大阪都心部 1-1-1', '2026-02-09 19:00:00', '2026-02-09 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-6-a', 'evt-006', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-6-b', 'evt-006', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-007', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.8', 'slug-7', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Music領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'music', '福岡グランドホール', '福岡都心部 1-1-1', '2026-02-10 19:00:00', '2026-02-10 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-7-a', 'evt-007', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-7-b', 'evt-007', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-008', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.9', 'slug-8', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Art領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'art', '名古屋グランドホール', '名古屋都心部 1-1-1', '2026-02-11 19:00:00', '2026-02-11 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-8-a', 'evt-008', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-8-b', 'evt-008', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-009', 'group-1', 'user-org1', 'LinkUp Social Summit Vol.10', 'slug-9', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Social領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'online', 'social', 'Zoom', 'オンライン開催', '2026-02-12 19:00:00', '2026-02-12 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-9-a', 'evt-009', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-9-b', 'evt-009', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-010', 'group-1', 'user-org1', 'LinkUp Tech Summit Vol.11', 'slug-10', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Tech領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'tech', '東京グランドホール', '東京都心部 1-1-1', '2026-02-13 19:00:00', '2026-02-13 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-10-a', 'evt-010', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-10-b', 'evt-010', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-011', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.12', 'slug-11', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Business領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'business', '大阪グランドホール', '大阪都心部 1-1-1', '2026-02-14 19:00:00', '2026-02-14 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-11-a', 'evt-011', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-11-b', 'evt-011', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-012', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.13', 'slug-12', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Music領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'music', '福岡グランドホール', '福岡都心部 1-1-1', '2026-02-15 19:00:00', '2026-02-15 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-12-a', 'evt-012', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-12-b', 'evt-012', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-013', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.14', 'slug-13', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Art領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'art', '名古屋グランドホール', '名古屋都心部 1-1-1', '2026-02-16 19:00:00', '2026-02-16 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-13-a', 'evt-013', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-13-b', 'evt-013', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-014', 'group-1', 'user-org1', 'LinkUp Social Summit Vol.15', 'slug-14', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Social領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'online', 'social', 'Zoom', 'オンライン開催', '2026-02-17 19:00:00', '2026-02-17 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-14-a', 'evt-014', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-14-b', 'evt-014', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-015', 'group-1', 'user-org1', 'LinkUp Tech Summit Vol.16', 'slug-15', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Tech領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'tech', '東京グランドホール', '東京都心部 1-1-1', '2026-02-18 19:00:00', '2026-02-18 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-15-a', 'evt-015', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-15-b', 'evt-015', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-016', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.17', 'slug-16', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Business領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'business', '大阪グランドホール', '大阪都心部 1-1-1', '2026-02-19 19:00:00', '2026-02-19 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-16-a', 'evt-016', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-16-b', 'evt-016', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-017', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.18', 'slug-17', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Music領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'music', '福岡グランドホール', '福岡都心部 1-1-1', '2026-02-20 19:00:00', '2026-02-20 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-17-a', 'evt-017', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-17-b', 'evt-017', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-018', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.19', 'slug-18', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Art領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'art', '名古屋グランドホール', '名古屋都心部 1-1-1', '2026-02-21 19:00:00', '2026-02-21 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-18-a', 'evt-018', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-18-b', 'evt-018', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-019', 'group-1', 'user-org1', 'LinkUp Social Summit Vol.20', 'slug-19', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Social領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'online', 'social', 'Zoom', 'オンライン開催', '2026-02-22 19:00:00', '2026-02-22 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-19-a', 'evt-019', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-19-b', 'evt-019', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-020', 'group-1', 'user-org1', 'LinkUp Tech Summit Vol.21', 'slug-20', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Tech領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'tech', '東京グランドホール', '東京都心部 1-1-1', '2026-02-23 19:00:00', '2026-02-23 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-20-a', 'evt-020', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-20-b', 'evt-020', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-021', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.22', 'slug-21', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Business領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'business', '大阪グランドホール', '大阪都心部 1-1-1', '2026-02-24 19:00:00', '2026-02-24 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-21-a', 'evt-021', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-21-b', 'evt-021', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-022', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.23', 'slug-22', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Music領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'music', '福岡グランドホール', '福岡都心部 1-1-1', '2026-02-25 19:00:00', '2026-02-25 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-22-a', 'evt-022', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-22-b', 'evt-022', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-023', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.24', 'slug-23', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Art領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'art', '名古屋グランドホール', '名古屋都心部 1-1-1', '2026-02-26 19:00:00', '2026-02-26 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-23-a', 'evt-023', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-23-b', 'evt-023', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-024', 'group-1', 'user-org1', 'LinkUp Social Summit Vol.25', 'slug-24', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Social領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'online', 'social', 'Zoom', 'オンライン開催', '2026-02-27 19:00:00', '2026-02-27 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-24-a', 'evt-024', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-24-b', 'evt-024', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-025', 'group-1', 'user-org1', 'LinkUp Tech Summit Vol.26', 'slug-25', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Tech領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'tech', '東京グランドホール', '東京都心部 1-1-1', '2026-02-28 19:00:00', '2026-02-28 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-25-a', 'evt-025', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-25-b', 'evt-025', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-026', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.27', 'slug-26', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Business領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'business', '大阪グランドホール', '大阪都心部 1-1-1', '2026-03-01 19:00:00', '2026-03-01 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-26-a', 'evt-026', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-26-b', 'evt-026', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-027', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.28', 'slug-27', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Music領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'music', '福岡グランドホール', '福岡都心部 1-1-1', '2026-03-02 19:00:00', '2026-03-02 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-27-a', 'evt-027', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-27-b', 'evt-027', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-028', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.29', 'slug-28', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Art領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'offline', 'art', '名古屋グランドホール', '名古屋都心部 1-1-1', '2026-03-03 19:00:00', '2026-03-03 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-28-a', 'evt-028', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-28-b', 'evt-028', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('evt-029', 'group-1', 'user-org1', 'LinkUp Social Summit Vol.30', 'slug-29', '
<div class=''event-detail-content''>
    <p class=''lead''>業界のトップランナーが集う、Social領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
', 'online', 'social', 'Zoom', 'オンライン開催', '2026-03-04 19:00:00', '2026-03-04 22:00:00', 'published', 200, 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 0, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-29-a', 'evt-029', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-29-b', 'evt-029', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);

