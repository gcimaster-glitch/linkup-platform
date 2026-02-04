
-- Cleanup
DELETE FROM order_tickets;
DELETE FROM orders;
DELETE FROM tickets;
DELETE FROM events;
DELETE FROM groups;
DELETE FROM organizer_profiles;
DELETE FROM users;

-- Users
INSERT INTO users (user_id, email, password_hash, display_name, role, avatar_url, created_at) VALUES 
('user-admin', 'admin@linkup.com', '$2a$10$dummyhash', 'LinkUp Admin', 'admin', 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff', CURRENT_TIMESTAMP),
('user-org1', 'tech@org.com', '$2a$10$dummyhash', 'Tech Giants', 'organizer', 'https://ui-avatars.com/api/?name=Tech&background=1a73e8&color=fff', CURRENT_TIMESTAMP);

-- Groups
INSERT INTO groups (group_id, organizer_id, group_name, slug, description, category, is_public, cover_image_url) VALUES
('group-1', 'user-org1', 'Tech Japan Community', 'tech-japan', '日本の技術力を底上げするコミュニティ', 'tech', 1, 'https://images.unsplash.com/photo-1519389950476-2953d6a30406?ixlib=rb-4.0.3&w=800&q=80');


INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-0', 'group-1', 'user-org1', 'LinkUp Food Summit Vol.0', 'slug-0', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'food', '福岡カンファレンスセンター', '福岡', '2026-02-04 19:00:00', '2026-03-25 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&w=1200&q=80', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-0-1', 'event-0', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-0-2', 'event-0', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-1', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.1', 'slug-1', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'music', '名古屋カンファレンスセンター', '名古屋', '2026-02-02 19:00:00', '2026-02-18 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1459749411177-734a649eae77?ixlib=rb-4.0.3&w=1200&q=80', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-1-1', 'event-1', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-1-2', 'event-1', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-2', 'group-1', 'user-org1', 'LinkUp Tech Summit Vol.2', 'slug-2', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'tech', '名古屋カンファレンスセンター', '名古屋', '2026-02-12 19:00:00', '2026-03-07 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1519389950476-2953d6a30406?ixlib=rb-4.0.3&w=1200&q=80', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-2-1', 'event-2', '一般参加', '標準チケット', 0, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-2-2', 'event-2', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-3', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.3', 'slug-3', '
<div class=''event-details''>
    <p class=''lead''>ビジネスを加速させるための、上質な出会いと学びの場。</p>
    
    <h3>🤝 このイベントで得られるもの</h3>
    <ul class=''feature-list''>
        <li>決裁者クラスとのネットワーキング</li>
        <li>最新のマーケティング事例の共有</li>
        <li>事業提携のきっかけ作り</li>
    </ul>

    <h3>👤 登壇者プロフィール</h3>
    <p><strong>田中 健太郎</strong><br>株式会社LinkUp 代表取締役CEO。シリアルアントレプレナーとして数々の事業を売却。</p>

    <h3>⚠️ 参加条件</h3>
    <p>法人企業の役員、または事業責任者の方限定とさせていただきます。</p>
</div>
', 'offline', 'business', '福岡カンファレンスセンター', '福岡', '2026-03-11 19:00:00', '2026-03-15 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&w=1200&q=80', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-3-1', 'event-3', '一般参加', '標準チケット', 0, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-3-2', 'event-3', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-4', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.4', 'slug-4', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'art', '東京カンファレンスセンター', '東京', '2026-03-26 19:00:00', '2026-02-26 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1501084881629-7a19a6216b1e?ixlib=rb-4.0.3&w=1200&q=80', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-4-1', 'event-4', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-4-2', 'event-4', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-5', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.5', 'slug-5', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'online', 'art', 'Zoom / Meet', 'オンライン', '2026-03-31 19:00:00', '2026-02-05 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-5-1', 'event-5', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-5-2', 'event-5', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-6', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.6', 'slug-6', '
<div class=''event-details''>
    <p class=''lead''>ビジネスを加速させるための、上質な出会いと学びの場。</p>
    
    <h3>🤝 このイベントで得られるもの</h3>
    <ul class=''feature-list''>
        <li>決裁者クラスとのネットワーキング</li>
        <li>最新のマーケティング事例の共有</li>
        <li>事業提携のきっかけ作り</li>
    </ul>

    <h3>👤 登壇者プロフィール</h3>
    <p><strong>田中 健太郎</strong><br>株式会社LinkUp 代表取締役CEO。シリアルアントレプレナーとして数々の事業を売却。</p>

    <h3>⚠️ 参加条件</h3>
    <p>法人企業の役員、または事業責任者の方限定とさせていただきます。</p>
</div>
', 'online', 'business', 'Zoom / Meet', 'オンライン', '2026-03-27 19:00:00', '2026-03-15 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-6-1', 'event-6', '一般参加', '標準チケット', 0, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-6-2', 'event-6', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-7', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.7', 'slug-7', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'music', '札幌カンファレンスセンター', '札幌', '2026-03-15 19:00:00', '2026-02-02 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1514525253440-b393452e3383?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-7-1', 'event-7', '一般参加', '標準チケット', 0, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-7-2', 'event-7', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-8', 'group-1', 'user-org1', 'LinkUp Food Summit Vol.8', 'slug-8', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'food', '大阪カンファレンスセンター', '大阪', '2026-02-22 19:00:00', '2026-02-12 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-8-1', 'event-8', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-8-2', 'event-8', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-9', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.9', 'slug-9', '
<div class=''event-details''>
    <p class=''lead''>ビジネスを加速させるための、上質な出会いと学びの場。</p>
    
    <h3>🤝 このイベントで得られるもの</h3>
    <ul class=''feature-list''>
        <li>決裁者クラスとのネットワーキング</li>
        <li>最新のマーケティング事例の共有</li>
        <li>事業提携のきっかけ作り</li>
    </ul>

    <h3>👤 登壇者プロフィール</h3>
    <p><strong>田中 健太郎</strong><br>株式会社LinkUp 代表取締役CEO。シリアルアントレプレナーとして数々の事業を売却。</p>

    <h3>⚠️ 参加条件</h3>
    <p>法人企業の役員、または事業責任者の方限定とさせていただきます。</p>
</div>
', 'offline', 'business', '東京カンファレンスセンター', '東京', '2026-02-24 19:00:00', '2026-03-25 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-9-1', 'event-9', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-9-2', 'event-9', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-10', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.10', 'slug-10', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'online', 'music', 'Zoom / Meet', 'オンライン', '2026-02-03 19:00:00', '2026-02-08 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-10-1', 'event-10', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-10-2', 'event-10', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-11', 'group-1', 'user-org1', 'LinkUp Food Summit Vol.11', 'slug-11', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'food', '札幌カンファレンスセンター', '札幌', '2026-02-10 19:00:00', '2026-02-13 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-11-1', 'event-11', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-11-2', 'event-11', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-12', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.12', 'slug-12', '
<div class=''event-details''>
    <p class=''lead''>ビジネスを加速させるための、上質な出会いと学びの場。</p>
    
    <h3>🤝 このイベントで得られるもの</h3>
    <ul class=''feature-list''>
        <li>決裁者クラスとのネットワーキング</li>
        <li>最新のマーケティング事例の共有</li>
        <li>事業提携のきっかけ作り</li>
    </ul>

    <h3>👤 登壇者プロフィール</h3>
    <p><strong>田中 健太郎</strong><br>株式会社LinkUp 代表取締役CEO。シリアルアントレプレナーとして数々の事業を売却。</p>

    <h3>⚠️ 参加条件</h3>
    <p>法人企業の役員、または事業責任者の方限定とさせていただきます。</p>
</div>
', 'online', 'business', 'Zoom / Meet', 'オンライン', '2026-02-24 19:00:00', '2026-02-20 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-12-1', 'event-12', '一般参加', '標準チケット', 0, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-12-2', 'event-12', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-13', 'group-1', 'user-org1', 'LinkUp Food Summit Vol.13', 'slug-13', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'online', 'food', 'Zoom / Meet', 'オンライン', '2026-02-06 19:00:00', '2026-02-03 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-13-1', 'event-13', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-13-2', 'event-13', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-14', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.14', 'slug-14', '
<div class=''event-details''>
    <p class=''lead''>ビジネスを加速させるための、上質な出会いと学びの場。</p>
    
    <h3>🤝 このイベントで得られるもの</h3>
    <ul class=''feature-list''>
        <li>決裁者クラスとのネットワーキング</li>
        <li>最新のマーケティング事例の共有</li>
        <li>事業提携のきっかけ作り</li>
    </ul>

    <h3>👤 登壇者プロフィール</h3>
    <p><strong>田中 健太郎</strong><br>株式会社LinkUp 代表取締役CEO。シリアルアントレプレナーとして数々の事業を売却。</p>

    <h3>⚠️ 参加条件</h3>
    <p>法人企業の役員、または事業責任者の方限定とさせていただきます。</p>
</div>
', 'offline', 'business', '東京カンファレンスセンター', '東京', '2026-03-18 19:00:00', '2026-03-25 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-14-1', 'event-14', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-14-2', 'event-14', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-15', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.15', 'slug-15', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'art', '札幌カンファレンスセンター', '札幌', '2026-02-18 19:00:00', '2026-02-02 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1501084881629-7a19a6216b1e?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-15-1', 'event-15', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-15-2', 'event-15', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-16', 'group-1', 'user-org1', 'LinkUp Food Summit Vol.16', 'slug-16', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'food', '大阪カンファレンスセンター', '大阪', '2026-02-04 19:00:00', '2026-03-18 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-16-1', 'event-16', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-16-2', 'event-16', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-17', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.17', 'slug-17', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'art', '名古屋カンファレンスセンター', '名古屋', '2026-02-23 19:00:00', '2026-03-02 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1501084881629-7a19a6216b1e?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-17-1', 'event-17', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-17-2', 'event-17', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-18', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.18', 'slug-18', '
<div class=''event-details''>
    <p class=''lead''>ビジネスを加速させるための、上質な出会いと学びの場。</p>
    
    <h3>🤝 このイベントで得られるもの</h3>
    <ul class=''feature-list''>
        <li>決裁者クラスとのネットワーキング</li>
        <li>最新のマーケティング事例の共有</li>
        <li>事業提携のきっかけ作り</li>
    </ul>

    <h3>👤 登壇者プロフィール</h3>
    <p><strong>田中 健太郎</strong><br>株式会社LinkUp 代表取締役CEO。シリアルアントレプレナーとして数々の事業を売却。</p>

    <h3>⚠️ 参加条件</h3>
    <p>法人企業の役員、または事業責任者の方限定とさせていただきます。</p>
</div>
', 'online', 'business', 'Zoom / Meet', 'オンライン', '2026-02-11 19:00:00', '2026-03-10 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-18-1', 'event-18', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-18-2', 'event-18', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-19', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.19', 'slug-19', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'music', '札幌カンファレンスセンター', '札幌', '2026-03-22 19:00:00', '2026-02-16 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1514525253440-b393452e3383?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-19-1', 'event-19', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-19-2', 'event-19', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-20', 'group-1', 'user-org1', 'LinkUp Tech Summit Vol.20', 'slug-20', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'online', 'tech', 'Zoom / Meet', 'オンライン', '2026-02-02 19:00:00', '2026-03-23 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1519389950476-2953d6a30406?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-20-1', 'event-20', '一般参加', '標準チケット', 0, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-20-2', 'event-20', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-21', 'group-1', 'user-org1', 'LinkUp Food Summit Vol.21', 'slug-21', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'online', 'food', 'Zoom / Meet', 'オンライン', '2026-02-10 19:00:00', '2026-03-16 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-21-1', 'event-21', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-21-2', 'event-21', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-22', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.22', 'slug-22', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'music', '東京カンファレンスセンター', '東京', '2026-02-13 19:00:00', '2026-02-03 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-22-1', 'event-22', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-22-2', 'event-22', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-23', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.23', 'slug-23', '
<div class=''event-details''>
    <p class=''lead''>ビジネスを加速させるための、上質な出会いと学びの場。</p>
    
    <h3>🤝 このイベントで得られるもの</h3>
    <ul class=''feature-list''>
        <li>決裁者クラスとのネットワーキング</li>
        <li>最新のマーケティング事例の共有</li>
        <li>事業提携のきっかけ作り</li>
    </ul>

    <h3>👤 登壇者プロフィール</h3>
    <p><strong>田中 健太郎</strong><br>株式会社LinkUp 代表取締役CEO。シリアルアントレプレナーとして数々の事業を売却。</p>

    <h3>⚠️ 参加条件</h3>
    <p>法人企業の役員、または事業責任者の方限定とさせていただきます。</p>
</div>
', 'offline', 'business', '名古屋カンファレンスセンター', '名古屋', '2026-03-24 19:00:00', '2026-03-28 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-23-1', 'event-23', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-23-2', 'event-23', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-24', 'group-1', 'user-org1', 'LinkUp Business Summit Vol.24', 'slug-24', '
<div class=''event-details''>
    <p class=''lead''>ビジネスを加速させるための、上質な出会いと学びの場。</p>
    
    <h3>🤝 このイベントで得られるもの</h3>
    <ul class=''feature-list''>
        <li>決裁者クラスとのネットワーキング</li>
        <li>最新のマーケティング事例の共有</li>
        <li>事業提携のきっかけ作り</li>
    </ul>

    <h3>👤 登壇者プロフィール</h3>
    <p><strong>田中 健太郎</strong><br>株式会社LinkUp 代表取締役CEO。シリアルアントレプレナーとして数々の事業を売却。</p>

    <h3>⚠️ 参加条件</h3>
    <p>法人企業の役員、または事業責任者の方限定とさせていただきます。</p>
</div>
', 'offline', 'business', '名古屋カンファレンスセンター', '名古屋', '2026-03-08 19:00:00', '2026-03-30 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-24-1', 'event-24', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-24-2', 'event-24', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-25', 'group-1', 'user-org1', 'LinkUp Music Summit Vol.25', 'slug-25', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'music', '名古屋カンファレンスセンター', '名古屋', '2026-02-15 19:00:00', '2026-02-15 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1459749411177-734a649eae77?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-25-1', 'event-25', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-25-2', 'event-25', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-26', 'group-1', 'user-org1', 'LinkUp Food Summit Vol.26', 'slug-26', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'food', '福岡カンファレンスセンター', '福岡', '2026-02-21 19:00:00', '2026-02-03 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-26-1', 'event-26', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-26-2', 'event-26', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-27', 'group-1', 'user-org1', 'LinkUp Tech Summit Vol.27', 'slug-27', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'tech', '大阪カンファレンスセンター', '大阪', '2026-02-13 19:00:00', '2026-02-27 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-27-1', 'event-27', '一般参加', '標準チケット', 0, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-27-2', 'event-27', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-28', 'group-1', 'user-org1', 'LinkUp Food Summit Vol.28', 'slug-28', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'offline', 'food', '福岡カンファレンスセンター', '福岡', '2026-02-18 19:00:00', '2026-02-15 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-28-1', 'event-28', '一般参加', '標準チケット', 1000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-28-2', 'event-28', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-29', 'group-1', 'user-org1', 'LinkUp Art Summit Vol.29', 'slug-29', '
<div class=''event-details''>
    <p class=''lead''>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class=''feature-list''>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class=''timetable''>
        <p><strong>19:00</strong> - 開場・ネットワーキング</p>
        <p><strong>19:30</strong> - セッション1: Next.js App Routerの勘所</p>
        <p><strong>20:15</strong> - セッション2: Cloudflare Workersでのエッジコンピューティング</p>
        <p><strong>21:00</strong> - 懇親会（ピザ・ドリンクあり）</p>
    </div>

    <h3>🎒 持ち物</h3>
    <ul>
        <li>名刺（2枚以上）</li>
        <li>ノートPC（ハンズオン参加者のみ）</li>
    </ul>
</div>
', 'online', 'art', 'Zoom / Meet', 'オンライン', '2026-02-14 19:00:00', '2026-02-14 21:00:00', 'published', 100, 'https://images.unsplash.com/photo-1561214115-f41a365d7964?ixlib=rb-4.0.3&w=1200&q=80', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-29-1', 'event-29', '一般参加', '標準チケット', 3000, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-29-2', 'event-29', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);

