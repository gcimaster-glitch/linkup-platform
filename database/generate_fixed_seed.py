import datetime
import random

# --- Helper Functions ---
def get_date(days_offset, hour=19):
    date = datetime.datetime.now() + datetime.timedelta(days=days_offset)
    return date.replace(hour=hour, minute=0, second=0).strftime('%Y-%m-%d %H:%M:%S')

# 確実に表示される画像IDリスト
IMAGE_IDS = {
    'tech': ['1519389950476-2953d6a30406', '1550751827-4bd374c3f58b', '1531482615713-2afd69097998'],
    'business': ['1556761175-5973dc0f32e7', '1542744173-8e7e53415bb0', '1521791136064-7986c2920216'],
    'music': ['1501281668745-13bc6a60fa36', '1514525253440-b393452e3383', '1459749411177-734a649eae77'],
    'art': ['1561214115-f41a365d7964', '1501084881629-7a19a6216b1e', '1536924940846-227afb31e2a5'],
    'food': ['1555244162-803834f70033', '1567620905732-2d1ec7ab7445', '1528605248644-14dd04022da1']
}

def get_image(category):
    ids = IMAGE_IDS.get(category, IMAGE_IDS['tech'])
    img_id = random.choice(ids)
    # クエリパラメータを最小限にして安定性を確保
    return f"https://images.unsplash.com/photo-{img_id}?ixlib=rb-4.0.3&w=1200&q=80"

# HTML記述（クォートのエスケープに注意）
# Pythonのf-string内でHTMLを書くため、安全な文字列として定義
DESC_TEMPLATES = {
    'tech': """
<div class='event-details'>
    <p class='lead'>最新の技術トレンドをキャッチアップする、エンジニアのための祭典。</p>
    
    <h3>🔥 イベントのポイント</h3>
    <ul class='feature-list'>
        <li>業界トップエンジニアによるLiveコーディング</li>
        <li>アーキテクチャ設計の裏側を公開</li>
        <li>参加者限定のGithubリポジトリへのアクセス権</li>
    </ul>

    <h3>⏰ タイムテーブル</h3>
    <div class='timetable'>
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
""",
    'business': """
<div class='event-details'>
    <p class='lead'>ビジネスを加速させるための、上質な出会いと学びの場。</p>
    
    <h3>🤝 このイベントで得られるもの</h3>
    <ul class='feature-list'>
        <li>決裁者クラスとのネットワーキング</li>
        <li>最新のマーケティング事例の共有</li>
        <li>事業提携のきっかけ作り</li>
    </ul>

    <h3>👤 登壇者プロフィール</h3>
    <p><strong>田中 健太郎</strong><br>株式会社LinkUp 代表取締役CEO。シリアルアントレプレナーとして数々の事業を売却。</p>

    <h3>⚠️ 参加条件</h3>
    <p>法人企業の役員、または事業責任者の方限定とさせていただきます。</p>
</div>
"""
}

sql = """
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

"""

# Generate 30 Events
locations = ['東京', '大阪', '福岡', '名古屋', '札幌', 'オンライン']

for i in range(30):
    cat = random.choice(['tech', 'business', 'music', 'art', 'food'])
    is_online = random.random() > 0.7
    location = 'オンライン' if is_online else random.choice(locations[:-1])
    venue_name = 'Zoom / Meet' if is_online else f'{location}カンファレンスセンター'
    
    event_id = f"event-{i}"
    title = f"LinkUp {cat.capitalize()} Summit Vol.{i}"
    desc = DESC_TEMPLATES.get(cat, DESC_TEMPLATES['tech']).replace("'", "''") # Escape single quotes for SQL
    img = get_image(cat)
    
    start = get_date(random.randint(1, 60))
    end = get_date(random.randint(1, 60), 21)
    
    sql += f"""
INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('{event_id}', 'group-1', 'user-org1', '{title}', 'slug-{i}', '{desc}', '{'online' if is_online else 'offline'}', '{cat}', '{venue_name}', '{location}', '{start}', '{end}', 'published', 100, '{img}', {1 if i < 5 else 0}, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-{i}-1', '{event_id}', '一般参加', '標準チケット', {random.choice([0, 1000, 3000])}, 50, CURRENT_TIMESTAMP);

INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('ticket-{i}-2', '{event_id}', 'VIP', '特典付き', 10000, 10, CURRENT_TIMESTAMP);
"""

print(sql)
