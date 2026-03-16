// Cloudflare Workers用 座席分析スタブ
// TODO: Cloudflare AI WorkersのVision APIに接続

export interface AnalyzedSection {
  id: string;
  name: string;
  seats: Array<{ row: string; col: number; x: number; y: number }>;
}

export interface SeatMapAnalysisResult {
  sections: AnalyzedSection[];
  imageUrl: string;
}

export async function analyzeSeatImageWithLLM(_input: unknown): Promise<SeatMapAnalysisResult> {
  console.log("[SeatAnalysis] analyzeSeatImageWithLLM called");
  return { sections: [], imageUrl: "" };
}

export async function analyzeSeatMap(_input: unknown): Promise<SeatMapAnalysisResult> {
  console.log("[SeatAnalysis] analyzeSeatMap called");
  return { sections: [], imageUrl: "" };
}
