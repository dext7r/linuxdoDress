/**
 * JWT 工具函数
 * 用于生成和验证用户会话令牌
 */

import { create, verify } from "djwt";
import { JWT_CONFIG, type AppUser } from "./auth_linuxdo.ts";

// JWT 载荷接口
export interface JWTPayload {
  sub: string; // 用户ID
  username: string;
  name: string | null;
  email: string | null;
  avatar: string;
  trust_level: number; // 使用snake_case匹配Linux.do
  badge_count: number;
  is_staff: boolean;
  is_admin: boolean;
  iat: number; // 签发时间
  exp: number; // 过期时间
}

/**
 * 生成 JWT 令牌
 */
export async function generateJWT(user: AppUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const payload: JWTPayload = {
    sub: user.id.toString(),
    username: user.username,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    trust_level: user.trustLevel, // 从camelCase转换为snake_case
    badge_count: user.badgeCount,
    is_staff: user.isStaff,
    is_admin: user.isAdmin,
    iat: now,
    exp: now + JWT_CONFIG.expiresIn,
  };

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_CONFIG.secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );

  return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

/**
 * 验证 JWT 令牌
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_CONFIG.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const payload = await verify(token, key);
    
    // 检查令牌是否过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * 从请求中提取 JWT 令牌
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 从 Authorization header 中提取
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 从 Cookie 中提取
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    return cookies.auth_token || null;
  }

  return null;
}

/**
 * 解析 Cookie 字符串
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  cookieHeader.split(";").forEach(cookie => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * 创建认证 Cookie
 */
export function createAuthCookie(token: string, maxAge: number = JWT_CONFIG.expiresIn): string {
  const secure = Deno.env.get("NODE_ENV") === "production";
  const sameSite = "lax";
  
  return `auth_token=${encodeURIComponent(token)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
}

/**
 * 创建清除认证 Cookie 的字符串
 */
export function clearAuthCookie(): string {
  return "auth_token=; Max-Age=0; Path=/; HttpOnly; SameSite=lax";
}

/**
 * 从 JWT 载荷重建用户信息
 */
export function userFromJWTPayload(payload: JWTPayload): Partial<AppUser> {
  return {
    id: parseInt(payload.sub),
    username: payload.username,
    name: payload.name,
    email: payload.email,
    avatar: payload.avatar,
    trustLevel: payload.trust_level, // 从snake_case转换为camelCase
    badgeCount: payload.badge_count,
    isStaff: payload.is_staff,
    isAdmin: payload.is_admin,
  };
}
