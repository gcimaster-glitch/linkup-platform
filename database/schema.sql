-- ============================================
-- Event Ticket Platform Database Schema
-- Cloudflare D1 (SQLite)
-- ============================================

-- ============================================
-- 1. ユーザー関連テーブル
-- ============================================

-- ユーザー情報
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK(role IN ('attendee', 'organizer', 'admin')) DEFAULT 'attendee',
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  kyc_status TEXT CHECK(kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  kyc_verification_id TEXT,
  two_factor_enabled BOOLEAN DEFAULT 0,
  two_factor_secret TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 主催者プロフィール
CREATE TABLE organizer_profiles (
  organizer_id TEXT PRIMARY KEY,
  organization_name TEXT,
  description TEXT,
  website_url TEXT,
  banner_image_url TEXT,
  follower_count INTEGER DEFAULT 0,
  total_events_held INTEGER DEFAULT 0,
  rating REAL DEFAULT 0.0,
  stripe_onboarding_completed BOOLEAN DEFAULT 0,
  bank_account_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_organizer_rating ON organizer_profiles(rating DESC);

-- ============================================
-- 2. グループ・イベント関連テーブル
-- ============================================

-- グループ(コミュニティ)
CREATE TABLE groups (
  group_id TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT 1,
  follower_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_groups_slug ON groups(slug);
CREATE INDEX idx_groups_organizer ON groups(organizer_id);
CREATE INDEX idx_groups_category ON groups(category);

-- イベント情報
CREATE TABLE events (
  event_id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  organizer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type TEXT CHECK(event_type IN ('online', 'offline', 'hybrid')) NOT NULL,
  category TEXT,
  cover_image_url TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_lat REAL,
  venue_lng REAL,
  online_meeting_url TEXT,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  timezone TEXT DEFAULT 'Asia/Tokyo',
  status TEXT CHECK(status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')) DEFAULT 'draft',
  published_at DATETIME,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT 0,
  requires_approval BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start ON events(start_datetime);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_featured ON events(featured, start_datetime);

-- チケット券種
CREATE TABLE tickets (
  ticket_id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  ticket_name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  stock INTEGER,
  sold_count INTEGER DEFAULT 0,
  sale_start_datetime DATETIME,
  sale_end_datetime DATETIME,
  min_purchase INTEGER DEFAULT 1,
  max_purchase INTEGER DEFAULT 10,
  is_hidden BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE INDEX idx_tickets_event ON tickets(event_id);

-- ============================================
-- 3. 注文・決済関連テーブル
-- ============================================

-- 注文情報
CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  total_amount INTEGER NOT NULL,
  platform_fee INTEGER DEFAULT 0,
  payment_method TEXT CHECK(payment_method IN ('credit_card', 'convenience_store', 'bank_transfer', 'free')),
  payment_status TEXT CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  paid_at DATETIME,
  refunded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_status ON orders(payment_status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- 注文明細(チケット)
CREATE TABLE order_tickets (
  order_ticket_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  ticket_id TEXT NOT NULL,
  attendee_name TEXT,
  attendee_email TEXT,
  qr_code_url TEXT,
  qr_code_data TEXT,
  check_in_status TEXT CHECK(check_in_status IN ('pending', 'checked_in', 'cancelled')) DEFAULT 'pending',
  checked_in_at DATETIME,
  checked_in_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);

CREATE INDEX idx_order_tickets_order ON order_tickets(order_id);
CREATE INDEX idx_order_tickets_qr ON order_tickets(qr_code_data);

-- ============================================
-- 4. アンケート関連テーブル
-- ============================================

-- 事前アンケート設問
CREATE TABLE event_questions (
  question_id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK(question_type IN ('text', 'textarea', 'select', 'checkbox', 'radio')) NOT NULL,
  options TEXT,
  is_required BOOLEAN DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE INDEX idx_questions_event ON event_questions(event_id);

-- 事前アンケート回答
CREATE TABLE event_answers (
  answer_id TEXT PRIMARY KEY,
  order_ticket_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_ticket_id) REFERENCES order_tickets(order_ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES event_questions(question_id) ON DELETE CASCADE
);

CREATE INDEX idx_answers_ticket ON event_answers(order_ticket_id);

-- ============================================
-- 5. フォロー・通知関連テーブル
-- ============================================

-- グループフォロワー
CREATE TABLE followers (
  follower_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  followed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
  UNIQUE(user_id, group_id)
);

CREATE INDEX idx_followers_user ON followers(user_id);
CREATE INDEX idx_followers_group ON followers(group_id);

-- 通知
CREATE TABLE notifications (
  notification_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('event_published', 'ticket_purchased', 'event_reminder', 'event_cancelled', 'message_from_organizer')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_event_id TEXT,
  related_order_id TEXT,
  is_read BOOLEAN DEFAULT 0,
  sent_via_email BOOLEAN DEFAULT 0,
  sent_via_push BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- メッセージ
CREATE TABLE messages (
  message_id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  recipient_type TEXT CHECK(recipient_type IN ('group_followers', 'event_attendees', 'individual')) NOT NULL,
  group_id TEXT,
  event_id TEXT,
  recipient_user_id TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_group ON messages(group_id);
CREATE INDEX idx_messages_event ON messages(event_id);

-- ============================================
-- 6. キャンペーン・サブスク関連テーブル
-- ============================================

-- キャンペーン管理
CREATE TABLE campaigns (
  campaign_id TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL,
  event_id TEXT,
  campaign_type TEXT CHECK(campaign_type IN ('early_bird', 'discount_code', 'featured_listing', 'email_blast')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK(discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER,
  promo_code TEXT UNIQUE,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  budget INTEGER,
  spent_amount INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('active', 'paused', 'completed')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(user_id),
  FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE INDEX idx_campaigns_code ON campaigns(promo_code);
CREATE INDEX idx_campaigns_event ON campaigns(event_id);

-- サブスクリプション
CREATE TABLE subscriptions (
  subscription_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT CHECK(status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancelled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (group_id) REFERENCES groups(group_id)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_group ON subscriptions(group_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- 7. 分析・AI関連テーブル
-- ============================================

-- アクセス解析
CREATE TABLE analytics (
  analytics_id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  ticket_views INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0.0,
  referrer_source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  UNIQUE(event_id, date, referrer_source)
);

CREATE INDEX idx_analytics_event ON analytics(event_id, date);

-- AIコンシェルジュ会話履歴
CREATE TABLE ai_conversations (
  conversation_id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  message_role TEXT CHECK(message_role IN ('user', 'assistant')) NOT NULL,
  message_content TEXT NOT NULL,
  context_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_ai_conv_session ON ai_conversations(session_id);
CREATE INDEX idx_ai_conv_user ON ai_conversations(user_id);
