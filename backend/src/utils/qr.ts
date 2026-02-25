/**
 * QRコード用 HMAC ユーティリティ
 * Web Crypto API を使用（Cloudflare Workers Edge Runtime 対応）
 */

/**
 * HMAC-SHA256 署名を生成する
 * @param orderId 注文ID
 * @param timestamp タイムスタンプ（ms文字列）
 * @param secret JWT_SECRET
 * @returns hex文字列の署名
 */
export async function signQRHmac(
  orderId: string,
  timestamp: string,
  secret: string
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const payload = `${orderId}:${timestamp}`;
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  // ArrayBuffer → hex
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * HMAC-SHA256 署名を検証する
 */
export async function verifyQRHmac(
  orderId: string,
  timestamp: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const expected = await signQRHmac(orderId, timestamp, secret);
    // 定数時間比較（タイミング攻撃対策）
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

/**
 * QRコードデータ文字列を生成する
 * フォーマット: LINKUP:{orderId}:{timestamp}:{hmac}
 */
export async function buildQRData(orderId: string, secret: string): Promise<string> {
  const timestamp = Date.now().toString();
  const sig = await signQRHmac(orderId, timestamp, secret);
  return `LINKUP:${orderId}:${timestamp}:${sig}`;
}
