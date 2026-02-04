import datetime
import random
import uuid

# --- Helper Functions ---
def get_date(days_offset, hour=19):
    date = datetime.datetime.now() + datetime.timedelta(days=days_offset)
    return date.replace(hour=hour, minute=0, second=0).strftime('%Y-%m-%d %H:%M:%S')

def get_random_image(category, sig):
    base = "https://images.unsplash.com/photo-"
    # 高品質な画像を厳選
    images = {
        'tech': [
            '1540575467063-178a50c2df87', '1519389950476-2953d6a30406', '1550751827-4bd374c3f58b', 
            '1531482615713-2afd69097998', '1504384308090-c54be385329d'
        ],
        'business': [
            '1515187029135-18ee286d815b', '1556761175-5973dc0f32e7', '1542744173-8e7e53415bb0',
            '1521791136064-7986c2920216', '1600880292203-757bb62b4baf'
        ],
        'music': [
            '1470225620780-dba8ba36b745', '1501281668745-13bc6a60fa36', '1514525253440-b393452e3383',
            '1459749411177-734a649eae77', '1493225255756-d9584f8606e9'
        ],
        'art': [
            '1518998053901-5348d3969105', '1561214115-f41a365d7964', '1501084881629-7a19a6216b1e',
            '1536924940846-227afb31e2a5', '1513364776144-60967b0f800f'
        ],
        'food': [
            '1555244162-803834f70033', '1567620905732-2d1ec7ab7445', '1528605248644-14dd04022da1',
            '1559339352-11d035aa65de'
        ]
    }
    cat_images = images.get(category, images['tech'])
    img_id = random.choice(cat_images)
    return f"{base}{img_id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&sig={sig}"

# --- Rich Content Templates ---
# HTMLを含むリッチな説明文
templates = {
    'conference': """
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
""",
    'workshop': """
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
""",
    'party': """
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
"""
}

# --- Hand-crafted Premium Events (15 items) ---
premium_events = [
    {
        'title': 'Next.js Conf Tokyo 2026', 'category': 'tech', 'type': 'conference', 'venue': '東京国際フォーラム',
        'price': 5000, 'is_online': False
    },
    {
        'title': 'Startup Pitch Night Vol.24', 'category': 'business', 'type': 'conference', 'venue': 'WeWork 渋谷',
        'price': 2000, 'is_online': False
    },
    {
        'title': 'AI Art Exhibition "Genesis"', 'category': 'art', 'type': 'party', 'venue': '六本木ヒルズ 森アーツセンター',
        'price': 3500, 'is_online': False
    },
    {
        'title': 'Cloud Architecture ワークショップ', 'category': 'tech', 'type': 'workshop', 'venue': 'オンライン開催',
        'price': 1000, 'is_online': True
    },
    {
        'title': 'Digital Marketing Summit', 'category': 'business', 'type': 'conference', 'venue': '虎ノ門ヒルズ',
        'price': 10000, 'is_online': False
    },
    {
        'title': 'Jazz & Wine Premium Night', 'category': 'music', 'type': 'party', 'venue': 'Blue Note Tokyo',
        'price': 12000, 'is_online': False
    },
    {
        'title': 'Rust言語 ハッカソン', 'category': 'tech', 'type': 'workshop', 'venue': '秋葉原UDX',
        'price': 0, 'is_online': False
    },
    {
        'title': 'フリーランス交流会 @渋谷', 'category': 'business', 'type': 'party', 'venue': '渋谷ストリーム',
        'price': 3000, 'is_online': False
    },
    {
        'title': 'UI/UX Design Trends 2026', 'category': 'art', 'type': 'conference', 'venue': 'オンライン開催',
        'price': 2500, 'is_online': True
    },
    {
        'title': 'Craft Beer Festival Spring', 'category': 'food', 'type': 'party', 'venue': '代々木公園',
        'price': 500, 'is_online': False
    },
    {
        'title': 'Pythonデータサイエンス入門', 'category': 'tech', 'type': 'workshop', 'venue': 'オンライン開催',
        'price': 5000, 'is_online': True
    },
    {
        'title': 'Global Career Forum', 'category': 'business', 'type': 'conference', 'venue': '東京ビッグサイト',
        'price': 0, 'is_online': False
    },
    {
        'title': 'Ambient Music Night', 'category': 'music', 'type': 'party', 'venue': '恵比寿LIQUIDROOM',
        'price': 4500, 'is_online': False
    },
    {
        'title': 'iPhone Photography 講座', 'category': 'art', 'type': 'workshop', 'venue': 'Apple 丸の内',
        'price': 0, 'is_online': False
    },
    {
        'title': 'Web3.0 DAO Meetup', 'category': 'tech', 'type': 'party', 'venue': 'Crypto Base Ginza',
        'price': 1000, 'is_online': False
    }
]

# --- SQL Generation ---
sql = """
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
"""

# Generate 15 Premium Events
for i, p in enumerate(premium_events):
    event_id = f"event-premium-{i+1}"
    organizer = 'user-org1' if p['category'] in ['tech', 'business'] else 'user-org2'
    group = 'group-1' if organizer == 'user-org1' else 'group-2'
    
    # Date logic: spread over next 60 days, mostly weekends or evenings
    day_offset = random.randint(3, 60)
    start_dt = get_date(day_offset, 19 if not p['is_online'] else 20)
    end_dt = get_date(day_offset, 22)
    
    desc = templates[p['type']]
    img = get_random_image(p['category'], i)
    
    venue_addr = p['venue'] if not p['is_online'] else 'オンライン（URLは参加者に送付）'
    event_type = 'online' if p['is_online'] else 'offline'
    
    sql += f"""
INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('{event_id}', '{group}', '{organizer}', '{p['title']}', 'slug-pre-{i}', '{desc}', '{event_type}', '{p['category']}', '{p['venue']}', '{venue_addr}', '{start_dt}', '{end_dt}', 'published', {random.randint(50, 500)}, '{img}', 1, CURRENT_TIMESTAMP);
"""
    # Tickets
    sql += f"""
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-{i}-1', '{event_id}', '一般参加枠', '標準チケット', {p['price']}, {random.randint(20, 100)}, CURRENT_TIMESTAMP);
"""
    if p['price'] > 0:
        sql += f"""
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-pre-{i}-2', '{event_id}', 'VIP/プレミアム', '特典付きチケット', {p['price'] * 2}, {random.randint(5, 20)}, CURRENT_TIMESTAMP);
"""

# Generate 15+ more random events for filler
for i in range(20):
    cat = random.choice(['tech', 'business', 'music', 'food', 'social'])
    title = f"{cat.capitalize()} Meetup Vol.{i+1}"
    event_id = f"event-filler-{i+1}"
    organizer = 'user-org1'
    img = get_random_image(cat, i+100)
    start_dt = get_date(random.randint(1, 90), 18)
    end_dt = get_date(random.randint(1, 90), 20)
    
    sql += f"""
INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('{event_id}', 'group-1', 'user-org1', '{title}', 'slug-fil-{i}', '<p>定期開催のミートアップです。気軽にご参加ください。</p>', 'offline', '{cat}', 'TBD', '東京都内', '{start_dt}', '{end_dt}', 'published', 30, '{img}', 0, CURRENT_TIMESTAMP);
"""
    sql += f"""
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-fil-{i}', '{event_id}', '参加費', 'ワンドリンク付', 1000, 30, CURRENT_TIMESTAMP);
"""

print(sql)
