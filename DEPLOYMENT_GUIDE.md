# 🚀 デプロイ確認ガイド

## 📊 現在の状況

- ✅ 最新コミット: `aae84a2` (イベント作成機能修正)
- ✅ GitHubプッシュ: 完了
- ⏳ Cloudflare Pages自動デプロイ: 確認待ち

---

## 🔍 デプロイ状況の確認方法

### 方法1: Cloudflare Dashboard で確認（推奨）

1. **Cloudflare Dashboard にログイン**
   - https://dash.cloudflare.com/

2. **Workers & Pages を開く**
   - 左メニュー → Workers & Pages

3. **linkup プロジェクトを選択**
   - プロジェクト一覧から「linkup」をクリック

4. **デプロイ履歴を確認**
   - 「Deployments」タブをクリック
   - 最新のデプロイを確認:
     - ✅ **Success** = デプロイ完了
     - 🔄 **Building** = ビルド中
     - ❌ **Failed** = エラー

5. **デプロイログを確認**
   - デプロイをクリック → ログを確認
   - エラーがある場合はログに表示される

---

## 🔄 手動デプロイ（自動デプロイが動作しない場合）

### 方法A: Cloudflare Dashboard からデプロイ

1. **Cloudflare Dashboard** にログイン
2. **Workers & Pages** → **linkup**
3. **「Create deployment」** をクリック
4. **ブランチ選択**: `main`
5. **「Save and Deploy」** をクリック

### 方法B: Wrangler CLI でデプロイ

```bash
# 1. Cloudflare にログイン
wrangler login

# 2. Pages にデプロイ
wrangler pages deploy . --project-name=linkup

# または npx を使用
npx wrangler pages deploy . --project-name=linkup
```

---

## 🎯 デプロイ確認チェックリスト

### ステップ1: Cloudflare Dashboard 確認

- [ ] Cloudflare Dashboard にログイン
- [ ] Workers & Pages → linkup を開く
- [ ] 最新のデプロイが表示されている
- [ ] デプロイステータスが「Success」

### ステップ2: サイト動作確認

- [ ] https://link-up.live/ にアクセス
- [ ] F12 → Console を開く
- [ ] ページを再読み込み (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] キャッシュクリア確認

### ステップ3: 機能確認

- [ ] ログイン (organizer@demo.com / demo)
- [ ] イベント作成ページを開く
- [ ] ✅ デフォルトチケットが1つ表示される
- [ ] イベント情報を入力して保存
- [ ] ✅ 保存成功メッセージが表示される

---

## 🐛 デプロイエラーの対処法

### エラー1: Build failed

**原因**: ビルドスクリプトエラー

**解決**:
```toml
# wrangler.toml を確認
pages_build_output_dir = "."

# もしくは
pages_build_output_dir = "frontend/dist_static_fallback"
```

### エラー2: No such file or directory

**原因**: index.html が見つからない

**解決**:
```bash
# ファイルが存在するか確認
ls -la index.html
ls -la frontend/dist_static_fallback/index.html

# 必要に応じてコピー
cp index.html frontend/dist_static_fallback/
```

### エラー3: デプロイが遅い

**原因**: ビルド待機中

**解決**:
- 5-10分待つ（通常は2-3分で完了）
- Cloudflare Dashboard でビルドログを確認

---

## 💡 キャッシュクリア方法

### ブラウザキャッシュ

**Chrome / Edge**:
```
1. F12 → Network タブ
2. 「Disable cache」にチェック
3. ページ再読み込み (Ctrl+Shift+R)
```

**Safari**:
```
1. 開発 → キャッシュを空にする
2. ページ再読み込み (Cmd+Shift+R)
```

### Cloudflare キャッシュ

1. **Cloudflare Dashboard**
2. **Caching** → **Configuration**
3. **Purge Cache** → **Purge Everything**

---

## 📱 モバイルでの確認

### iOS Safari
```
1. 設定 → Safari
2. 「履歴とWebサイトデータを消去」
3. link-up.live にアクセス
```

### Android Chrome
```
1. 設定 → プライバシーとセキュリティ
2. 「閲覧履歴データの削除」
3. link-up.live にアクセス
```

---

## 🔍 デバッグコマンド

### ローカルで確認
```bash
# index.html のサイズ確認
ls -lh index.html

# 最終更新日時
stat -c '%y %n' index.html

# Git状態確認
git status
git log --oneline -1
```

### リモート確認
```bash
# GitHub の最新コミット確認
git ls-remote origin main

# デプロイされたファイル確認
curl -I https://link-up.live/
```

---

## 📊 期待される結果

### デプロイ成功時

**Cloudflare Dashboard**:
```
✅ Status: Success
✅ Branch: main
✅ Commit: aae84a2
✅ Build time: 1-3 minutes
✅ Deploy time: 30 seconds
```

**ブラウザコンソール**:
```javascript
🚀 LinkUp Platform v3.1-CACHE-FIX
Build: 2026-02-10T06:55:00Z | API-Connected | Auth: Real Backend
Service Worker: DISABLED | Caches: CLEARED
```

**機能確認**:
```
✅ ログイン成功
✅ イベント作成ページ表示
✅ デフォルトチケット自動追加
✅ 保存ボタン動作
✅ モバイル表示正常
```

---

## 🆘 サポート

### デプロイに失敗する場合

1. **Cloudflare Dashboard のログを確認**
   - エラーメッセージをコピー
   - Google で検索 or GitHub Issues

2. **手動デプロイを試す**
   - Cloudflare Dashboard から手動デプロイ
   - または Wrangler CLI を使用

3. **問題報告**
   - GitHub Issues: https://github.com/gcimaster-glitch/linkup-platform/issues
   - エラーログを添付

---

## ✅ 確認完了後

デプロイが成功したら:

1. ✅ ログインテスト
2. ✅ イベント作成テスト
3. ✅ AI生成テスト
4. ✅ モバイル表示確認

全て成功したら完了です！ 🎉

---

**作成日時**: 2026-02-12  
**最終コミット**: aae84a2  
**デプロイ先**: https://link-up.live/  
**所要時間**: 2-5分

---

## 🚀 クイックコマンド

```bash
# 1. 状況確認
git log --oneline -1

# 2. 最新を取得（念のため）
git pull origin main

# 3. 変更があればプッシュ
git push origin main

# 4. サイト確認（キャッシュクリア付き）
# Ctrl+Shift+R でページ再読み込み
```

**次のアクション**: Cloudflare Dashboard でデプロイ状況を確認してください！
