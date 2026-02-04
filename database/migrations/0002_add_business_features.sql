-- 振込申請管理テーブル
CREATE TABLE IF NOT EXISTS payouts (
  payout_id TEXT PRIMARY KEY,
  organizer_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  fee_amount INTEGER NOT NULL,
  payout_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'JPY',
  status TEXT CHECK(status IN ('requested', 'approved', 'rejected', 'paid')) DEFAULT 'requested',
  payout_method TEXT CHECK(payout_method IN ('bank_transfer', 'stripe_connect')) DEFAULT 'bank_transfer',
  bank_account_info TEXT, -- JSON string for bank details
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  processed_by TEXT, -- Admin User ID
  FOREIGN KEY (organizer_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_payouts_organizer ON payouts(organizer_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- システム設定テーブル
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初期設定値の投入
INSERT OR IGNORE INTO system_settings (key, value, description) VALUES 
('platform_fee_rate', '5.0', '基本プラットフォーム手数料率(%)'),
('early_payout_fee_rate', '5.0', '早期振込手数料率(%)'),
('transaction_fee_amount', '100', 'チケット1枚あたりの発券手数料(円)'),
('transaction_fee_enabled', 'false', '発券手数料の購入者負担を有効にするか');

-- organizer_profiles に type カラムがない場合の追加 (SQLiteではIF NOT EXISTSがADD COLUMNに使えないため、エラー無視前提または確認が必要ですが、ここでは安全策として別途確認済みでなければ追加しませんが、前回の流れで追加済みのはずです。念のため)
-- ALTER TABLE organizer_profiles ADD COLUMN type TEXT CHECK(type IN ('corporate', 'individual', 'npo')) DEFAULT 'corporate';
