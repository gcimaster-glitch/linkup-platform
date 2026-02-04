import { Hono } from 'hono';
import { Bindings } from '../index';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/sitemap.xml', async (c) => {
  // フロントエンドのURLベース (環境変数がない場合はデフォルト)
  const baseUrl = c.env.FRONTEND_URL || 'https://link-up.live';
  
  // 静的ページのリスト
  const staticPages = [
    '',
    '?page=static&id=about',
    '?page=static&id=contact',
    '?page=static&id=terms',
    '?page=static&id=privacy',
    '?page=static&id=tokusho',
    '?page=static&id=guide',
    '?page=static&id=success_stories'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 静的ページを追加
  staticPages.forEach(page => {
    // URLエンコードが必要な場合は適宜処理（ここでは簡易実装）
    const loc = page ? `${baseUrl}/${page.replace(/&/g, '&amp;')}` : `${baseUrl}/`;
    xml += `
  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // DBから公開イベントを取得して追加
  try {
    if (c.env.DB) {
      const { results } = await c.env.DB.prepare(
        "SELECT event_id, updated_at FROM events WHERE status = 'published' ORDER BY created_at DESC LIMIT 1000"
      ).all();

      if (results && results.length > 0) {
        results.forEach((event: any) => {
          xml += `
  <url>
    <loc>${baseUrl}/?page=detail&amp;id=${event.event_id}</loc>
    <lastmod>${new Date(event.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
      }
    }
  } catch (e) {
    console.error('Sitemap generation error:', e);
    // エラー時は静的ページのみで続行
  }

  xml += `
</urlset>`;

  return c.body(xml, 200, {
    'Content-Type': 'application/xml'
  });
});

// OGP画像の動的生成 (簡易実装)
app.get('/og/:eventId', async (c) => {
    // 将来的に canvas や @vercel/og 等で動的画像を生成するエンドポイント
    // 現時点では静的画像をリダイレクト、またはプレースホルダー
    return c.redirect('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200');
});

export const seoRoutes = app;
