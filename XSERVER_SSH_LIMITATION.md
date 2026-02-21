# 🚨 Xserver ビジネスプラン SSH制限について

## 📊 **状況報告**

### **確認できたこと**
✅ SSH鍵は正しい（サーバーが鍵を受け入れた）  
✅ 認証は成功している  
❌ しかし接続が即座に閉じられる

### **原因**
Xserver ビジネスプラン（xbiz）では、**SSH接続が制限されている**可能性があります。

```
通常のXserver: ssh接続可能（sv*.xserver.jp）
Xserver ビジネス: ssh接続制限（xb*.xbiz.jp）← あなたのサーバー
```

---

## 🔄 **代替デプロイ方法**

### **方法1: SFTP/FTP デプロイ（推奨）**

XserverはFTP/SFTPは利用可能です。

#### **接続情報**
```
プロトコル: SFTP（SSH File Transfer Protocol）
ホスト: xb107236.xbiz.jp
ポート: 10022
ユーザー名: xb107236
認証方式: 公開鍵認証（xb107236.key）
```

#### **GitHub Actions での自動デプロイ**
```yaml
name: Deploy to Xserver via SFTP

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy via SFTP
        uses: wlixcc/SFTP-Deploy-Action@v1.2.4
        with:
          username: xb107236
          server: xb107236.xbiz.jp
          port: 10022
          ssh_private_key: ${{ secrets.XSERVER_SSH_KEY }}
          local_path: './*'
          remote_path: '/home/xb107236/link-up.live/public_html'
          sftp_only: true
```

---

### **方法2: Gitリポジトリから手動デプロイ**

Xserverのファイルマネージャー経由で：

1. サーバーパネル → ファイル管理
2. public_html ディレクトリに移動
3. GitHubからzipダウンロード → アップロード → 解凍

---

### **方法3: FTP クライアント利用**

#### **FileZilla 設定**
```
ホスト: sftp://xb107236.xbiz.jp
ポート: 10022
プロトコル: SFTP
ログオンタイプ: 鍵ファイル
ユーザー: xb107236
鍵ファイル: xb107236.key（ppk形式に変換必要）
```

---

## 🎯 **推奨アプローチ**

### **即座に実装可能：SFTP自動デプロイ**

以下の手順で設定します：

1. **GitHub Secretsに鍵を登録**（済み）
2. **SFTP デプロイワークフロー作成**
3. **初回手動アップロード**（FTP経由）
4. **以降は git push で自動デプロイ**

---

## ✅ **次のステップ**

### **Option A: SFTP自動デプロイを設定する**
→ GitHub Actions で SFTP 経由デプロイ
→ git push すると自動アップロード
→ **推奨：これが最も簡単**

### **Option B: 手動FTPアップロードで進める**
→ FileZilla などで毎回手動アップロード
→ 自動化なし

### **Option C: SSH制限解除をXserverに問い合わせ**
→ ビジネスプランでSSH解除可能か確認
→ 時間がかかる可能性あり

---

## 🚀 **私の推奨：Option A（SFTP自動デプロイ）**

理由：
- ✅ 即座に実装可能
- ✅ git push で自動デプロイ
- ✅ SSH制限を回避
- ✅ セキュア（SFTP使用）

---

**どの方法で進めますか？「A」「B」「C」でお答えください。**

「A」を選択いただければ、今すぐSFTP自動デプロイを設定します！
