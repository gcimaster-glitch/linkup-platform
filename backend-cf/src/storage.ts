// Cloudflare Workers用 ストレージスタブ
// TODO: Cloudflare R2またはS3に接続

export async function storagePut(_key: string, _data: unknown): Promise<string> {
  console.log("[Storage] storagePut called");
  return "";
}

export async function storageGet(_key: string): Promise<unknown> {
  console.log("[Storage] storageGet called");
  return null;
}

export async function storageDelete(_key: string): Promise<void> {
  console.log("[Storage] storageDelete called");
}

export async function generatePresignedUrl(_key: string): Promise<string> {
  console.log("[Storage] generatePresignedUrl called");
  return "";
}

export async function uploadFile(_file: unknown, _key: string): Promise<string> {
  console.log("[Storage] uploadFile called");
  return "";
}
