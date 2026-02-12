# 🤖 AI生成機能 - テストガイド

## 📋 修正内容

| 問題 | 修正 | 確認方法 |
|------|------|---------|
| AI生成完了後、テキストが更新されない | ✅ WYSIWYGタブに自動切り替え<br>✅ AIエディタにも更新内容を反映<br>✅ デバッグログ追加 | コンソールログとWYSIWYGタブの内容を確認 |

---

## 🧪 テスト手順（5分）

### 1. デプロイ確認

まず、Cloudflare Pagesにデプロイしてください：

**オプション1: Cloudflare Dashboard（推奨・最速）**
1. https://dash.cloudflare.com/pages にアクセス
2. プロジェクト「linkup」を選択
3. 「Create deployment」→ Branch: `main` → 「Save and Deploy」
4. 2-3分待つ

**オプション2: 手動確認（デプロイ済みの場合）**
- https://link-up.live/ にアクセス
- ブラウザのキャッシュをクリア（Ctrl+Shift+R または Cmd+Shift+R）

---

### 2. AI生成機能のテスト

#### ステップ1: イベント作成画面を開く

```
1. https://link-up.live/ にアクセス
2. ログイン（organizer@demo.com / demo）
3. 「イベント作成」をクリック
```

#### ステップ2: AIタブで説明文を入力

```
4. 「AIで作成」タブをクリック
5. テキストエリアに以下のような内容を入力:

最新のAI技術を学べるイベントです
機械学習の基礎から応用まで
実践的なワークショップあり
初心者歓迎
```

#### ステップ3: AI生成を実行

```
6. F12キーでブラウザのコンソールを開く
7. 「AIで説明文を生成」ボタンをクリック
8. 1.5秒後に生成完了
```

#### ステップ4: 結果を確認

**✅ 期待される動作:**

1. **トースト通知**
   - 「AI生成中...お待ちください」（青色）
   - 1.5秒後に「✨ AI生成完了！整形された説明文をご確認ください」（緑色、4秒間表示）

2. **コンソールログ**（F12で確認）
   ```
   🤖 AI生成処理開始
   ✅ WYSIWYGエディタに反映完了
   ✅ AIエディタに反映完了: 最新のAI技術を学べるイベントです...
   ✅ WYSIWYGタブに切り替え完了
   ```

3. **画面の変化**
   - 自動的に「WYSIWYGで作成」タブに切り替わる
   - 整形された説明文が表示される（見出し、箇条書き、セクション分けあり）

4. **AIタブに戻る**
   - 「AIで作成」タブをクリック
   - テキストエリアに更新されたプレーンテキストが表示される

---

### 3. 保存機能のテスト

```
1. イベント情報を入力（タイトル、日時など）
2. チケット情報が自動追加されていることを確認
3. 「保存」ボタンをクリック
4. 「イベントを保存しました」のトースト表示
5. オーガナイザーダッシュボードに遷移
```

---

## 🐛 トラブルシューティング

### 問題1: AIタブのテキストが変わらない

**原因**: ブラウザキャッシュ

**解決策**:
```bash
# キャッシュクリア
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

---

### 問題2: WYSIWYGタブに切り替わらない

**確認ポイント**:
1. F12でコンソールを開く
2. エラーログがないか確認
3. `✅ WYSIWYGタブに切り替え完了` のログが出ているか確認

**考えられる原因**:
- `switchEditorMode`関数が定義されていない
- DOM要素が見つからない

**解決策**:
- ページをリロード
- コンソールで `typeof switchEditorMode` を実行して `"function"` が返ることを確認

---

### 問題3: コンソールにエラーが表示される

**よくあるエラー**:

```javascript
// エラー1: Cannot read property 'value' of null
原因: DOM要素が見つからない
解決: ページをリロード、または要素IDを確認

// エラー2: switchEditorMode is not defined
原因: 関数がロードされていない
解決: キャッシュクリア後、ページをリロード
```

---

## 📊 テスト結果の報告

テスト後、以下を報告してください：

### ✅ 成功した場合

```
- AI生成ボタンをクリック
- WYSIWYGタブに自動切り替え
- 整形された説明文が表示された
- AIタブに戻ると、テキストエリアも更新されていた
```

### ❌ 失敗した場合

```
- どのステップで失敗したか
- コンソールログのスクリーンショット
- エラーメッセージの内容
```

---

## 🔍 技術詳細

### 修正箇所

**ファイル**: `index.html`

**関数**: `generateDescriptionWithAI()` (15460行目)

**変更内容**:

1. **WYSIWYGエディタに反映**
   ```javascript
   const wysiwygEditor = document.getElementById('event-description-wysiwyg');
   if (wysiwygEditor) {
       wysiwygEditor.innerHTML = formatted;
       console.log('✅ WYSIWYGエディタに反映完了');
   }
   ```

2. **AIエディタにも反映**
   ```javascript
   const aiEditor = document.getElementById('event-description-ai');
   if (aiEditor) {
       const tempDiv = document.createElement('div');
       tempDiv.innerHTML = formatted;
       const plainText = tempDiv.textContent || tempDiv.innerText || '';
       aiEditor.value = plainText;
       console.log('✅ AIエディタに反映完了:', plainText.substring(0, 100) + '...');
   }
   ```

3. **自動タブ切り替え**
   ```javascript
   if (typeof switchEditorMode === 'function') {
       setTimeout(() => {
           switchEditorMode('wysiwyg');
           console.log('✅ WYSIWYGタブに切り替え完了');
       }, 100);
   }
   ```

---

## 📝 まとめ

- **修正完了**: ✅
- **GitHubプッシュ**: ✅ (commit: 0b78e1a)
- **Cloudflareデプロイ**: ⏳ 待機中
- **テスト時間**: 約5分

デプロイ後、上記のテスト手順に従って動作確認してください。
