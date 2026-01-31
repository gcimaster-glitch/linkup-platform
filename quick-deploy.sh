#!/bin/bash

# LinkUp クイックデプロイスクリプト
# 対話形式で順番にデプロイ

echo "🔗 LinkUp クイックデプロイ"
echo "======================================"
echo ""
echo "このスクリプトは以下を実行します:"
echo "1. Cloudflare D1データベース作成"
echo "2. スキーマ適用"
echo "3. R2バケット作成"
echo "4. バックエンドデプロイ"
echo ""
read -p "続行しますか? (y/n): " CONTINUE

if [ "$CONTINUE" != "y" ]; then
    echo "中止しました"
    exit 0
fi

echo ""
echo "========================================="
echo "Step 1/4: D1データベース作成"
echo "========================================="
echo ""
echo "実行中: wrangler d1 create linkup-db"
echo ""

wrangler d1 create linkup-db > /tmp/d1_output.txt 2>&1

if [ $? -eq 0 ]; then
    echo "✅ データベース作成成功"
    cat /tmp/d1_output.txt
    echo ""
    echo "⚠️ 重要: 上記の database_id をコピーして、"
    echo "   backend/wrangler.toml の YOUR_D1_DATABASE_ID を置き換えてください"
    echo ""
    read -p "database_id を入力してください: " DB_ID
    
    if [ -n "$DB_ID" ]; then
        # macOS と Linux 両対応
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/YOUR_D1_DATABASE_ID/$DB_ID/g" backend/wrangler.toml
        else
            sed -i "s/YOUR_D1_DATABASE_ID/$DB_ID/g" backend/wrangler.toml
        fi
        echo "✅ wrangler.toml 更新完了"
    fi
else
    echo "❌ データベース作成に失敗しました"
    cat /tmp/d1_output.txt
    exit 1
fi

echo ""
read -p "Step 2に進みますか? (y/n): " CONTINUE_STEP2
if [ "$CONTINUE_STEP2" != "y" ]; then
    echo "スクリプトを終了します。後で再開してください。"
    exit 0
fi

echo ""
echo "========================================="
echo "Step 2/4: スキーマ適用"
echo "========================================="
echo ""

wrangler d1 execute linkup-db --file=database/schema.sql --remote

if [ $? -eq 0 ]; then
    echo "✅ スキーマ適用成功"
else
    echo "❌ スキーマ適用に失敗しました"
    exit 1
fi

echo ""
read -p "Step 3に進みますか? (y/n): " CONTINUE_STEP3
if [ "$CONTINUE_STEP3" != "y" ]; then
    exit 0
fi

echo ""
echo "========================================="
echo "Step 3/4: R2バケット作成"
echo "========================================="
echo ""

wrangler r2 bucket create linkup-storage

if [ $? -eq 0 ]; then
    echo "✅ R2バケット作成成功"
else
    echo "⚠️ R2バケット作成に失敗（既に存在する可能性があります）"
fi

echo ""
read -p "Step 4に進みますか? (y/n): " CONTINUE_STEP4
if [ "$CONTINUE_STEP4" != "y" ]; then
    exit 0
fi

echo ""
echo "========================================="
echo "Step 4/4: バックエンドデプロイ"
echo "========================================="
echo ""
echo "まず、Secretsを設定します..."
echo ""

cd backend

echo "JWT_SECRET を設定します"
echo "自動生成した値を使用しますか? (y/n)"
read -p "> " AUTO_JWT

if [ "$AUTO_JWT" = "y" ]; then
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 32)
        echo "$JWT_SECRET" | wrangler secret put JWT_SECRET
        echo "✅ JWT_SECRET 設定完了"
    else
        echo "⚠️ opensslが見つかりません。手動で設定してください:"
        wrangler secret put JWT_SECRET
    fi
else
    echo "JWT_SECRETを入力してください:"
    wrangler secret put JWT_SECRET
fi

echo ""
echo "Stripe Secret Key を設定しますか? (後でも可能)"
read -p "(y/n): " SET_STRIPE
if [ "$SET_STRIPE" = "y" ]; then
    echo "Stripe Secret Key (sk_test_...) を入力:"
    wrangler secret put STRIPE_SECRET_KEY
fi

echo ""
echo "依存関係をインストールします..."
npm install

echo ""
echo "デプロイを開始します..."
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ バックエンドデプロイ完了！"
    echo "========================================="
    echo ""
    echo "次のステップ:"
    echo "1. 出力されたWorker URLをメモ"
    echo "2. GitHubリポジトリ作成: https://github.com/new"
    echo "3. リポジトリ名: linkup-platform"
    echo "4. Cloudflare Pages でフロントエンドデプロイ"
    echo ""
    echo "詳細は DEPLOY_GUIDE.md を参照してください"
else
    echo "❌ デプロイに失敗しました"
    exit 1
fi

cd ..
