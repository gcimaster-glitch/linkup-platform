/**
 * Cloudflare Pages Function
 * /api/* → https://linkup-backend.gcimaster.workers.dev/api/:splat
 *
 * - redirect: 'manual' でWorkerからの302リダイレクト（OAuth）をそのままブラウザに返す
 * - CORSエラー・Failed to fetch が完全に解消される
 */

const WORKER_BASE = 'https://linkup-backend.gcimaster.workers.dev';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // /api/... のパスをWorkerに転送
  const targetURL = WORKER_BASE + url.pathname + url.search;

  // redirect: 'manual' でOAuthの302リダイレクトをそのままブラウザに返す
  const workerRequest = new Request(targetURL, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    redirect: 'manual',
  });

  try {
    const response = await fetch(workerRequest);

    // 3xxリダイレクトの場合はLocationヘッダーをそのまま返す（OAuth用）
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        return new Response(null, {
          status: response.status,
          headers: {
            'Location': location,
            'Cache-Control': 'no-store',
          },
        });
      }
    }

    // 通常レスポンスはそのまま返す
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
