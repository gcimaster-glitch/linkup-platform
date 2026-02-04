
-- Initialization
DELETE FROM order_tickets;
DELETE FROM orders;
DELETE FROM tickets;
DELETE FROM events;
DELETE FROM groups;
DELETE FROM organizer_profiles;
DELETE FROM users;

-- Users
INSERT INTO users (user_id, email, password_hash, display_name, role, avatar_url, created_at) VALUES 
('user-admin', 'admin@linkup.com', '$2a$10$dummyhash', 'LinkUp Admin', 'admin', 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff', CURRENT_TIMESTAMP),
('user-org1', 'tech@org.com', '$2a$10$dummyhash', 'Tech Giants', 'organizer', 'https://ui-avatars.com/api/?name=Tech&background=1a73e8&color=fff', CURRENT_TIMESTAMP),
('user-org2', 'art@org.com', '$2a$10$dummyhash', 'Creative Arts', 'organizer', 'https://ui-avatars.com/api/?name=Art&background=e91e63&color=fff', CURRENT_TIMESTAMP);

INSERT INTO organizer_profiles (organizer_id, organization_name, total_events_held, rating) VALUES
('user-org1', 'Tech Giants Inc.', 42, 4.8),
('user-org2', 'Creative Arts Tokyo', 15, 4.5);

-- Groups
INSERT INTO groups (group_id, organizer_id, group_name, slug, description, category, is_public, cover_image_url) VALUES
('group-1', 'user-org1', 'Tech Japan Community', 'tech-japan', '日本の技術力を底上げするコミュニティ', 'tech', 1, 'https://images.unsplash.com/photo-1519389950476-2953d6a30406?ixlib=rb-4.0.3&w=800&q=80'),
('group-2', 'user-org2', 'Tokyo Culture Club', 'tokyo-culture', '東京のカルチャーを発信する集団', 'art', 1, 'https://images.unsplash.com/photo-1514525253440-b393452e3383?ixlib=rb-4.0.3&w=800&q=80');

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-1', 'group-1', 'user-org1', 'Next.js Conf Tokyo 2026', 'slug-pre-0', '
<p class="lead">業界の最前線を走るリーダーたちが集結。未来を創る2日間。</p>
<h3>🔥 セッションの見どころ</h3>
<p>今年のテーマは「<strong>Convergence (融合)</strong>」。AIと人間の融合、デジタルとアナログの融合、そして組織と個人の融合について深く議論します。</p>
<h3>⏰ タイムテーブル</h3>
<ul class="timeline">
    <li><strong>13:00</strong> - 開場・受付開始</li>
    <li><strong>13:30</strong> - オープニングキーノート: 「2030年の世界」</li>
    <li><strong>14:30</strong> - パネルディスカッション A/B</li>
    <li><strong>16:00</strong> - ネットワーキングブレイク ☕</li>
    <li><strong>18:00</strong> - アフターパーティー (別途チケット必要)</li>
</ul>
<h3>🎤 主な登壇者</h3>
<ul>
    <li>佐藤 健 (Tech Corp CEO)</li>
    <li>鈴木 美咲 (Design Studio 代表)</li>
</ul>
', 'offline', 'tech', '東京国際フォーラム', '東京国際フォーラム', '2026-03-02 19:00:00', '2026-03-02 22:00:00', 'published', 195, 'https://images.unsplash.com/photo-1519389950476-2953d6a30406?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=0', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-0-1', 'event-premium-1', '一般参加枠', '標準チケット', 5000, 68, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-0-2', 'event-premium-1', 'VIP/プレミアム', '特典付きチケット', 10000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-2', 'group-1', 'user-org1', 'Startup Pitch Night Vol.24', 'slug-pre-1', '
<p class="lead">業界の最前線を走るリーダーたちが集結。未来を創る2日間。</p>
<h3>🔥 セッションの見どころ</h3>
<p>今年のテーマは「<strong>Convergence (融合)</strong>」。AIと人間の融合、デジタルとアナログの融合、そして組織と個人の融合について深く議論します。</p>
<h3>⏰ タイムテーブル</h3>
<ul class="timeline">
    <li><strong>13:00</strong> - 開場・受付開始</li>
    <li><strong>13:30</strong> - オープニングキーノート: 「2030年の世界」</li>
    <li><strong>14:30</strong> - パネルディスカッション A/B</li>
    <li><strong>16:00</strong> - ネットワーキングブレイク ☕</li>
    <li><strong>18:00</strong> - アフターパーティー (別途チケット必要)</li>
</ul>
<h3>🎤 主な登壇者</h3>
<ul>
    <li>佐藤 健 (Tech Corp CEO)</li>
    <li>鈴木 美咲 (Design Studio 代表)</li>
</ul>
', 'offline', 'business', 'WeWork 渋谷', 'WeWork 渋谷', '2026-03-04 19:00:00', '2026-03-04 22:00:00', 'published', 238, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=1', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-1-1', 'event-premium-2', '一般参加枠', '標準チケット', 2000, 73, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-1-2', 'event-premium-2', 'VIP/プレミアム', '特典付きチケット', 4000, 20, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-3', 'group-2', 'user-org2', 'AI Art Exhibition "Genesis"', 'slug-pre-2', '
<p class="lead">最高の音楽と美味しいお酒で、特別な一夜を。</p>
<h3>🍸 Event Highlights</h3>
<p>東京の夜景を一望できるルーフトップバーで開催。特別なカクテルと、厳選されたDJラインナップがお待ちしています。</p>
<ul>
    <li>フリードリンク (2時間制)</li>
    <li>立食ビュッフェスタイル</li>
    <li>シークレットゲストDJ登場予定</li>
</ul>
<h3>👗 ドレスコード</h3>
<p>スマートカジュアル（ビーチサンダル等はご遠慮ください）</p>
', 'offline', 'art', '六本木ヒルズ 森アーツセンター', '六本木ヒルズ 森アーツセンター', '2026-03-19 19:00:00', '2026-03-19 22:00:00', 'published', 311, 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=2', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-2-1', 'event-premium-3', '一般参加枠', '標準チケット', 3500, 96, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-2-2', 'event-premium-3', 'VIP/プレミアム', '特典付きチケット', 7000, 17, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-4', 'group-1', 'user-org1', 'Cloud Architecture ワークショップ', 'slug-pre-3', '
<p class="lead">手を動かして学ぶ、実践型ワークショップ。初心者から中級者まで歓迎。</p>
<h3>✨ 学べること</h3>
<ul>
    <li>基礎的な理論と構造</li>
    <li>実践的なツールの使い方</li>
    <li>プロの現場での応用テクニック</li>
</ul>
<h3>🎒 持ち物</h3>
<ul>
    <li>ノートPC (Wi-Fi接続可能なもの)</li>
    <li>筆記用具</li>
    <li>名刺 (ネットワーキング用)</li>
</ul>
<p>※ Wi-Fiと電源は会場で提供されます。</p>
', 'online', 'tech', 'オンライン開催', 'オンライン（URLは参加者に送付）', '2026-02-09 20:00:00', '2026-02-09 22:00:00', 'published', 493, 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=3', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-3-1', 'event-premium-4', '一般参加枠', '標準チケット', 1000, 82, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-3-2', 'event-premium-4', 'VIP/プレミアム', '特典付きチケット', 2000, 6, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-5', 'group-1', 'user-org1', 'Digital Marketing Summit', 'slug-pre-4', '
<p class="lead">業界の最前線を走るリーダーたちが集結。未来を創る2日間。</p>
<h3>🔥 セッションの見どころ</h3>
<p>今年のテーマは「<strong>Convergence (融合)</strong>」。AIと人間の融合、デジタルとアナログの融合、そして組織と個人の融合について深く議論します。</p>
<h3>⏰ タイムテーブル</h3>
<ul class="timeline">
    <li><strong>13:00</strong> - 開場・受付開始</li>
    <li><strong>13:30</strong> - オープニングキーノート: 「2030年の世界」</li>
    <li><strong>14:30</strong> - パネルディスカッション A/B</li>
    <li><strong>16:00</strong> - ネットワーキングブレイク ☕</li>
    <li><strong>18:00</strong> - アフターパーティー (別途チケット必要)</li>
</ul>
<h3>🎤 主な登壇者</h3>
<ul>
    <li>佐藤 健 (Tech Corp CEO)</li>
    <li>鈴木 美咲 (Design Studio 代表)</li>
</ul>
', 'offline', 'business', '虎ノ門ヒルズ', '虎ノ門ヒルズ', '2026-03-04 19:00:00', '2026-03-04 22:00:00', 'published', 378, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=4', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-4-1', 'event-premium-5', '一般参加枠', '標準チケット', 10000, 46, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-4-2', 'event-premium-5', 'VIP/プレミアム', '特典付きチケット', 20000, 12, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-6', 'group-2', 'user-org2', 'Jazz & Wine Premium Night', 'slug-pre-5', '
<p class="lead">最高の音楽と美味しいお酒で、特別な一夜を。</p>
<h3>🍸 Event Highlights</h3>
<p>東京の夜景を一望できるルーフトップバーで開催。特別なカクテルと、厳選されたDJラインナップがお待ちしています。</p>
<ul>
    <li>フリードリンク (2時間制)</li>
    <li>立食ビュッフェスタイル</li>
    <li>シークレットゲストDJ登場予定</li>
</ul>
<h3>👗 ドレスコード</h3>
<p>スマートカジュアル（ビーチサンダル等はご遠慮ください）</p>
', 'offline', 'music', 'Blue Note Tokyo', 'Blue Note Tokyo', '2026-02-04 19:00:00', '2026-02-04 22:00:00', 'published', 332, 'https://images.unsplash.com/photo-1459749411177-734a649eae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=5', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-5-1', 'event-premium-6', '一般参加枠', '標準チケット', 12000, 60, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-5-2', 'event-premium-6', 'VIP/プレミアム', '特典付きチケット', 24000, 19, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-7', 'group-1', 'user-org1', 'Rust言語 ハッカソン', 'slug-pre-6', '
<p class="lead">手を動かして学ぶ、実践型ワークショップ。初心者から中級者まで歓迎。</p>
<h3>✨ 学べること</h3>
<ul>
    <li>基礎的な理論と構造</li>
    <li>実践的なツールの使い方</li>
    <li>プロの現場での応用テクニック</li>
</ul>
<h3>🎒 持ち物</h3>
<ul>
    <li>ノートPC (Wi-Fi接続可能なもの)</li>
    <li>筆記用具</li>
    <li>名刺 (ネットワーキング用)</li>
</ul>
<p>※ Wi-Fiと電源は会場で提供されます。</p>
', 'offline', 'tech', '秋葉原UDX', '秋葉原UDX', '2026-03-01 19:00:00', '2026-03-01 22:00:00', 'published', 313, 'https://images.unsplash.com/photo-1519389950476-2953d6a30406?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=6', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-6-1', 'event-premium-7', '一般参加枠', '標準チケット', 0, 26, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-8', 'group-1', 'user-org1', 'フリーランス交流会 @渋谷', 'slug-pre-7', '
<p class="lead">最高の音楽と美味しいお酒で、特別な一夜を。</p>
<h3>🍸 Event Highlights</h3>
<p>東京の夜景を一望できるルーフトップバーで開催。特別なカクテルと、厳選されたDJラインナップがお待ちしています。</p>
<ul>
    <li>フリードリンク (2時間制)</li>
    <li>立食ビュッフェスタイル</li>
    <li>シークレットゲストDJ登場予定</li>
</ul>
<h3>👗 ドレスコード</h3>
<p>スマートカジュアル（ビーチサンダル等はご遠慮ください）</p>
', 'offline', 'business', '渋谷ストリーム', '渋谷ストリーム', '2026-02-21 19:00:00', '2026-02-21 22:00:00', 'published', 229, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=7', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-7-1', 'event-premium-8', '一般参加枠', '標準チケット', 3000, 72, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-7-2', 'event-premium-8', 'VIP/プレミアム', '特典付きチケット', 6000, 19, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-9', 'group-2', 'user-org2', 'UI/UX Design Trends 2026', 'slug-pre-8', '
<p class="lead">業界の最前線を走るリーダーたちが集結。未来を創る2日間。</p>
<h3>🔥 セッションの見どころ</h3>
<p>今年のテーマは「<strong>Convergence (融合)</strong>」。AIと人間の融合、デジタルとアナログの融合、そして組織と個人の融合について深く議論します。</p>
<h3>⏰ タイムテーブル</h3>
<ul class="timeline">
    <li><strong>13:00</strong> - 開場・受付開始</li>
    <li><strong>13:30</strong> - オープニングキーノート: 「2030年の世界」</li>
    <li><strong>14:30</strong> - パネルディスカッション A/B</li>
    <li><strong>16:00</strong> - ネットワーキングブレイク ☕</li>
    <li><strong>18:00</strong> - アフターパーティー (別途チケット必要)</li>
</ul>
<h3>🎤 主な登壇者</h3>
<ul>
    <li>佐藤 健 (Tech Corp CEO)</li>
    <li>鈴木 美咲 (Design Studio 代表)</li>
</ul>
', 'online', 'art', 'オンライン開催', 'オンライン（URLは参加者に送付）', '2026-03-25 20:00:00', '2026-03-25 22:00:00', 'published', 183, 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=8', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-8-1', 'event-premium-9', '一般参加枠', '標準チケット', 2500, 39, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-8-2', 'event-premium-9', 'VIP/プレミアム', '特典付きチケット', 5000, 17, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-10', 'group-2', 'user-org2', 'Craft Beer Festival Spring', 'slug-pre-9', '
<p class="lead">最高の音楽と美味しいお酒で、特別な一夜を。</p>
<h3>🍸 Event Highlights</h3>
<p>東京の夜景を一望できるルーフトップバーで開催。特別なカクテルと、厳選されたDJラインナップがお待ちしています。</p>
<ul>
    <li>フリードリンク (2時間制)</li>
    <li>立食ビュッフェスタイル</li>
    <li>シークレットゲストDJ登場予定</li>
</ul>
<h3>👗 ドレスコード</h3>
<p>スマートカジュアル（ビーチサンダル等はご遠慮ください）</p>
', 'offline', 'food', '代々木公園', '代々木公園', '2026-03-22 19:00:00', '2026-03-22 22:00:00', 'published', 306, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=9', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-9-1', 'event-premium-10', '一般参加枠', '標準チケット', 500, 29, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-9-2', 'event-premium-10', 'VIP/プレミアム', '特典付きチケット', 1000, 11, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-11', 'group-1', 'user-org1', 'Pythonデータサイエンス入門', 'slug-pre-10', '
<p class="lead">手を動かして学ぶ、実践型ワークショップ。初心者から中級者まで歓迎。</p>
<h3>✨ 学べること</h3>
<ul>
    <li>基礎的な理論と構造</li>
    <li>実践的なツールの使い方</li>
    <li>プロの現場での応用テクニック</li>
</ul>
<h3>🎒 持ち物</h3>
<ul>
    <li>ノートPC (Wi-Fi接続可能なもの)</li>
    <li>筆記用具</li>
    <li>名刺 (ネットワーキング用)</li>
</ul>
<p>※ Wi-Fiと電源は会場で提供されます。</p>
', 'online', 'tech', 'オンライン開催', 'オンライン（URLは参加者に送付）', '2026-03-12 20:00:00', '2026-03-12 22:00:00', 'published', 465, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=10', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-10-1', 'event-premium-11', '一般参加枠', '標準チケット', 5000, 95, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-10-2', 'event-premium-11', 'VIP/プレミアム', '特典付きチケット', 10000, 15, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-12', 'group-1', 'user-org1', 'Global Career Forum', 'slug-pre-11', '
<p class="lead">業界の最前線を走るリーダーたちが集結。未来を創る2日間。</p>
<h3>🔥 セッションの見どころ</h3>
<p>今年のテーマは「<strong>Convergence (融合)</strong>」。AIと人間の融合、デジタルとアナログの融合、そして組織と個人の融合について深く議論します。</p>
<h3>⏰ タイムテーブル</h3>
<ul class="timeline">
    <li><strong>13:00</strong> - 開場・受付開始</li>
    <li><strong>13:30</strong> - オープニングキーノート: 「2030年の世界」</li>
    <li><strong>14:30</strong> - パネルディスカッション A/B</li>
    <li><strong>16:00</strong> - ネットワーキングブレイク ☕</li>
    <li><strong>18:00</strong> - アフターパーティー (別途チケット必要)</li>
</ul>
<h3>🎤 主な登壇者</h3>
<ul>
    <li>佐藤 健 (Tech Corp CEO)</li>
    <li>鈴木 美咲 (Design Studio 代表)</li>
</ul>
', 'offline', 'business', '東京ビッグサイト', '東京ビッグサイト', '2026-03-02 19:00:00', '2026-03-02 22:00:00', 'published', 52, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=11', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-11-1', 'event-premium-12', '一般参加枠', '標準チケット', 0, 67, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-13', 'group-2', 'user-org2', 'Ambient Music Night', 'slug-pre-12', '
<p class="lead">最高の音楽と美味しいお酒で、特別な一夜を。</p>
<h3>🍸 Event Highlights</h3>
<p>東京の夜景を一望できるルーフトップバーで開催。特別なカクテルと、厳選されたDJラインナップがお待ちしています。</p>
<ul>
    <li>フリードリンク (2時間制)</li>
    <li>立食ビュッフェスタイル</li>
    <li>シークレットゲストDJ登場予定</li>
</ul>
<h3>👗 ドレスコード</h3>
<p>スマートカジュアル（ビーチサンダル等はご遠慮ください）</p>
', 'offline', 'music', '恵比寿LIQUIDROOM', '恵比寿LIQUIDROOM', '2026-02-22 19:00:00', '2026-02-22 22:00:00', 'published', 115, 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=12', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-12-1', 'event-premium-13', '一般参加枠', '標準チケット', 4500, 65, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-12-2', 'event-premium-13', 'VIP/プレミアム', '特典付きチケット', 9000, 5, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-14', 'group-2', 'user-org2', 'iPhone Photography 講座', 'slug-pre-13', '
<p class="lead">手を動かして学ぶ、実践型ワークショップ。初心者から中級者まで歓迎。</p>
<h3>✨ 学べること</h3>
<ul>
    <li>基礎的な理論と構造</li>
    <li>実践的なツールの使い方</li>
    <li>プロの現場での応用テクニック</li>
</ul>
<h3>🎒 持ち物</h3>
<ul>
    <li>ノートPC (Wi-Fi接続可能なもの)</li>
    <li>筆記用具</li>
    <li>名刺 (ネットワーキング用)</li>
</ul>
<p>※ Wi-Fiと電源は会場で提供されます。</p>
', 'offline', 'art', 'Apple 丸の内', 'Apple 丸の内', '2026-02-17 19:00:00', '2026-02-17 22:00:00', 'published', 385, 'https://images.unsplash.com/photo-1501084881629-7a19a6216b1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=13', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-13-1', 'event-premium-14', '一般参加枠', '標準チケット', 0, 61, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-premium-15', 'group-1', 'user-org1', 'Web3.0 DAO Meetup', 'slug-pre-14', '
<p class="lead">最高の音楽と美味しいお酒で、特別な一夜を。</p>
<h3>🍸 Event Highlights</h3>
<p>東京の夜景を一望できるルーフトップバーで開催。特別なカクテルと、厳選されたDJラインナップがお待ちしています。</p>
<ul>
    <li>フリードリンク (2時間制)</li>
    <li>立食ビュッフェスタイル</li>
    <li>シークレットゲストDJ登場予定</li>
</ul>
<h3>👗 ドレスコード</h3>
<p>スマートカジュアル（ビーチサンダル等はご遠慮ください）</p>
', 'offline', 'tech', 'Crypto Base Ginza', 'Crypto Base Ginza', '2026-02-26 19:00:00', '2026-02-26 22:00:00', 'published', 494, 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=14', 1, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-14-1', 'event-premium-15', '一般参加枠', '標準チケット', 1000, 91, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-14-2', 'event-premium-15', 'VIP/プレミアム', '特典付きチケット', 2000, 17, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-1', 'group-1', 'user-org1', 'Food Meetup Vol.1', 'slug-fil-0', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'food', 'TBD', '東京都内', '2026-04-15 18:00:00', '2026-03-08 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=100', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-0', 'event-filler-1', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-2', 'group-1', 'user-org1', 'Tech Meetup Vol.2', 'slug-fil-1', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'tech', 'TBD', '東京都内', '2026-03-29 18:00:00', '2026-03-06 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=101', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-1', 'event-filler-2', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-3', 'group-1', 'user-org1', 'Tech Meetup Vol.3', 'slug-fil-2', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'tech', 'TBD', '東京都内', '2026-02-09 18:00:00', '2026-02-18 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=102', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-2', 'event-filler-3', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-4', 'group-1', 'user-org1', 'Music Meetup Vol.4', 'slug-fil-3', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'music', 'TBD', '東京都内', '2026-02-22 18:00:00', '2026-04-23 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=103', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-3', 'event-filler-4', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-5', 'group-1', 'user-org1', 'Business Meetup Vol.5', 'slug-fil-4', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'business', 'TBD', '東京都内', '2026-04-26 18:00:00', '2026-03-02 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=104', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-4', 'event-filler-5', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-6', 'group-1', 'user-org1', 'Social Meetup Vol.6', 'slug-fil-5', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'social', 'TBD', '東京都内', '2026-03-01 18:00:00', '2026-03-27 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1504384308090-c54be385329d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=105', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-5', 'event-filler-6', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-7', 'group-1', 'user-org1', 'Tech Meetup Vol.7', 'slug-fil-6', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'tech', 'TBD', '東京都内', '2026-04-08 18:00:00', '2026-04-09 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=106', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-6', 'event-filler-7', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-8', 'group-1', 'user-org1', 'Music Meetup Vol.8', 'slug-fil-7', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'music', 'TBD', '東京都内', '2026-03-02 18:00:00', '2026-04-11 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=107', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-7', 'event-filler-8', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-9', 'group-1', 'user-org1', 'Business Meetup Vol.9', 'slug-fil-8', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'business', 'TBD', '東京都内', '2026-04-15 18:00:00', '2026-04-02 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=108', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-8', 'event-filler-9', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-10', 'group-1', 'user-org1', 'Tech Meetup Vol.10', 'slug-fil-9', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'tech', 'TBD', '東京都内', '2026-02-10 18:00:00', '2026-02-08 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1519389950476-2953d6a30406?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=109', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-9', 'event-filler-10', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-11', 'group-1', 'user-org1', 'Business Meetup Vol.11', 'slug-fil-10', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'business', 'TBD', '東京都内', '2026-04-20 18:00:00', '2026-04-24 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=110', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-10', 'event-filler-11', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-12', 'group-1', 'user-org1', 'Music Meetup Vol.12', 'slug-fil-11', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'music', 'TBD', '東京都内', '2026-04-21 18:00:00', '2026-02-10 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1459749411177-734a649eae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=111', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-11', 'event-filler-12', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-13', 'group-1', 'user-org1', 'Music Meetup Vol.13', 'slug-fil-12', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'music', 'TBD', '東京都内', '2026-04-14 18:00:00', '2026-04-19 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=112', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-12', 'event-filler-13', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-14', 'group-1', 'user-org1', 'Music Meetup Vol.14', 'slug-fil-13', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'music', 'TBD', '東京都内', '2026-03-06 18:00:00', '2026-02-07 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1514525253440-b393452e3383?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=113', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-13', 'event-filler-14', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-15', 'group-1', 'user-org1', 'Music Meetup Vol.15', 'slug-fil-14', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'music', 'TBD', '東京都内', '2026-03-25 18:00:00', '2026-02-23 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1459749411177-734a649eae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=114', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-14', 'event-filler-15', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-16', 'group-1', 'user-org1', 'Food Meetup Vol.16', 'slug-fil-15', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'food', 'TBD', '東京都内', '2026-02-26 18:00:00', '2026-04-25 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=115', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-15', 'event-filler-16', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-17', 'group-1', 'user-org1', 'Music Meetup Vol.17', 'slug-fil-16', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'music', 'TBD', '東京都内', '2026-04-25 18:00:00', '2026-04-21 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1459749411177-734a649eae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=116', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-16', 'event-filler-17', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-18', 'group-1', 'user-org1', 'Tech Meetup Vol.18', 'slug-fil-17', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'tech', 'TBD', '東京都内', '2026-04-07 18:00:00', '2026-04-24 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1519389950476-2953d6a30406?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=117', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-17', 'event-filler-18', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-19', 'group-1', 'user-org1', 'Food Meetup Vol.19', 'slug-fil-18', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'food', 'TBD', '東京都内', '2026-04-02 18:00:00', '2026-02-21 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=118', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-18', 'event-filler-19', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('event-filler-20', 'group-1', 'user-org1', 'Social Meetup Vol.20', 'slug-fil-19', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', 'social', 'TBD', '東京都内', '2026-02-07 18:00:00', '2026-03-23 20:00:00', 'published', 30, 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig=119', 0, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-19', 'event-filler-20', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);

