# 🚀 Xserver + LAMP 段階的移行計画

## 📊 **移行戦略：2段階アプローチ**

---

## 🎯 **Phase 1: Xserver移行（1-2日）**

### **目的**
- Cloudflare Pagesの制約から解放
- 既存機能を安定稼働させる
- 自動デプロイ環境を構築

### **実施内容**

#### **Day 1: Xserver設定**
```
Morning (3時間):
├ Xserverサーバーパネル設定
│ ├ SSH接続を有効化
│ ├ MySQL データベース作成
│ └ ドメイン設定（link-up.live）
│
└ ローカルPCでSSH接続テスト

Afternoon (3時間):
├ 既存コードをXserverにアップロード
│ ├ SSH経由でGitクローン
│ └ ファイル権限設定
│
└ 動作確認
  ├ トップページ表示確認
  ├ ログイン機能確認
  └ ダッシュボード確認
```

#### **Day 2: 自動デプロイ設定**
```
Morning (2時間):
├ GitHub Secrets 設定
│ ├ XSERVER_HOST
│ ├ XSERVER_USER
│ ├ XSERVER_SSH_KEY
│ └ XSERVER_DEPLOY_PATH
│
└ GitHub Actions ワークフロー作成

Afternoon (2時間):
├ 自動デプロイテスト
│ ├ テストコミット作成
│ ├ push → 自動デプロイ確認
│ └ 本番環境で動作確認
│
└ ✅ Phase 1 完了
```

### **Phase 1 完了時の状態**

```
✅ 達成:
├ Xserverで安定稼働
├ 既存機能は全て動作
├ git push で自動デプロイ
├ 白画面問題は解決
└ 公開可能な状態

❌ 未実装:
├ PHP多ページ化
├ セッション管理
└ 新機能追加
  （Phase 2で実装）
```

---

## 🏗️ **Phase 2: LAMP化（3-4日）**

### **目的**
- PHPで多ページ化
- セッション管理実装
- 機能追加・改善

### **開発フロー（あなたの指示 → 私が実装）**

---

### **例1: ダッシュボードのPHP化**

#### **あなたの指示（シンプルでOK）**
```
「ダッシュボードをPHPページに分割してください」
```

#### **私がやること**
```
1. ファイル作成:
   ├ php/pages/dashboard.php
   ├ php/includes/auth.php（セッション認証）
   └ php/includes/header.php（共通ヘッダー）

2. 実装内容:
   <?php
   // セッション認証
   require_once '../includes/auth.php';
   require_auth(); // ログイン必須
   
   // ユーザー情報取得
   $user = get_current_user();
   
   // ヘッダー読み込み
   include '../includes/header.php';
   ?>
   
   <div class="dashboard">
     <h1>ダッシュボード</h1>
     <p>ようこそ、<?= htmlspecialchars($user['name']) ?>さん</p>
   </div>

3. コミット＆プッシュ:
   git add php/pages/dashboard.php
   git commit -m "feat: ダッシュボードをPHP化"
   git push origin main
   ↓
   自動的にXserverにデプロイ！

4. 確認:
   https://link-up.live/php/pages/dashboard.php
```

---

### **例2: チケット管理ページ追加**

#### **あなたの指示**
```
「チケット管理ページを追加してください。
空の場合は『チケットがありません』と表示してください」
```

#### **私がやること**
```
1. ファイル作成:
   php/pages/tickets.php

2. 実装:
   <?php
   require_once '../includes/auth.php';
   require_auth();
   
   // バックエンドAPIからチケット取得
   $tickets = api_call('/api/orders');
   
   include '../includes/header.php';
   ?>
   
   <div class="tickets-page">
     <h1>チケット管理</h1>
     
     <?php if (empty($tickets)): ?>
       <!-- 空状態 -->
       <div class="empty-state">
         <p>まだチケットを購入していません</p>
         <a href="/events">イベントを探す</a>
       </div>
     <?php else: ?>
       <!-- チケット一覧 -->
       <?php foreach ($tickets as $ticket): ?>
         <div class="ticket-card">
           <h3><?= htmlspecialchars($ticket['event_name']) ?></h3>
           <p>¥<?= number_format($ticket['amount']) ?></p>
         </div>
       <?php endforeach; ?>
     <?php endif; ?>
   </div>

3. デプロイ:
   git push → 自動反映

4. 確認:
   https://link-up.live/php/pages/tickets.php
```

---

### **例3: 決済履歴ページ追加**

#### **あなたの指示**
```
「決済履歴ページを追加してください。
決済状況ごとに色分けしてください（完了=緑、保留=黄色、キャンセル=赤）」
```

#### **私がやること**
```
1. ファイル作成:
   php/pages/payments.php

2. 実装:
   <?php
   $payments = api_call('/api/user/payment-history');
   ?>
   
   <div class="payments-page">
     <h1>決済履歴</h1>
     
     <?php if (empty($payments)): ?>
       <div class="empty-state">
         <p>決済履歴がありません</p>
       </div>
     <?php else: ?>
       <table class="payments-table">
         <thead>
           <tr>
             <th>注文番号</th>
             <th>イベント名</th>
             <th>金額</th>
             <th>ステータス</th>
           </tr>
         </thead>
         <tbody>
           <?php foreach ($payments as $payment): ?>
             <tr>
               <td><?= $payment['order_id'] ?></td>
               <td><?= htmlspecialchars($payment['event_name']) ?></td>
               <td>¥<?= number_format($payment['amount']) ?></td>
               <td>
                 <?php
                 // ステータスに応じて色分け
                 $class = match($payment['status']) {
                   'completed' => 'status-success',
                   'pending' => 'status-warning',
                   'cancelled' => 'status-error',
                   default => ''
                 };
                 ?>
                 <span class="<?= $class ?>">
                   <?= $payment['status_label'] ?>
                 </span>
               </td>
             </tr>
           <?php endforeach; ?>
         </tbody>
       </table>
     <?php endif; ?>
   </div>

3. CSS追加:
   .status-success { color: green; }
   .status-warning { color: orange; }
   .status-error { color: red; }

4. デプロイ → 完成！
```

---

### **例4: 複雑な機能追加**

#### **あなたの指示**
```
「イベント作成ページを追加してください。
画像アップロード、日時選択、チケット価格設定ができるようにしてください」
```

#### **私がやること**
```
1. 段階的に実装:
   
   Step 1: 基本フォーム作成
   ├ イベント名入力
   ├ 説明文入力
   └ 送信ボタン
   
   Step 2: 日時選択機能追加
   ├ 開始日時カレンダー
   └ 終了日時カレンダー
   
   Step 3: 画像アップロード追加
   ├ ファイル選択
   ├ プレビュー表示
   └ R2/ImgBBへアップロード
   
   Step 4: チケット価格設定
   ├ 複数チケット種類追加
   └ 価格入力

2. 各Stepごとにコミット＆デプロイ
   → あなたが確認 → OK なら次のStep

3. 全Step完了 → 機能追加完了！
```

---

## 🔄 **開発サイクル**

```
あなたの指示
  ↓
私が実装（30分〜2時間）
  ↓
git push（自動デプロイ）
  ↓
あなたが確認（5-10分）
  ↓
OK → 次の機能へ
NG → 修正（10-30分）→ 再デプロイ
```

**1機能あたり: 1-3時間で完成**

---

## 📋 **Phase 2 実装予定リスト**

### **優先度：高（必須機能）**
- [ ] ダッシュボード PHP化
- [ ] ログインページ PHP化
- [ ] チケット管理ページ
- [ ] 決済履歴ページ
- [ ] プロフィール編集ページ

### **優先度：中（重要機能）**
- [ ] イベント一覧ページ
- [ ] イベント詳細ページ
- [ ] 主催者ダッシュボード
- [ ] イベント作成・編集

### **優先度：低（追加機能）**
- [ ] お気に入り機能
- [ ] 通知機能
- [ ] レビュー機能
- [ ] クーポン機能

---

## 🎯 **あなたがやること（超シンプル）**

### **Phase 1: Xserver移行**
```
1. Xserver契約情報を教える
   「サーバーID: sv12345」
   「パスワード: ************」

2. 設定を私が説明する通りにクリック
   「SSH設定 → ON にする」
   「MySQL設定 → データベース作成」

3. ダウンロードした鍵ファイルを共有
   （GitHub Secretsに登録するため）

これだけ！（1-2時間）
```

### **Phase 2: 機能追加**
```
普通に日本語で指示するだけ：

「チケット管理ページを追加して」
「決済履歴を表形式で表示して」
「イベント作成ページを作って」
「ここの色を変えて」

→ 私が実装 → 自動デプロイ → 確認

これだけ！
```

---

## 💡 **具体的な指示の例**

### **❌ こんな詳細な指示は不要:**
```
「PHPで pages/tickets.php を作成し、
セッションから user_id を取得して、
バックエンドAPIの /api/orders に GET リクエストを送り、
レスポンスをJSONパースして、
foreach でループして表示してください」
```

### **✅ これで十分:**
```
「チケット管理ページを追加して。
空の場合は『チケットがありません』と表示して」
```

→ 私が↑の詳細実装を全部やります！

---

## 📊 **Phase 2 タイムライン**

```
Day 3:
├ ダッシュボード PHP化（2時間）
├ ログインページ PHP化（2時間）
└ チケット管理ページ（2時間）

Day 4:
├ 決済履歴ページ（2時間）
├ プロフィール編集ページ（2時間）
└ イベント一覧ページ（2時間）

Day 5:
├ イベント詳細ページ（2時間）
├ 主催者ダッシュボード（3時間）
└ 最終テスト（1時間）

Day 6:
├ バグ修正（2時間）
├ 最適化（2時間）
└ ✅ 完成！
```

---

## 🎉 **最終的な状態**

```
✅ Phase 1 + Phase 2 完了後:

├ Xserverで安定稼働
├ PHPで多ページ化完了
├ セッション管理実装
├ エラー隔離（ページごと）
├ 自動デプロイ設定済み
├ 全機能が動作
├ 白画面問題完全解決
├ 新機能追加も簡単
└ 月額¥1,000で運用

あとは普通に機能追加するだけ！
```

---

## 🚀 **次のステップ**

### **今すぐ始める場合:**
1. Xserver契約情報を教えてください
2. Phase 1（移行）を開始します
3. 1-2日でXserverに移行完了
4. Phase 2（LAMP化）は移行後に指示してください

### **もう少し検討する場合:**
- 質問があれば何でも聞いてください
- サンプルコードをもっと見たい
- コスト詳細を確認したい

---

**作成日**: 2026-02-15  
**Phase 1 期間**: 1-2日  
**Phase 2 期間**: 3-4日  
**合計期間**: 4-6日で完成
