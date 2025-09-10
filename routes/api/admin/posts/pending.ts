/**
 * 获取待审核帖子列表 API
 * GET /api/admin/posts/pending
 */

import { HandlerContext } from "$fresh/server.ts";
import { verifyJWT, userFromJWTPayload } from "../../../../utils/jwt.ts";
import { getPosts } from "../../../../utils/postService.ts";
import { isAdmin } from "../../../../utils/adminConfig.ts";

export const handler = {
  async GET(req: Request, _ctx: HandlerContext): Promise<Response> {
    try {
      // 验证用户认证
      const authHeader = req.headers.get("Authorization");
      const cookieHeader = req.headers.get("Cookie") || "";
      
      let token = "";
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else {
        // 从cookie中提取token
        const cookies = parseCookies(cookieHeader);
        token = cookies.auth_token || "";
      }
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 验证JWT
      const payload = await verifyJWT(token);
      if (!payload) {
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 获取用户信息
      const user = userFromJWTPayload(payload);
      
      // 检查管理员权限
      if (!isAdmin(user)) {
        return new Response(
          JSON.stringify({ error: "Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 解析查询参数
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const status = url.searchParams.get("status") || "pending_approval";
      
      // 获取待审核帖子
      const result = await getPosts({
        status: [status],
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit,
        offset: (page - 1) * limit,
      });
      
      return new Response(
        JSON.stringify({ 
          success: true,
          data: result,
          message: `Found ${result.total} posts with status: ${status}`
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
      
    } catch (error) {
      console.error("Get pending posts error:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to get pending posts",
          message: error instanceof Error ? error.message : "Unknown error"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
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