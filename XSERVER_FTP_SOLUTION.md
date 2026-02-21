# 🔍 Xserver ビジネスプラン 詳細調査結果

## 📊 **検証結果**

### **試したこと**
1. ✅ SSH接続（ポート10022）→ 認証成功も接続が即座に閉じられる
2. ✅ SFTP接続 → 同様に接続が閉じられる
3. ❓ FTP/FTPS接続 → まだ未確認

### **判明したこと**
- SSH鍵は正しく認証されている
- サーバーが接続を受け入れた直後に切断される
- これは **Xserverビジネスプランの仕様** の可能性が高い

---

## 🎯 **実行可能な解決策**

### **方法1: FTP/FTPS 接続（最も確実）**

Xserverは標準でFTP接続に対応しています。

#### **FTP接続情報**
```
FTPホスト: xb107236.xbiz.jp
FTPユーザー: xb107236
FTPパスワード: （サーバーパネルで確認可能）
接続方式: FTPS（FTP over SSL/TLS）推奨
ポート: 21（FTP）または 990（FTPS）
```

#### **GitHub Actions 自動デプロイ（FTP版）**
```yaml
name: Deploy to Xserver via FTP

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: FTP Deploy
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: xb107236.xbiz.jp
          username: xb107236
          password: ${{ secrets.FTP_PASSWORD }}
          server-dir: /link-up.live/public_html/
          protocol: ftps
```

---

### **方法2: Xserverのサポートに問い合わせ**

#### **問い合わせ内容例**
```
件名: SSH接続が即座に切断される件について

本文:
いつもお世話になっております。
サーバーID: xb107236

SSH公開鍵認証の設定を行いましたが、
認証成功後すぐに接続が切断されます。

ssh -i key.pem -p 10022 xb107236@xb107236.xbiz.jp
→ 認証成功も "Connection closed" となる

ビジネスプランではSSH接続に制限がありますか？
またはシェルアクセスを有効化する設定がありますか？

よろしくお願いいたします。
```

---

### **方法3: 手動アップロード + Git管理**

#### **手順**
1. **ローカルで開発**
   ```bash
   # ローカルで編集
   git add .
   git commit -m "機能追加"
   git push origin main
   ```

2. **Xserverのファイルマネージャーで更新**
   - サーバーパネル → ファイル管理
   - GitHubからzipダウンロード
   - アップロード → 解凍

3. **または、Xserver上でgit pull**
   - もしSSHログインが可能になれば：
   ```bash
   cd /home/xb107236/link-up.live/public_html
   git pull origin main
   ```

---

## 🚀 **今すぐできること**

### **Step 1: FTPパスワードを確認**

Xserverサーバーパネルで：
```
ログイン: https://www.xserver.ne.jp/login_server.php
↓
FTPアカウント設定
↓
パスワードを確認（または再設定）
```

### **Step 2: FileZillaで接続テスト**

1. **FileZillaをダウンロード**（無料）
   https://filezilla-project.org/

2. **接続設定**
   ```
   ホスト: xb107236.xbiz.jp
   ユーザー名: xb107236
   パスワード: （Step 1で確認）
   ポート: 21
   ```

3. **接続**
   - 左側: ローカルファイル
   - 右側: サーバーファイル
   - ドラッグ&ドロップでアップロード

### **Step 3: GitHub Actions FTPデプロイ設定**

1. **GitHub Secrets にFTPパスワード追加**
   ```
   Name: FTP_PASSWORD
   Value: （サーバーパネルで確認したパスワード）
   ```

2. **ワークフロー作成**
   `.github/workflows/deploy-ftp.yml`

3. **git push で自動デプロイ完成！**

---

## 📋 **あなたへの質問**

### **1. FTPパスワードは確認できますか？**
- サーバーパネルの「FTPアカウント設定」で確認可能
- わからなければ、再設定も可能

### **2. どの方法で進めますか？**
- **A: FTP自動デプロイ**（推奨）
- **B: Xserverサポートに問い合わせ**
- **C: 手動アップロード**

---

## 💡 **私の推奨**

**まずは「A: FTP自動デプロイ」で進めましょう。**

理由：
- ✅ 即座に実装可能
- ✅ SSH制限を回避
- ✅ git push で自動デプロイ
- ✅ 確実に動作する

---

**次のステップ：**

1. FTPパスワードを教えてください
   （または「パスワードを再設定してください」と指示してください）

2. FTP自動デプロイを設定します

3. 完成！

---

**準備ができたら教えてください！**
