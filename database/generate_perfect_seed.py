import datetime
import random

# 確実に表示されるUnsplash画像 (Direct URLs)
IMAGES = {
    'tech': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'business': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'music': 'https://images.unsplash.com/photo-1501281668745-13bc6a60fa36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'art': 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'social': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
}

def get_date(days_offset, hour=19):
    date = datetime.datetime.now() + datetime.timedelta(days=days_offset)
    return date.replace(hour=hour, minute=0, second=0).strftime('%Y-%m-%d %H:%M:%S')

sql = """
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
"""

# イベント30件生成（必ずチケットを付与）
categories = ['tech', 'business', 'music', 'art', 'social']
locations = ['東京', '大阪', '福岡', '名古屋', 'オンライン']

for i in range(30):
    cat = categories[i % 5]
    loc = locations[i % 5]
    is_online = (loc == 'オンライン')
    
    event_id = f"evt-{i:03d}"
    title = f"LinkUp {cat.capitalize()} Summit Vol.{i+1}"
    venue = "Zoom" if is_online else f"{loc}グランドホール"
    addr = "オンライン開催" if is_online else f"{loc}都心部 1-1-1"
    
    start = get_date(i + 3)
    end = get_date(i + 3, 22)
    img = IMAGES[cat]
    
    # HTML Description
    desc = f"""
<div class='event-detail-content'>
    <p class='lead'>業界のトップランナーが集う、{cat.capitalize()}領域の最重要イベント。</p>
    <h3>✨ イベントの魅力</h3>
    <ul>
        <li>最先端のトレンドを網羅</li>
        <li>参加者限定のネットワーキング</li>
        <li>豪華ゲストによるトークセッション</li>
    </ul>
    <h3>⏰ タイムテーブル</h3>
    <div class='timetable'>
        <p><strong>19:00</strong> 開場・受付</p>
        <p><strong>19:30</strong> キーノートスピーチ</p>
        <p><strong>20:30</strong> 懇親会</p>
    </div>
</div>
""".replace("'", "''")

    sql += f"""
INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, featured, created_at)
VALUES ('{event_id}', 'group-1', 'user-org1', '{title}', 'slug-{i}', '{desc}', '{'online' if is_online else 'offline'}', '{cat}', '{venue}', '{addr}', '{start}', '{end}', 'published', 200, '{img}', {1 if i<6 else 0}, CURRENT_TIMESTAMP);

-- チケットA (一般)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-{i}-a', '{event_id}', '一般参加チケット', '早割価格', 1000, 100, CURRENT_TIMESTAMP);

-- チケットB (VIP)
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('tkt-{i}-b', '{event_id}', 'VIPチケット', '最前列確約 + 懇親会', 5000, 20, CURRENT_TIMESTAMP);
"""

print(sql)
