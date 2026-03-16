// Cloudflare Workers用 LLMスタブ
// TODO: OpenAI / Cloudflare AI Workers AIに接続

export async function invokeLLM(_prompt: string): Promise<string> {
  console.log("[LLM] invokeLLM called");
  return "";
}
