# 🔧 R2 代替ソリューション - 開発環境用

## 🎯 概要

Cloudflare R2の本番セットアップが完了するまで、代替の画像ホスティングソリューションを使用します。

---

## 💡 代替方法1: Cloudinary（推奨）

### 特徴
- ✅ 無料枠: 25GB ストレージ、25GB 帯域
- ✅ 自動画像最適化
- ✅ CDN配信
- ✅ APIが簡単

### セットアップ

1. **アカウント作成**
   - URL: https://cloudinary.com/
   - 無料プランで登録

2. **認証情報取得**
   - Cloud Name
   - API Key
   - API Secret

3. **Upload Preset作成**
   - Settings → Upload
   - 「Add upload preset」
   - Signing Mode: Unsigned
   - Folder: events

4. **コード変更**

```typescript
// backend/src/routes/upload.ts

uploadRoutes.post('/image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Cloudinaryへアップロード
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', 'YOUR_UPLOAD_PRESET');
    cloudinaryFormData.append('folder', 'events');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
      {
        method: 'POST',
        body: cloudinaryFormData
      }
    );

    const data = await response.json();

    return c.json({
      success: true,
      url: data.secure_url,
      fileName: data.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});
```

---

## 💡 代替方法2: imgbb（最も簡単）

### 特徴
- ✅ 完全無料
- ✅ APIキーのみで使用可能
- ✅ セットアップ不要

### セットアップ

1. **APIキー取得**
   - URL: https://api.imgbb.com/
   - 無料で即座に取得

2. **コード変更**

```typescript
// backend/src/routes/upload.ts

uploadRoutes.post('/image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Base64エンコード
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    // imgbbへアップロード
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', base64);

    const response = await fetch(
      'https://api.imgbb.com/1/upload?key=YOUR_API_KEY',
      {
        method: 'POST',
        body: imgbbFormData
      }
    );

    const data = await response.json();

    return c.json({
      success: true,
      url: data.data.url,
      fileName: data.data.id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});
```

---

## 💡 代替方法3: GitHub Issues（ハック）

### 特徴
- ✅ 完全無料
- ✅ 無制限ストレージ
- ✅ CDN配信
- ⚠️ 非公式な方法

### セットアップ

1. **GitHub Personal Access Token作成**
   - Settings → Developer settings → Personal access tokens
   - Scope: `public_repo`

2. **コード変更**

```typescript
// backend/src/routes/upload.ts

uploadRoutes.post('/image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Base64エンコード
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    // GitHub APIへアップロード
    const response = await fetch(
      'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/issues/1/comments',
      {
        method: 'POST',
        headers: {
          'Authorization': 'token YOUR_GITHUB_TOKEN',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: `![image](data:image/png;base64,${base64})`
        })
      }
    );

    const data = await response.json();
    
    // 画像URLを抽出
    const imageUrl = data.body.match(/!\[image\]\((.*?)\)/)?.[1];

    return c.json({
      success: true,
      url: imageUrl,
      fileName: data.id.toString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});
```

---

## 💡 代替方法4: Supabase Storage

### 特徴
- ✅ 無料枠: 1GB ストレージ
- ✅ 高速CDN
- ✅ Postgresと統合可能

### セットアップ

1. **Supabaseプロジェクト作成**
   - URL: https://supabase.com/
   - 無料プランで登録

2. **Storage Bucket作成**
   - Storage → New Bucket
   - Name: linkup-images
   - Public: Yes

3. **API認証情報取得**
   - Settings → API
   - Project URL
   - anon/public key

4. **コード変更**

```typescript
// backend/src/routes/upload.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

uploadRoutes.post('/image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileName = `events/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('linkup-images')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600'
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('linkup-images')
      .getPublicUrl(fileName);

    return c.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});
```

---

## 📊 比較表

| サービス | 無料枠 | セットアップ難易度 | 速度 | CDN | 推奨度 |
|---------|--------|------------------|------|-----|--------|
| Cloudflare R2 | 10GB | ⭐⭐⭐ | ⚡⚡⚡ | ✅ | ⭐⭐⭐⭐⭐ |
| Cloudinary | 25GB | ⭐⭐ | ⚡⚡⚡ | ✅ | ⭐⭐⭐⭐ |
| imgbb | 無制限 | ⭐ | ⚡⚡ | ✅ | ⭐⭐⭐ |
| GitHub | 無制限 | ⭐⭐ | ⚡⚡⚡ | ✅ | ⭐⭐ |
| Supabase | 1GB | ⭐⭐ | ⚡⚡⚡ | ✅ | ⭐⭐⭐⭐ |

---

## 🎯 推奨アプローチ

### 開発環境（現在）
**imgbb を使用** - 最も簡単で即座に使える

### ステージング環境
**Cloudinary を使用** - 本番に近い環境でテスト

### 本番環境（最終）
**Cloudflare R2 を使用** - コスト効率が最高

---

## 🚀 即座に実装: imgbb統合

以下のコマンドで即座にimgbbを統合できます：

```bash
# 1. imgbb APIキーを取得（1分）
# https://api.imgbb.com/

# 2. バックエンドの環境変数を設定
cd /home/user/webapp/backend
echo 'IMGBB_API_KEY="YOUR_API_KEY"' >> .dev.vars

# 3. upload.tsを更新（後述のコードを使用）

# 4. デプロイ
npm run deploy
```

---

## 次のステップ

1. **即座に**: imgbb APIキーを取得 → 統合
2. **今週**: R2セットアップガイドに従ってR2を設定
3. **来週**: R2に移行してimgbbを削除

---

**作成日**: 2026-02-12  
**最終更新**: 2026-02-12
