import { Hono } from "hono";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { SignJWT } from "jose";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { initEnv, ENV, type Env } from "./_core/env";
import * as db from "./db";
import {
  createSessionToken,
  buildSessionCookie,
  clearSessionCookie,
} from "./_core/auth";

const COOKIE_NAME = "app_session_id";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

const app = new Hono<{ Bindings: Env }>();

// ─── ミドルウェア ──────────────────────────────────────────────────────────────
app.use("*", async (c, next) => {
  // リクエストごとにENVを初期化
  initEnv(c.env);

  const origin = c.req.header("origin") || ENV.frontendUrl;
  const allowedOrigins = [
    "https://link-up.live",
    "https://www.link-up.live",
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  if (allowedOrigins.includes(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
  }
  c.header("Access-Control-Allow-Credentials", "true");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (c.req.method === "OPTIONS") {
    return c.text("", 204);
  }

  await next();
});

// ─── Google OAuth ──────────────────────────────────────────────────────────────
app.get("/api/auth/google", (c) => {
  if (!ENV.googleClientId) {
    return c.json({ error: "Google OAuth not configured" }, 503);
  }
  const returnPath = c.req.query("returnPath") ?? "/";
  const state = btoa(JSON.stringify({ returnPath }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const params = new URLSearchParams({
    client_id: ENV.googleClientId,
    redirect_uri: `${ENV.frontendUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });
  return c.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302
  );
});

app.get("/api/auth/google/callback", async (c) => {
  const code = c.req.query("code");
  const stateRaw = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    return c.redirect("/?error=google_auth_failed", 302);
  }
  if (!code) {
    return c.redirect("/?error=google_auth_failed", 302);
  }

  let returnPath = "/";
  try {
    if (stateRaw) {
      const padded =
        stateRaw.replace(/-/g, "+").replace(/_/g, "/") +
        "=".repeat((4 - (stateRaw.length % 4)) % 4);
      const parsed = JSON.parse(atob(padded));
      returnPath = parsed.returnPath ?? "/";
    }
  } catch {
    // ignore
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: ENV.googleClientId,
        client_secret: ENV.googleClientSecret,
        redirect_uri: `${ENV.frontendUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      console.error("[Google OAuth] Token exchange failed:", await tokenRes.text());
      return c.redirect("/?error=google_token_failed", 302);
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      id_token?: string;
    };

    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    if (!userInfoRes.ok) {
      return c.redirect("/?error=google_profile_failed", 302);
    }

    const profile = (await userInfoRes.json()) as {
      sub: string;
      name?: string;
      email?: string;
      picture?: string;
    };

    const openId = `google:${profile.sub}`;
    const name = profile.name ?? null;
    const email = profile.email ?? null;

    await db.upsertUser({
      openId,
      name,
      email,
      loginMethod: "google",
      lastSignedIn: new Date(),
    });

    const existingUser = await db.getUserByOpenId(openId);
    if (existingUser) {
      await db.upsertSocialAccount({
        userId: existingUser.id,
        provider: "google",
        providerAccountId: profile.sub,
        email,
        name,
        avatarUrl: profile.picture ?? null,
        accessToken: tokenData.access_token,
        refreshToken: null,
        expiresAt: null,
      });
    }

    const sessionToken = await createSessionToken(openId, name ?? "");
    const cookie = buildSessionCookie(sessionToken);

    return new Response(null, {
      status: 302,
      headers: {
        Location: returnPath,
        "Set-Cookie": cookie,
      },
    });
  } catch (err) {
    console.error("[Google OAuth] Callback error:", err);
    return c.redirect("/?error=google_auth_error", 302);
  }
});

// ─── LINE OAuth ────────────────────────────────────────────────────────────────
app.get("/api/auth/line", (c) => {
  if (!ENV.lineClientId) {
    return c.json({ error: "LINE OAuth not configured" }, 503);
  }
  const returnPath = c.req.query("returnPath") ?? "/";
  const state = btoa(JSON.stringify({ returnPath }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: ENV.lineClientId,
    redirect_uri: `${ENV.frontendUrl}/api/auth/line/callback`,
    state,
    scope: "profile openid email",
  });
  return c.redirect(
    `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`,
    302
  );
});

app.get("/api/auth/line/callback", async (c) => {
  const code = c.req.query("code");
  const stateRaw = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    return c.redirect("/?error=line_auth_failed", 302);
  }
  if (!code) {
    return c.redirect("/?error=line_auth_failed", 302);
  }

  let returnPath = "/";
  try {
    if (stateRaw) {
      const padded =
        stateRaw.replace(/-/g, "+").replace(/_/g, "/") +
        "=".repeat((4 - (stateRaw.length % 4)) % 4);
      const parsed = JSON.parse(atob(padded));
      returnPath = parsed.returnPath ?? "/";
    }
  } catch {
    // ignore
  }

  try {
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${ENV.frontendUrl}/api/auth/line/callback`,
        client_id: ENV.lineClientId,
        client_secret: ENV.lineClientSecret,
      }).toString(),
    });

    if (!tokenRes.ok) {
      console.error("[LINE OAuth] Token exchange failed:", await tokenRes.text());
      return c.redirect("/?error=line_token_failed", 302);
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      id_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileRes.ok) {
      return c.redirect("/?error=line_profile_failed", 302);
    }

    const profile = (await profileRes.json()) as {
      userId: string;
      displayName: string;
      pictureUrl?: string;
    };

    let email: string | null = null;
    if (tokenData.id_token) {
      try {
        const parts = tokenData.id_token.split(".");
        const padded =
          parts[1].replace(/-/g, "+").replace(/_/g, "/") +
          "=".repeat((4 - (parts[1].length % 4)) % 4);
        const payload = JSON.parse(atob(padded));
        email = payload.email ?? null;
      } catch {
        // ignore
      }
    }

    const openId = `line:${profile.userId}`;
    const name = profile.displayName ?? null;

    await db.upsertUser({
      openId,
      name,
      email,
      loginMethod: "line",
      lastSignedIn: new Date(),
    });

    const existingUser = await db.getUserByOpenId(openId);
    if (existingUser) {
      await db.upsertSocialAccount({
        userId: existingUser.id,
        provider: "line",
        providerAccountId: profile.userId,
        email,
        name,
        avatarUrl: profile.pictureUrl ?? null,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? null,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
      });
    }

    const sessionToken = await createSessionToken(openId, name ?? "");
    const cookie = buildSessionCookie(sessionToken);

    return new Response(null, {
      status: 302,
      headers: {
        Location: returnPath,
        "Set-Cookie": cookie,
      },
    });
  } catch (err) {
    console.error("[LINE OAuth] Callback error:", err);
    return c.redirect("/?error=line_auth_error", 302);
  }
});

// ─── ログアウト ────────────────────────────────────────────────────────────────
app.post("/api/auth/logout", (c) => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookie(),
    },
  });
});

// ─── tRPC ──────────────────────────────────────────────────────────────────────
app.all("/api/trpc/*", async (c) => {
  const resHeaders = new Headers();
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: async () => createContext(c.req.raw, resHeaders),
    onError: ({ error, path }) => {
      if (error.code !== "UNAUTHORIZED") {
        console.error(`[tRPC] Error on ${path}:`, error);
      }
    },
  });

  // resHeadersのSet-Cookieをレスポンスにマージ
  const newHeaders = new Headers(response.headers);
  const setCookie = resHeaders.get("Set-Cookie");
  if (setCookie) {
    newHeaders.set("Set-Cookie", setCookie);
  }

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
});

// ─── ヘルスチェック ────────────────────────────────────────────────────────────
app.get("/api/health", (c) => {
  return c.json({ ok: true, timestamp: Date.now() });
});

export default app;
