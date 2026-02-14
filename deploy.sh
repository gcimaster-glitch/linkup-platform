#!/bin/bash
# LinkUp Platform バックエンドデプロイスクリプト
# 実行前に Cloudflare API Token を設定してください

set -e  # エラー時に停止

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  LinkUp Platform バックエンドデプロイ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cloudflare API Token の確認
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ エラー: CLOUDFLARE_API_TOKEN が設定されていません"
    echo ""
    echo "以下のコマンドでトークンを設定してください:"
    echo "export CLOUDFLARE_API_TOKEN=\"your-token-here\""
    echo ""
    echo "トークン取得方法:"
    echo "1. https://dash.cloudflare.com/profile/api-tokens にアクセス"
    echo "2. 'Create Token' をクリック"
    echo "3. 'Edit Cloudflare Workers' テンプレートを選択"
    echo "4. トークンをコピーして上記コマンドで設定"
    echo ""
    exit 1
fi

echo "✅ Cloudflare API Token: 設定済み"
echo ""

# バックエンドディレクトリに移動
echo "📁 バックエンドディレクトリに移動..."
cd /home/user/webapp/backend

# wrangler のバージョン確認
echo ""
echo "🔧 Wrangler バージョン確認..."
npx wrangler --version

# デプロイ前の確認
echo ""
echo "📋 デプロイ前チェック..."
echo "  - プロジェクト: linkup-backend"
echo "  - エントリーポイント: src/index.ts"
echo "  - データベース: linkup-db"
echo "  - R2バケット: linkup-storage"
echo ""

read -p "デプロイを実行しますか？ (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ デプロイをキャンセルしました"
    exit 0
fi

echo ""
echo "🚀 デプロイを開始します..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# デプロイ実行
npm run deploy

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ デプロイ完了"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# デプロイ後の確認
echo "🔍 デプロイ確認を実行します..."
echo ""

# ヘルスチェック
echo "【1. ヘルスチェック】"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" https://linkup-backend.gcimaster.workers.dev/)
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_STATUS")

if [ "$http_status" = "200" ]; then
    echo "✅ Status: $http_status"
    echo "✅ Response: $body"
else
    echo "❌ Status: $http_status"
    echo "❌ Response: $body"
fi

echo ""
echo "【2. 統合テスト実行】"
cd /home/user/webapp
node test_comprehensive.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 デプロイとテストが完了しました"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "次のステップ:"
echo "1. フロントエンドで動作確認: https://link-up.live/"
echo "2. ログインしてダッシュボードが表示されることを確認"
echo "3. データベース移行を実行（24時間以内推奨）"
echo ""
