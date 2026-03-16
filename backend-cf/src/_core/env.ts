// Cloudflare Workers環境変数（Honoのcontextから注入）
export type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  LINE_CHANNEL_ID: string;
  LINE_CHANNEL_SECRET: string;
  RESEND_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  ENVIRONMENT?: string;
  APP_NAME?: string;
  APP_TAGLINE?: string;
};

// グローバルENVオブジェクト（リクエストごとにinitEnv()で初期化）
export const ENV = {
  cookieSecret: "",
  databaseUrl: "",
  googleClientId: "",
  googleClientSecret: "",
  lineClientId: "",
  lineClientSecret: "",
  resendApiKey: "",
  stripeSecretKey: "",
  isProduction: true,
  frontendUrl: "https://link-up.live",
};

export function initEnv(env: Env) {
  ENV.cookieSecret = env.JWT_SECRET ?? "";
  ENV.databaseUrl = env.DATABASE_URL ?? "";
  ENV.googleClientId = env.GOOGLE_CLIENT_ID ?? "";
  ENV.googleClientSecret = env.GOOGLE_CLIENT_SECRET ?? "";
  ENV.lineClientId = env.LINE_CHANNEL_ID ?? "";
  ENV.lineClientSecret = env.LINE_CHANNEL_SECRET ?? "";
  ENV.resendApiKey = env.RESEND_API_KEY ?? "";
  ENV.stripeSecretKey = env.STRIPE_SECRET_KEY ?? "";
  ENV.isProduction = (env.ENVIRONMENT ?? "production") === "production";
  ENV.frontendUrl = env.FRONTEND_URL ?? "https://link-up.live";
}
