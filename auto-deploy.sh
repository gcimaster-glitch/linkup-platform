#!/bin/bash

# ============================================
# LinkUp 完全自動デプロイスクリプト
# プロジェクト: linkup-platform
# ドメイン: linkup-demo.pages.dev
# ============================================

set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# ロゴ表示
echo -e "${PURPLE}"
cat << "EOF"
  _     _       _    _   _       
 | |   (_)_ __ | | _| | | |_ __  
 | |   | | '_ \| |/ / | | | '_ \ 
 | |___| | | | |   <| |_| | |_) |
 |_____|_|_| |_|_|\_\\___/| .__/ 
                          |_|    
  人と機会を繋げる
EOF
echo -e "${NC}"

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}   LinkUp 完全自動デプロイスクリプト${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# 前提条件チェック
echo -e "${BLUE}📋 前提条件チェック中...${NC}"

# Node.jsチェック
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.jsがインストールされていません${NC}"
    echo "https://nodejs.org からインストールしてください"
    exit 1
fi
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

# npmチェック
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npmがインストールされていません${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm: $(npm --version)${NC}"

# Wranglerチェック
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}⚠ Wrangler CLIがインストールされていません${NC}"
    echo "インストールしますか? (y/n)"
    read -p "> " INSTALL_WRANGLER
    if [ "$INSTALL_WRANGLER" = "y" ]; then
        npm install -g wrangler
        echo -e "${GREEN}✓ Wrangler インストール完了${NC}"
    else
        exit 1
    fi
fi
echo -e "${GREEN}✓ Wrangler: $(wrangler --version)${NC}"

echo ""
echo -e "${BLUE}🔑 Cloudflareログイン確認${NC}"
if ! wrangler whoami &> /dev/null; then
    echo "Cloudflareにログインしてください"
    wrangler login
fi
echo -e "${GREEN}✓ Cloudflareログイン済み${NC}"

echo ""
echo -e "${BLUE}📊 プロジェクト情報${NC}"
echo "プロジェクト名: linkup-platform"
echo "ドメイン: linkup-demo.pages.dev"
echo ""

# ============================================
# Step 1: D1データベース作成
# ============================================
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Step 1: D1データベース作成${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "データベース名: linkup-db"
wrangler d1 create linkup-db > /tmp/d1_output.txt 2>&1 || true

if grep -q "already exists" /tmp/d1_output.txt; then
    echo -e "${YELLOW}⚠ データベースは既に存在します${NC}"
    DATABASE_ID=$(wrangler d1 list | grep linkup-db | awk '{print $2}')
else
    DATABASE_ID=$(grep "database_id" /tmp/d1_output.txt | awk -F'"' '{print $2}')
    echo -e "${GREEN}✓ データベース作成完了${NC}"
fi

if [ -z "$DATABASE_ID" ]; then
    echo -e "${RED}✗ database_idの取得に失敗しました${NC}"
    echo "手動で確認してください: wrangler d1 list"
    exit 1
fi

echo "Database ID: $DATABASE_ID"

# wrangler.toml更新
sed -i.bak "s/YOUR_D1_DATABASE_ID/$DATABASE_ID/g" backend/wrangler.toml
echo -e "${GREEN}✓ wrangler.toml 更新完了${NC}"

# スキーマ適用
echo "スキーマを適用中..."
wrangler d1 execute linkup-db --file=database/schema.sql --remote
echo -e "${GREEN}✓ スキーマ適用完了（16テーブル作成）${NC}"

# ============================================
# Step 2: R2バケット作成
# ============================================
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Step 2: R2バケット作成${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

wrangler r2 bucket create linkup-storage 2>&1 || echo -e "${YELLOW}⚠ バケットは既に存在する可能性があります${NC}"
echo -e "${GREEN}✓ R2バケット準備完了${NC}"

# ============================================
# Step 3: KVネームスペース作成
# ============================================
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Step 3: KVネームスペース作成${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

wrangler kv:namespace create LINKUP_KV > /tmp/kv_output.txt 2>&1 || true

if grep -q "already exists" /tmp/kv_output.txt; then
    echo -e "${YELLOW}⚠ KVネームスペースは既に存在します${NC}"
    KV_ID=$(wrangler kv:namespace list | grep LINKUP_KV | awk '{print $2}')
else
    KV_ID=$(grep "id" /tmp/kv_output.txt | awk -F'"' '{print $2}')
    echo -e "${GREEN}✓ KVネームスペース作成完了${NC}"
fi

if [ -n "$KV_ID" ]; then
    sed -i.bak "s/YOUR_KV_NAMESPACE_ID/$KV_ID/g" backend/wrangler.toml
    echo "KV ID: $KV_ID"
    echo -e "${GREEN}✓ wrangler.toml 更新完了${NC}"
fi

# ============================================
# Step 4: Secrets設定
# ============================================
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Step 4: Secrets設定${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd backend

# JWT_SECRET
echo ""
echo "JWT_SECRETを自動生成します..."
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
echo "$JWT_SECRET" | wrangler secret put JWT_SECRET
echo -e "${GREEN}✓ JWT_SECRET 設定完了${NC}"

# Stripe
echo ""
echo -e "${YELLOW}Stripe設定（テストモード）${NC}"
echo "Stripe Secret Key (sk_test_...) を入力してください:"
echo "（持っていない場合は、stripe.com でアカウント作成）"
read -p "sk_test_: " STRIPE_KEY

if [ -n "$STRIPE_KEY" ]; then
    echo "$STRIPE_KEY" | wrangler secret put STRIPE_SECRET_KEY
    echo -e "${GREEN}✓ STRIPE_SECRET_KEY 設定完了${NC}"
else
    echo -e "${YELLOW}⚠ Stripeキーはスキップされました（後で設定してください）${NC}"
fi

# Gemini API（オプション）
echo ""
echo "Gemini API Key を設定しますか? (y/n)"
echo "（AIコンシェルジュ機能に必要。後で設定も可能）"
read -p "> " SET_GEMINI

if [ "$SET_GEMINI" = "y" ]; then
    echo "Gemini API Key を入力:"
    read -p "> " GEMINI_KEY
    if [ -n "$GEMINI_KEY" ]; then
        echo "$GEMINI_KEY" | wrangler secret put GEMINI_API_KEY
        echo -e "${GREEN}✓ GEMINI_API_KEY 設定完了${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Gemini APIはスキップ（後で設定可能）${NC}"
fi

cd ..

# ============================================
# Step 5: バックエンドデプロイ
# ============================================
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Step 5: バックエンドデプロイ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd backend
echo "依存関係をインストール中..."
npm install --silent

echo "バックエンドをデプロイ中..."
npm run deploy

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ バックエンドデプロイ完了${NC}"
    BACKEND_URL=$(wrangler deployments list 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)
    echo "デプロイURL: $BACKEND_URL"
else
    echo -e "${RED}✗ デプロイに失敗しました${NC}"
    exit 1
fi

cd ..

# ============================================
# Step 6: GitHub連携
# ============================================
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Step 6: GitHub連携${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "GitHubリポジトリを作成しますか? (y/n)"
read -p "> " CREATE_REPO

if [ "$CREATE_REPO" = "y" ]; then
    # Gitチェック
    if ! command -v git &> /dev/null; then
        echo -e "${RED}✗ gitがインストールされていません${NC}"
        exit 1
    fi
    
    # Git初期化
    if [ ! -d .git ]; then
        git init
        git add .
        git commit -m "Initial commit: LinkUp - 人と機会を繋げる"
        git branch -M main
        echo -e "${GREEN}✓ Git初期化完了${NC}"
    fi
    
    echo ""
    echo "GitHubのユーザー名を入力してください:"
    read -p "> " GITHUB_USER
    
    echo ""
    echo "次の手順:"
    echo "1. https://github.com/new を開く"
    echo "2. リポジトリ名: linkup-platform"
    echo "3. Publicまたは Private を選択"
    echo "4. Create repository をクリック"
    echo ""
    echo "作成したら、Enterキーを押してください"
    read
    
    # リモート追加
    git remote add origin "https://github.com/$GITHUB_USER/linkup-platform.git" 2>/dev/null || git remote set-url origin "https://github.com/$GITHUB_USER/linkup-platform.git"
    
    echo "GitHubにpushします..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ GitHubへのpush完了${NC}"
    else
        echo -e "${YELLOW}⚠ pushに失敗しました（認証が必要な場合があります）${NC}"
    fi
fi

# ============================================
# Step 7: Cloudflare Pages設定案内
# ============================================
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Step 7: Cloudflare Pages設定${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo "Cloudflare Pagesでフロントエンドをデプロイします:"
echo ""
echo "1. https://dash.cloudflare.com/ を開く"
echo "2. Pages → Create a project"
echo "3. Connect to Git → GitHubリポジトリ選択"
echo "4. ビルド設定:"
echo "   - Build command: npm run build"
echo "   - Build output directory: out"
echo "   - Root directory: frontend"
echo "5. 環境変数:"
echo "   NEXT_PUBLIC_API_URL=$BACKEND_URL"
echo "   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "6. Save and Deploy"
echo ""

# ============================================
# 完了
# ============================================
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ デプロイ完了！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📊 デプロイ情報${NC}"
echo "バックエンドAPI: $BACKEND_URL"
echo "フロントエンド: https://linkup-demo.pages.dev (Pages設定後)"
echo ""
echo -e "${CYAN}🔗 次のステップ${NC}"
echo "1. Cloudflare Pagesでフロントエンドデプロイ（上記手順）"
echo "2. https://linkup-demo.pages.dev でアクセス"
echo "3. QR入場管理システムをテスト"
echo ""
echo -e "${CYAN}📚 ドキュメント${NC}"
echo "- README.md: プロジェクト概要"
echo "- DEPLOY_FOR_DEVELOPER.md: 詳細手順"
echo "- docs/qr-checkin.md: QR入場管理マニュアル"
echo ""
echo -e "${PURPLE}🔗 LinkUp - 人と機会を繋げる${NC}"
echo ""
