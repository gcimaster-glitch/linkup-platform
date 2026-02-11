import { Hono } from 'hono';
import type { Bindings } from '../index';

const uploadRoutes = new Hono<{ Bindings: Bindings }>();

// 画像アップロード API
uploadRoutes.post('/image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }

    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 5MB' }, 400);
    }

    // R2へのアップロード
    if (c.env.R2) {
      const fileName = `events/${Date.now()}-${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      
      await c.env.R2.put(fileName, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });

      // R2の公開URLを返す
      // R2_PUBLIC_DOMAINが設定されている場合はそれを使用、なければデフォルト
      const r2Domain = c.env.R2_PUBLIC_DOMAIN || 'linkup-storage.r2.cloudflarestorage.com';
      const publicUrl = `https://${r2Domain}/${fileName}`;
      
      return c.json({
        success: true,
        url: publicUrl,
        fileName: fileName,
        message: 'Image uploaded successfully'
      });
    } else {
      // R2が利用できない場合はエラー
      return c.json({ 
        error: 'R2 storage not configured',
        message: 'Please configure R2 bucket in wrangler.toml'
      }, 503);
    }

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ 
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { uploadRoutes };
