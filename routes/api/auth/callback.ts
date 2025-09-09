/**
 * Linux.do OAuth 回调路由
 * GET /api/auth/callback
 */

import { HandlerContext } from "$fresh/server.ts";
import {
  exchangeCodeForToken,
  fetchLinuxDoUser,
  transformLinuxDoUser,
} from "../../../utils/auth_linuxdo.ts";
import { generateJWT, createAuthCookie } from "../../../utils/jwt.ts";

export const handler = {
  async GET(req: Request, _ctx: HandlerContext): Promise<Response> {
    try {
      const url = new URL(req.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      // 检查是否有错误
      if (error) {
        console.error("❌ Linux.do OAuth error:", error);
        return new Response(null, {
          status: 302,
          headers: {
            "Location": `/?error=${encodeURIComponent(error)}`,
          },
        });
      }

      // 检查必需参数
      if (!code || !state) {
        console.error("❌ Missing required parameters:", { code: !!code, state: !!state });
        return new Response(null, {
          status: 302,
          headers: {
            "Location": "/?error=missing_parameters",
          },
        });
      }

      // 验证状态参数（防止 CSRF 攻击）
      const cookies = parseCookies(req.headers.get("Cookie") || "");
      const storedState = cookies.oauth_state;
      const redirectTo = decodeURIComponent(cookies.oauth_redirect || "/");

      if (!storedState || storedState !== state) {
        console.error("OAuth state mismatch");
        return new Response(null, {
          status: 302,
          headers: {
            "Location": "/?error=state_mismatch",
          },
        });
      }

      // 使用授权码获取访问令牌
      const accessToken = await exchangeCodeForToken(code);

      // 使用访问令牌获取用户信息
      const linuxdoUser = await fetchLinuxDoUser(accessToken);

      // 转换为应用用户格式
      const appUser = transformLinuxDoUser(linuxdoUser);

      // 生成 JWT 令牌
      const jwt = await generateJWT(appUser);

      // 创建响应，设置认证 Cookie 并清除临时 Cookie
      const authCookie = createAuthCookie(jwt);

      const response = new Response(null, {
        status: 302,
        headers: new Headers({
          "Location": redirectTo,
        }),
      });

      // 设置多个 Cookie，每个都需要单独的 Set-Cookie 头
      response.headers.append("Set-Cookie", authCookie);
      response.headers.append("Set-Cookie", "oauth_state=; Max-Age=0; Path=/; HttpOnly; SameSite=lax");
      response.headers.append("Set-Cookie", "oauth_redirect=; Max-Age=0; Path=/; HttpOnly; SameSite=lax");
      return response;
    } catch (error) {
      console.error("Linux.do OAuth callback error:", error);
      
      // 根据错误类型返回不同的错误信息
      let errorMessage = "authentication_failed";
      if (error instanceof Error) {
        if (error.message.includes("token")) {
          errorMessage = "token_exchange_failed";
        } else if (error.message.includes("user")) {
          errorMessage = "user_fetch_failed";
        }
      }

      return new Response(null, {
        status: 302,
        headers: {
          "Location": `/?error=${errorMessage}`,
        },
      });
    }
  },
};

/**
 * 解析 Cookie 字符串
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach(cookie => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  return cookies;
}
