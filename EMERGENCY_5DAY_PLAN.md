# 🚨 緊急5日間実装プラン - LinkUp公開準備

**作成日**: 2026-02-15  
**公開予定**: 2026-02-20（5日後）  
**現在の状況**: 安定版（68c4737, v4.0.0-RBAC-SECURITY）にロールバック完了

---

## 📊 現状分析

### ✅ **動作している機能**
- ホームページ（イベント一覧）
- ログイン・認証システム
- イベント詳細ページ
- チケットタブ（空状態表示あり）

### ❌ **未実装・動作しない機能**
1. **決済履歴タブ** - `renderUserDashboardTab` に `payments` ケースがない
2. **プロフィール画像保存** - 原因不明（API確認必要）
3. **エラーハンドリング** - エラー時に白画面になる可能性

---

## 🎯 5日間実装スケジュール

### **Day 1（2026-02-15）: 緊急安定化** ✅
- [x] GitHubを安定版にリセット
- [x] Cloudflare Pages再デプロイ
- [x] 本番環境確認（v4.0.0-RBAC-SECURITY）
- [x] 問題点の洗い出し

**結果**: ロールバック成功、バージョン v4.0.0-RBAC-SECURITY

---

### **Day 2（2026-02-16）: 決済履歴タブ実装**

#### **必要な作業** (推定: 4-6時間)

1. **決済履歴タブ追加** (2-3時間)
   ```javascript
   // index.html の renderUserDashboardTab に追加
   case 'payments':
       return `
           ${renderPageGuide(
               '決済履歴',
               'ここではすべての決済履歴を確認できます。',
               [...]
           )}
           <div class="space-y-6">
               ${paymentHistory.length === 0 ? `
                   <div class="text-center py-12 bg-slate-50 rounded-xl">
                       <span class="material-icons-outlined text-slate-300 text-6xl mb-3">receipt_long</span>
                       <p class="text-slate-500">決済履歴がありません</p>
                   </div>
               ` : `
                   <div class="overflow-x-auto">
                       <table class="w-full text-left text-sm">
                           <!-- テーブルヘッダー -->
                           <!-- 決済履歴リスト -->
                       </table>
                   </div>
               `}
           </div>
       `;
   ```

2. **API確認** (1-2時間)
   - `API.User.getPaymentHistory()` 実装確認
   - バックエンドエンドポイント `/api/user/payment-history` 確認
   - なければ `API.User.getOrders()` でフォールバック

3. **テスト** (1時間)
   - ログイン → ダッシュボード → 決済履歴タブ
   - 空状態表示確認
   - データがある場合の表示確認

---

### **Day 3（2026-02-17）: プロフィール画像修正 + エラーハンドリング**

#### **必要な作業** (推定: 6-8時間)

1. **プロフィール画像保存問題の調査** (2-3時間)
   - `API.User.updateProfile()` の実装確認
   - バックエンド `/api/auth/profile` PUT メソッド確認
   - R2バケット（linkup-storage）へのアップロード確認
   - コンソールエラーの確認

2. **修正実装** (2-3時間)
   - API呼び出しの修正
   - エラーメッセージの改善
   - 成功時のUIフィードバック

3. **エラーハンドリング強化** (2時間)
   ```javascript
   // グローバルエラーハンドラー
   window.addEventListener('error', (e) => {
       console.error('Global error:', e.error);
       // ユーザーに分かりやすいメッセージ表示
       showToast('エラーが発生しました。ページを再読み込みしてください。', 'error');
   });

   // 非同期エラーハンドラー
   window.addEventListener('unhandledrejection', (e) => {
       console.error('Unhandled promise rejection:', e.reason);
       showToast('処理中にエラーが発生しました。', 'error');
   });
   ```

---

### **Day 4（2026-02-18）: 全機能テスト + バグ修正**

#### **テストチェックリスト** (推定: 8時間)

##### **1. 認証機能** (1時間)
- [ ] ログイン（user@demo.com / demo）
- [ ] サインアップ
- [ ] ログアウト
- [ ] セッション保持

##### **2. ダッシュボード** (2時間)
- [ ] 概要タブ（overview）
- [ ] チケットタブ（tickets）
  - [ ] 空状態表示
  - [ ] チケットリスト表示
- [ ] イベントタブ（events）
- [ ] 興味・関心タブ（interests）
- [ ] 決済履歴タブ（payments）
  - [ ] 空状態表示
  - [ ] 決済履歴リスト表示
- [ ] プロフィールタブ（profile）
  - [ ] プロフィール編集
  - [ ] アイコン画像アップロード
  - [ ] カバー画像アップロード

##### **3. イベント機能** (2時間)
- [ ] イベント一覧表示
- [ ] イベント詳細表示
- [ ] イベント検索
- [ ] カテゴリフィルター

##### **4. チケット購入フロー** (2時間)
- [ ] チケット選択
- [ ] 購入画面
- [ ] Stripe決済（テストモード）
- [ ] 購入完了後のリダイレクト

##### **5. クロスブラウザテスト** (1時間)
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

---

### **Day 5（2026-02-19）: 最終確認 + 本番デプロイ**

#### **最終確認項目** (推定: 4-6時間)

1. **パフォーマンステスト** (1時間)
   - ページロード時間（目標: 3秒以内）
   - API応答時間
   - 画像最適化

2. **セキュリティチェック** (1時間)
   - XSS対策
   - CSRF対策
   - 認証トークンの安全性

3. **最終バグ修正** (2-3時間)
   - Day 4で発見されたバグ修正
   - 最終テスト

4. **本番デプロイ** (1時間)
   ```bash
   # 1. バージョン更新
   VERSION = '1.0.0-PRODUCTION'
   BUILD_DATE = '2026-02-20T00:00:00Z'
   
   # 2. コミット
   git add .
   git commit -m "chore: 🚀 v1.0.0 本番リリース"
   
   # 3. タグ作成
   git tag -a v1.0.0 -m "Production Release v1.0.0"
   
   # 4. プッシュ
   git push origin main --tags
   
   # 5. Cloudflare Pages自動デプロイ待ち（5-10分）
   
   # 6. 本番環境確認
   # https://link-up.live/
   ```

5. **ドキュメント更新** (30分)
   - README.md
   - デプロイ手順
   - トラブルシューティング

---

## 🛡️ リスク管理

### **高リスク項目**
1. **プロフィール画像保存** - 原因不明のため、Day 3で解決できない可能性
   - **対策**: Day 3で解決できない場合、一時的に機能を無効化し、「準備中」表示

2. **クロスブラウザ互換性** - 全ブラウザでテストする時間が限られる
   - **対策**: Chrome + Safari を優先、他は軽くテスト

3. **予期しないバグ** - Day 4で新しいバグが見つかる可能性
   - **対策**: Day 5を予備日として確保

### **中リスク項目**
1. **Cloudflare Pagesデプロイ遅延** - 自動デプロイが遅れる可能性
   - **対策**: 手動デプロイ用のスクリプト準備

2. **API応答遅延** - バックエンドが遅い可能性
   - **対策**: ローディングスピナー、タイムアウト処理

---

## 📝 実装詳細

### **決済履歴タブ実装例**

```javascript
case 'payments':
    const payments = store.paymentHistory.filter(p => 
        p.userId === (store.user ? store.user.email : 'demo@example.com')
    );
    
    // 統計情報
    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedCount = payments.filter(p => p.status === 'completed').length;
    
    return `
        ${renderPageGuide(
            '決済履歴',
            'ここではすべての決済履歴を確認できます。',
            [
                '決済履歴をクリックすると詳細が表示されます',
                'ステータスで決済の状態を確認できます',
                '領収書のダウンロードも可能です'
            ]
        )}
        
        <!-- 統計カード -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white rounded-xl shadow-card p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-slate-500">総決済回数</p>
                        <p class="text-2xl font-bold text-slate-800 mt-1">${payments.length}回</p>
                    </div>
                    <span class="material-icons-outlined text-blue-500 text-3xl">receipt_long</span>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-card p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-slate-500">総決済額</p>
                        <p class="text-2xl font-bold text-slate-800 mt-1">¥${totalSpent.toLocaleString()}</p>
                    </div>
                    <span class="material-icons-outlined text-green-500 text-3xl">payments</span>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-card p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-slate-500">完了済み</p>
                        <p class="text-2xl font-bold text-slate-800 mt-1">${completedCount}件</p>
                    </div>
                    <span class="material-icons-outlined text-purple-500 text-3xl">check_circle</span>
                </div>
            </div>
        </div>
        
        <!-- 決済履歴 -->
        <div class="bg-white rounded-2xl shadow-card overflow-hidden">
            <div class="p-6 border-b border-slate-100">
                <h4 class="font-bold text-slate-800">決済履歴 (${payments.length}件)</h4>
            </div>
            
            ${payments.length === 0 ? `
                <div class="text-center py-12">
                    <span class="material-icons-outlined text-slate-300 text-6xl mb-3">receipt_long</span>
                    <p class="text-slate-500">決済履歴がありません</p>
                    <button onclick="router('events')" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        イベントを探す
                    </button>
                </div>
            ` : `
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 text-slate-600 text-xs uppercase">
                            <tr>
                                <th class="p-4">決済ID</th>
                                <th class="p-4">イベント名</th>
                                <th class="p-4">決済日</th>
                                <th class="p-4">金額</th>
                                <th class="p-4">ステータス</th>
                                <th class="p-4">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.map((payment, index) => {
                                const date = new Date(payment.date);
                                const formattedDate = date.toLocaleDateString('ja-JP');
                                const statusLabel = payment.status === 'completed' ? '支払済' : 
                                                   payment.status === 'pending' ? '保留中' : 'キャンセル';
                                const statusColor = payment.status === 'completed' ? 'text-green-600 bg-green-50' :
                                                   payment.status === 'pending' ? 'text-orange-600 bg-orange-50' :
                                                   'text-red-600 bg-red-50';
                                
                                return `
                                    <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 hover:bg-blue-50">
                                        <td class="p-4 font-mono text-xs">${payment.paymentId}</td>
                                        <td class="p-4 font-bold text-slate-800">${payment.eventName}</td>
                                        <td class="p-4 text-slate-600">${formattedDate}</td>
                                        <td class="p-4 font-bold text-slate-800">¥${payment.amount.toLocaleString()}</td>
                                        <td class="p-4">
                                            <span class="px-3 py-1 rounded-full text-xs font-bold ${statusColor}">
                                                ${statusLabel}
                                            </span>
                                        </td>
                                        <td class="p-4">
                                            <button onclick="showPaymentDetail('${payment.paymentId}')" class="text-primary hover:underline text-xs font-bold">
                                                詳細
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
```

---

## 🎯 成功基準

### **必須項目（Public必須）**
- [x] ダッシュボードが表示される（白画面にならない）
- [ ] 決済履歴タブが動作する
- [ ] プロフィール画像が保存できる
- [ ] ログイン・ログアウトが正常動作
- [ ] チケット購入フローが動作

### **推奨項目（あれば良い）**
- [ ] エラーハンドリング強化
- [ ] パフォーマンス最適化
- [ ] クロスブラウザ完全対応

---

## 📞 緊急時連絡

### **深刻なバグ発見時の対応**
1. 即座にロールバック（この安定版に戻す）
2. 問題を記録
3. Day 5で修正

### **公開日延期の判断基準**
以下の場合は延期を検討：
- チケット購入フローが動作しない
- ダッシュボードが完全に壊れている
- セキュリティ上の重大な欠陥

---

## 📄 関連ドキュメント

- [ARCHITECTURE_IMPROVEMENT_PROPOSAL.md](./ARCHITECTURE_IMPROVEMENT_PROPOSAL.md)
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [QUICKSTART.md](./QUICKSTART.md)

---

**最終更新**: 2026-02-15 09:19 UTC  
**次回更新予定**: Day 2 終了時（2026-02-16）
