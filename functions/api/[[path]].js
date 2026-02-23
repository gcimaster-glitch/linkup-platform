/**
 * Cloudflare Pages Function
 * /api/* → https://linkup-backend.gcimaster.workers.dev/api/:splat
 *
 * これにより：
 * - ブラウザはクロスオリジンリクエストを出さない（同一ドメイン）
 * - CORSエラー・Failed to fetch が完全に解消される
 */

const WORKER_BASE = 'https://linkup-backend.gcimaster.workers.dev';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // /api/... のパスをWorkerに転送
  const targetURL = WORKER_BASE + url.pathname + url.search;

  // リクエストを転送（メソッド・ヘッダー・ボディをそのまま）
  const workerRequest = new Request(targetURL, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    redirect: 'follow',
  });

  try {
    const response = await fetch(workerRequest);

    // レスポンスをそのまま返す（CORSヘッダーは不要）
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Gateway Error', message: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
