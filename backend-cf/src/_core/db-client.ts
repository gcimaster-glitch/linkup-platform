import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import * as schema from "../schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _lastUrl = "";

export function getDb(databaseUrl: string) {
  if (!_db || _lastUrl !== databaseUrl) {
    const client = connect({ url: databaseUrl });
    _db = drizzle(client, { schema });
    _lastUrl = databaseUrl;
  }
  return _db;
}
