#!/bin/bash

# 🚀 Xserver 自動デプロイスクリプト（SSH版）

# 使い方:
# 1. このスクリプトをプロジェクトルートに配置
# 2. chmod +x deploy-to-xserver.sh
# 3. ./deploy-to-xserver.sh

# ==================== 設定 ====================
XSERVER_HOST="yourserver.xserver.jp"
XSERVER_USER="youruser"
XSERVER_SSH_KEY="$HOME/.ssh/xserver_key"
DEPLOY_PATH="/home/youruser/linkup.example.com/public_html"

# ==================== カラー定義 ====================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==================== 関数定義 ====================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==================== メイン処理 ====================
echo "========================================"
echo "  Xserver 自動デプロイスクリプト"
echo "========================================"
echo ""

# 1. SSH接続確認
log_info "SSH接続を確認中..."
if ssh -i "$XSERVER_SSH_KEY" -o ConnectTimeout=5 "$XSERVER_USER@$XSERVER_HOST" "echo 'SSH OK'" > /dev/null 2>&1; then
    log_success "SSH接続成功"
else
    log_error "SSH接続失敗。以下を確認してください:"
    echo "  - SSH鍵のパス: $XSERVER_SSH_KEY"
    echo "  - ホスト: $XSERVER_HOST"
    echo "  - ユーザー: $XSERVER_USER"
    exit 1
fi

# 2. ローカルの変更をコミット
log_info "ローカルの変更を確認中..."
if [[ -n $(git status --porcelain) ]]; then
    log_warning "未コミットの変更があります"
    read -p "コミットしてプッシュしますか？ (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "コミットメッセージ: " commit_msg
        git add .
        git commit -m "$commit_msg"
        git push origin main
        log_success "コミット＆プッシュ完了"
    else
        log_warning "デプロイをスキップします"
        exit 0
    fi
else
    log_info "未コミットの変更はありません"
fi

# 3. リモートサーバーにデプロイ
log_info "Xserver にデプロイ中..."
ssh -i "$XSERVER_SSH_KEY" "$XSERVER_USER@$XSERVER_HOST" << EOF
    set -e
    
    echo "📁 ディレクトリ移動: $DEPLOY_PATH"
    cd $DEPLOY_PATH
    
    echo "🔄 Git pull 実行中..."
    git fetch origin main
    git reset --hard origin/main
    
    echo "🔒 ファイル権限設定中..."
    find . -type f -exec chmod 644 {} \;
    find . -type d -exec chmod 755 {} \;
    
    echo "✅ デプロイ完了: \$(date '+%Y-%m-%d %H:%M:%S')"
EOF

if [ $? -eq 0 ]; then
    log_success "デプロイ成功！"
    echo ""
    echo "🌐 サイトを確認:"
    echo "   https://link-up.live/"
else
    log_error "デプロイ失敗"
    exit 1
fi

echo ""
echo "========================================"
echo "  デプロイ完了"
echo "========================================"
