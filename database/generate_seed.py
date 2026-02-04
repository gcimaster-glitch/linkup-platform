import datetime
import random
import uuid

# ヘルパー
def get_date(days_offset, hour=19):
    date = datetime.datetime.now() + datetime.timedelta(days=days_offset)
    return date.replace(hour=hour, minute=0, second=0).strftime('%Y-%m-%d %H:%M:%S')

# データソース
categories = ['tech', 'business', 'music', 'art', 'social', 'career']
venues = [
    {'name': '渋谷ストリームホール', 'address': '東京都渋谷区渋谷3-21-3'},
    {'name': '東京国際フォーラム', 'address': '東京都千代田区丸の内3-5-1'},
    {'name': '六本木ヒルズ', 'address': '東京都港区六本木6-10-1'},
    {'name': 'オンライン開催', 'address': 'Zoom / Google Meet'},
    {'name': 'WeWork 渋谷スクランブルスクエア', 'address': '東京都渋谷区渋谷2-24-12'},
    {'name': '虎ノ門ヒルズフォーラム', 'address': '東京都港区虎ノ門1-23-3'},
    {'name': '秋葉原UDX', 'address': '東京都千代田区外神田4-14-1'}
]

titles = {
    'tech': ['React.js 深掘り勉強会', 'AI時代のプロダクト開発', 'Web3ハッカソン Tokyo', 'Cloudflare Workers実践講座', 'Rust言語入門', 'Go言語ミートアップ', 'スタートアップCTO対談', 'AWSアーキテクチャ設計', 'Python機械学習ワークショップ', 'ブロックチェーン開発者会議'],
    'business': ['次世代マーケティング戦略', 'SaaSビジネスの成長戦略', '起業家ネットワーキング', 'HRテックカンファレンス', 'グローバル展開セミナー', '資金調達ピッチイベント'],
    'music': ['Jazz Night Tokyo', 'Electronic Music Festival', 'Chill Hop Session', 'Piano Solo Concert', 'Underground DJ Event'],
    'art': ['現代アート展 "Future"', 'デジタルアート・インスタレーション', '写真家ポートフォリオレビュー', 'UI/UXデザイン展'],
    'social': ['国際交流パーティー', '週末BBQ & Networking', '朝活カフェ会', '日本酒飲み比べ会'],
    'career': ['エンジニア転職フェア', '外資系企業キャリアフォーラム', 'フリーランス交流会']
}

images = {
    'tech': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&w=1000&q=80',
    'business': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&w=1000&q=80',
    'music': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&w=1000&q=80',
    'art': 'https://images.unsplash.com/photo-1518998053901-5348d3969105?ixlib=rb-4.0.3&w=1000&q=80',
    'social': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&w=1000&q=80',
    'career': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&w=1000&q=80'
}

# SQL生成
sql = """
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
"""

# Events & Tickets
for i in range(35):
    category = random.choice(categories)
    title = random.choice(titles[category]) + (f" Vol.{random.randint(1,10)}" if random.random() > 0.5 else "")
    venue = random.choice(venues)
    
    event_id = f"event-{i+1}"
    organizer = 'user-org1' if category in ['tech', 'business', 'career'] else 'user-org2'
    group = 'group-1' if organizer == 'user-org1' else 'group-2'
    
    days_offset = random.randint(1, 60)
    start_dt = get_date(days_offset, 19)
    end_dt = get_date(days_offset, 21)
    
    event_type = 'online' if venue['name'] == 'オンライン開催' else 'offline'
    
    sql += f"""
INSERT INTO events (event_id, group_id, organizer_id, title, slug, description, event_type, category, venue_name, venue_address, start_datetime, end_datetime, status, max_attendees, cover_image_url, created_at)
VALUES ('{event_id}', '{group}', '{organizer}', '{title}', 'slug-{i}', 'これは{category}に関する素晴らしいイベントです。業界のトップランナーをお招きして、深い議論を交わします。ネットワーキングの時間も用意しています。', '{event_type}', '{category}', '{venue['name']}', '{venue['address']}', '{start_dt}', '{end_dt}', 'published', {random.randint(30, 200)}, '{images[category]}', CURRENT_TIMESTAMP);
"""

    # Tickets
    price = random.choice([0, 1000, 3000, 5000, 10000])
    ticket_id = f"ticket-{i+1}-a"
    sql += f"""
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('{ticket_id}', '{event_id}', '一般参加枠', '標準的なチケットです', {price}, {random.randint(10, 50)}, CURRENT_TIMESTAMP);
"""
    if random.random() > 0.7:
        ticket_id_vip = f"ticket-{i+1}-b"
        sql += f"""
INSERT INTO tickets (ticket_id, event_id, ticket_name, description, price, quantity, created_at)
VALUES ('{ticket_id_vip}', '{event_id}', 'VIPチケット', '優先入場と懇親会参加権', {price + 5000}, {random.randint(5, 10)}, CURRENT_TIMESTAMP);
"""

print(sql)
