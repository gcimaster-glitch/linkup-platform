import { Hono } from 'hono';
import type { Bindings } from '../index';

const uploadRoutes = new Hono<{ Bindings: Bindings }>();

// 画像アップロード API (POST /api/upload と POST /api/upload/image の両方に対応)
const handleUpload = async (c: any) => {
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

    // ファイルサイズチェック (32MB - imgbb limit)
    if (file.size > 32 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 32MB' }, 400);
    }

    // 優先順位: imgbb → R2 → エラー
    // imgbbが設定されている場合は優先的に使用
    if (c.env.IMGBB_API_KEY) {
      console.log('Using imgbb for image upload');
      
      try {
        // Base64エンコード
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        // imgbb APIへアップロード
        const imgbbFormData = new FormData();
        imgbbFormData.append('image', base64);
        imgbbFormData.append('name', file.name.replace(/\.[^/.]+$/, '')); // 拡張子を除去

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${c.env.IMGBB_API_KEY}`,
          {
            method: 'POST',
            body: imgbbFormData
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('imgbb upload failed:', errorText);
          throw new Error('imgbb upload failed');
        }

        const data = await response.json();

        if (!data.success) {
          console.error('imgbb API error:', data);
          throw new Error(data.error?.message || 'imgbb API error');
        }

        return c.json({
          success: true,
          url: data.data.url,
          fileName: data.data.title,
          storage: 'imgbb',
          message: 'Image uploaded successfully to imgbb'
        });
      } catch (imgbbError) {
        console.error('imgbb upload error:', imgbbError);
        // imgbb失敗時はR2にフォールバック
        if (c.env.R2) {
          console.log('Falling back to R2 storage');
        } else {
          throw imgbbError; // R2も無い場合はエラーを投げる
        }
      }
    }

    // R2へのアップロード
    if (c.env.R2) {
      console.log('Using R2 for image upload');
      
      const fileName = `events/${Date.now()}-${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      
      await c.env.R2.put(fileName, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });

      // R2の公開URLを返す
      const r2Domain = c.env.R2_PUBLIC_DOMAIN || 'linkup-storage.r2.cloudflarestorage.com';
      const publicUrl = `https://${r2Domain}/${fileName}`;
      
      return c.json({
        success: true,
        url: publicUrl,
        fileName: fileName,
        storage: 'r2',
        message: 'Image uploaded successfully to R2'
      });
    }

    // どちらも利用できない場合はエラー
    return c.json({ 
      error: 'No storage configured',
      message: 'Please configure either IMGBB_API_KEY or R2 bucket'
    }, 503);

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ 
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

// POST /api/upload (メインエンドポイント)
uploadRoutes.post('/', handleUpload);

// POST /api/upload/image (互換性のため)
uploadRoutes.post('/image', handleUpload);

// ドキュメントアップロード API (POST /api/upload/document)
uploadRoutes.post('/document', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // 許可されたファイルタイプ
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'File type not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT' }, 400);
    }

    // ファイルサイズチェック (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 50MB' }, 400);
    }

    // R2へのアップロード
    if (c.env.R2) {
      console.log('Uploading document to R2:', file.name);
      
      const fileName = `documents/${Date.now()}-${file.name}`;
      const arrayBuffer = await file.arrayBuffer();
      
      await c.env.R2.put(fileName, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
          contentDisposition: `attachment; filename="${file.name}"`,
        },
      });

      // R2の公開URLを返す
      const r2Domain = c.env.R2_PUBLIC_DOMAIN || 'linkup-storage.r2.cloudflarestorage.com';
      const publicUrl = `https://${r2Domain}/${fileName}`;
      
      return c.json({
        success: true,
        url: publicUrl,
        fileName: file.name,
        storage: 'r2',
        message: 'Document uploaded successfully'
      });
    }

    // R2が利用できない場合はエラー
    return c.json({ 
      error: 'No storage configured',
      message: 'Please configure R2 bucket for document storage'
    }, 503);

  } catch (error) {
    console.error('Document upload error:', error);
    return c.json({ 
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { uploadRoutes };
