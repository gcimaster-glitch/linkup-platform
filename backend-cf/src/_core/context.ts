import type { User } from "../schema";
import { authenticateRequest } from "./auth";

export type TrpcContext = {
  user: User | null;
  req: Request;
  resHeaders: Headers;
};

export async function createContext(req: Request, resHeaders: Headers): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await authenticateRequest(req);
  } catch {
    user = null;
  }
  return { user, req, resHeaders };
}
