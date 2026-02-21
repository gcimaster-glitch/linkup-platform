# 🚀 Xserver + LAMP 完全移行ガイド

## 📅 **実装スケジュール（3-4日）**

### **Day 1: Xserver 設定 + 基盤構築**
- [ ] Xserver契約・設定
- [ ] SSH接続設定
- [ ] ドメイン設定
- [ ] MySQL データベース作成
- [ ] PHP バージョン設定（8.x）
- [ ] SSL証明書設定（無料）

### **Day 2-3: LAMP アプリ実装**
- [ ] PHPプロジェクト作成
- [ ] 認証システム実装
- [ ] ダッシュボード実装
- [ ] チケット・決済履歴実装

### **Day 4: 自動デプロイ + テスト**
- [ ] GitHub Actions 設定
- [ ] 自動デプロイテスト
- [ ] 本番環境テスト

---

## 🔧 **Step 1: Xserver の初期設定（30分）**

### **1-1. Xserver 契約確認**
既に契約済みの場合、以下を確認：
- サーバーパネルURL: https://www.xserver.ne.jp/login_server.php
- FTPアカウント情報
- SSH接続情報

### **1-2. SSH接続を有効化**

**Xserver サーバーパネル:**
1. ログイン → 「SSH設定」
2. 「SSH接続」を「ON」に変更
3. 「公開鍵認証用鍵ペアの生成」をクリック
4. 秘密鍵をダウンロード（例: `server123.key`）

**ローカルPCで接続テスト:**
```bash
# 秘密鍵の権限設定
chmod 600 ~/Downloads/server123.key

# SSH接続テスト
ssh -i ~/Downloads/server123.key youruser@yourserver.xserver.jp

# 成功すれば以下のようなプロンプトが表示される
[youruser@sv123 ~]$
```

### **1-3. MySQL データベース作成**

**Xserver サーバーパネル:**
1. 「MySQL設定」をクリック
2. 「MySQL追加」タブ
   - データベース名: `youruser_linkup`
   - 文字コード: `UTF-8`
3. 「MySQLユーザ追加」タブ
   - ユーザーID: `youruser_linkup`
   - パスワード: 強固なパスワード生成
4. 「アクセス権所有ユーザ」で追加したユーザーを紐付け

**接続情報をメモ:**
```
ホスト: mysqlXXX.xserver.jp
データベース名: youruser_linkup
ユーザー名: youruser_linkup
パスワード: **************
```

### **1-4. PHP バージョン設定**

**Xserver サーバーパネル:**
1. 「PHP Ver.切替」をクリック
2. 対象ドメインを選択
3. PHP 8.2 または 8.3 を選択
4. 「変更」をクリック

### **1-5. ドメイン設定**

**独自ドメインの場合:**
1. 「ドメイン設定」→「ドメイン設定追加」
2. ドメイン名入力（例: link-up.live）
3. 無料独自SSL: 「利用する」にチェック

**サブドメインの場合:**
1. 「サブドメイン設定」
2. サブドメイン名入力（例: app.link-up.live）

---

## 🔐 **Step 2: SSH鍵をGitHubに登録（5分）**

### **2-1. 秘密鍵をGitHub Secretsに追加**

1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. 「New repository secret」をクリック
3. 以下の情報を追加:

```
Name: XSERVER_HOST
Value: yourserver.xserver.jp

Name: XSERVER_USER
Value: youruser

Name: XSERVER_SSH_KEY
Value: (ダウンロードした秘密鍵の内容を全てコピペ)

Name: XSERVER_DEPLOY_PATH
Value: /home/youruser/linkup.example.com/public_html
```

**秘密鍵の内容取得方法:**
```bash
cat ~/Downloads/server123.key
# 表示された全ての内容（-----BEGIN RSA PRIVATE KEY----- から -----END RSA PRIVATE KEY----- まで）をコピー
```

---

## 📦 **Step 3: プロジェクト構造の作成**

### **3-1. Xserver にプロジェクトディレクトリ作成**

```bash
# SSH接続
ssh -i ~/Downloads/server123.key youruser@yourserver.xserver.jp

# プロジェクトディレクトリ作成
cd /home/youruser/linkup.example.com/
mkdir -p public_html

# Gitリポジトリをクローン
cd public_html
git clone https://github.com/gcimaster-glitch/linkup-platform.git .

# 初回は手動でcomposerインストール（必要に応じて）
# composer install --no-dev
```

### **3-2. 環境変数ファイル作成**

```bash
# .envファイル作成
cd /home/youruser/linkup.example.com/public_html/php
nano .env
```

**.env の内容:**
```bash
# データベース設定
DB_HOST=mysqlXXX.xserver.jp
DB_NAME=youruser_linkup
DB_USER=youruser_linkup
DB_PASS=your_password_here

# バックエンドAPI設定
BACKEND_API_URL=https://linkup-backend.gcimaster.workers.dev
BACKEND_API_KEY=your_api_key_here

# セッション設定
SESSION_LIFETIME=7200
SESSION_SECURE=true
SESSION_HTTPONLY=true

# 環境設定
APP_ENV=production
APP_DEBUG=false
APP_URL=https://link-up.live
```

---

## 🤖 **Step 4: GitHub Actions 自動デプロイ設定**

### **4-1. GitHub Actions ワークフロー作成**

`.github/workflows/deploy-xserver.yml` を作成:

```yaml
name: Deploy to Xserver

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # 手動実行も可能

jobs:
  deploy:
    name: Deploy PHP Application
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.XSERVER_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.XSERVER_HOST }} >> ~/.ssh/known_hosts
      
      - name: Deploy via SSH
        env:
          XSERVER_HOST: ${{ secrets.XSERVER_HOST }}
          XSERVER_USER: ${{ secrets.XSERVER_USER }}
          DEPLOY_PATH: ${{ secrets.XSERVER_DEPLOY_PATH }}
        run: |
          ssh $XSERVER_USER@$XSERVER_HOST << 'EOF'
            cd ${{ secrets.XSERVER_DEPLOY_PATH }}
            
            # Gitから最新コードを取得
            git fetch origin main
            git reset --hard origin/main
            
            # Composerパッケージ更新（PHPフレームワーク使用時）
            # composer install --no-dev --optimize-autoloader
            
            # キャッシュクリア（必要に応じて）
            # php artisan cache:clear
            # php artisan config:cache
            
            # ファイル権限設定
            find . -type f -exec chmod 644 {} \;
            find . -type d -exec chmod 755 {} \;
            
            # ログ出力
            echo "Deployment completed at $(date)"
          EOF
      
      - name: Notify deployment status
        if: success()
        run: echo "✅ Deployment successful!"
      
      - name: Notify deployment failure
        if: failure()
        run: echo "❌ Deployment failed!"
```

### **4-2. デプロイテスト**

```bash
# ローカルでコード変更
echo "<!-- Test deploy -->" >> index.html
git add .
git commit -m "test: デプロイテスト"
git push origin main

# GitHub Actions が自動実行される
# https://github.com/gcimaster-glitch/linkup-platform/actions で確認
```

---

## 📁 **Step 5: PHP プロジェクト構造**

```
public_html/
├── .env                    # 環境変数（.gitignoreに追加）
├── .htaccess              # Apache設定
├── index.php              # エントリーポイント
├── config/
│   ├── database.php       # DB接続
│   └── session.php        # セッション設定
├── includes/
│   ├── header.php         # 共通ヘッダー
│   ├── footer.php         # 共通フッター
│   └── auth.php           # 認証関数
├── pages/
│   ├── home.php           # トップページ
│   ├── login.php          # ログイン
│   ├── dashboard.php      # ダッシュボード
│   ├── tickets.php        # チケット管理
│   └── payments.php       # 決済履歴
└── assets/
    ├── css/
    └── js/
```

---

## 🔒 **Step 6: セキュリティ設定**

### **6-1. .htaccess 設定**

```apache
# .htaccess
RewriteEngine On

# HTTPSリダイレクト
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# index.php を隠す
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php?page=$1 [QSA,L]

# .env ファイルへのアクセス拒否
<Files .env>
    Order allow,deny
    Deny from all
</Files>

# ディレクトリリスティング無効化
Options -Indexes

# PHP設定
php_flag display_errors Off
php_value upload_max_filesize 10M
php_value post_max_size 10M
```

### **6-2. セッションセキュリティ**

```php
// config/session.php
<?php
// セッション設定
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);

session_start();

// セッションハイジャック対策
if (!isset($_SESSION['user_agent'])) {
    $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
} elseif ($_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
    session_destroy();
    header('Location: /login.php');
    exit;
}
?>
```

---

## 🧪 **Step 7: デプロイ後のテスト**

### **7-1. 動作確認チェックリスト**

```bash
# SSH接続して確認
ssh -i ~/.ssh/server123.key youruser@yourserver.xserver.jp

# ファイルが正しく配置されているか確認
ls -la /home/youruser/linkup.example.com/public_html/

# PHP構文チェック
php -l /home/youruser/linkup.example.com/public_html/index.php

# Apache エラーログ確認
tail -f /home/youruser/log/yourserver.xserver.jp/error_log
```

### **7-2. ブラウザで確認**

1. https://link-up.live/ にアクセス
2. ログインページが表示されることを確認
3. ログイン → ダッシュボードが表示されることを確認
4. チケット・決済履歴が表示されることを確認

---

## 📊 **Xserver vs Cloudflare Pages 比較**

| 項目 | Xserver | Cloudflare Pages |
|------|---------|------------------|
| **PHP対応** | ✅ 完全対応 | ❌ 非対応 |
| **MySQL** | ✅ 標準搭載 | ❌ 非対応 |
| **セッション** | ✅ PHPセッション | ❌ 非対応 |
| **SSH接続** | ✅ 可能 | ❌ 不可 |
| **FTP/SFTP** | ✅ 可能 | ❌ 不可 |
| **自動デプロイ** | ✅ GitHub Actions | ✅ Git連携 |
| **月額費用** | ¥1,000前後 | 無料 |
| **速度** | 🟡 普通 | ✅ 高速（CDN） |
| **SSL証明書** | ✅ 無料 | ✅ 無料 |

---

## 🎯 **推奨構成：ハイブリッド**

### **最適解: Xserver（PHP） + Cloudflare（CDN + Workers）**

```
ユーザー
  ↓
Cloudflare CDN (静的ファイル高速配信)
  ↓
Xserver (PHPアプリ実行)
  ↓
Cloudflare Workers (バックエンドAPI)
  ↓
Cloudflare D1 (データベース)
```

**メリット:**
- ✅ PHPが使える
- ✅ セッション管理が簡単
- ✅ 静的ファイルはCDNで高速配信
- ✅ バックエンドAPIはそのまま使用
- ✅ 自動デプロイ可能

---

## 💰 **コスト試算**

### **Xserver スタンダードプラン**
- 初期費用: 無料（キャンペーン時）
- 月額費用: ¥990〜（36ヶ月契約）
- ディスク容量: 300GB（十分）
- MySQL: 無制限
- SSL証明書: 無料

### **合計コスト**
- Xserver: ¥990/月
- Cloudflare Workers: 無料〜$5/月
- **合計: ¥1,000〜1,500/月**

---

## ✅ **実装チェックリスト**

### **事前準備**
- [ ] Xserver 契約確認
- [ ] SSH接続設定
- [ ] MySQL データベース作成
- [ ] ドメイン設定・SSL設定

### **開発環境**
- [ ] ローカルにPHP開発環境構築（XAMPP/MAMPなど）
- [ ] Git リポジトリ準備
- [ ] GitHub Secrets 設定

### **実装**
- [ ] PHPプロジェクト構造作成
- [ ] 認証システム実装
- [ ] ダッシュボード実装
- [ ] チケット・決済履歴実装

### **デプロイ**
- [ ] GitHub Actions ワークフロー作成
- [ ] 初回デプロイ（手動）
- [ ] 自動デプロイテスト
- [ ] 本番環境テスト

---

## 🚀 **次のステップ**

1. Xserver の契約状況を確認
2. SSH接続を有効化
3. GitHub Actions を設定
4. PHPプロジェクトの実装開始

---

**作成日**: 2026-02-15  
**予定完了日**: 2026-02-19（4日後）  
**難易度**: ★★☆☆☆（中級者向け、サポートあり）
