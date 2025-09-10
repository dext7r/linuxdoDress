/**
 * 管理员统计信息 API
 * GET /api/admin/stats
 */

import { HandlerContext } from "$fresh/server.ts";
import { verifyJWT, userFromJWTPayload } from "../../../utils/jwt.ts";
import { getPostsByStatus, getPosts } from "../../../utils/database_kv.ts";
import { isAdmin } from "../../../utils/adminConfig.ts";

export const handler = {
  async GET(req: Request, _ctx: HandlerContext): Promise<Response> {
    try {
      // 验证管理员权限
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
      
      // 获取用户信息并检查管理员权限
      const user = userFromJWTPayload(payload);
      if (!isAdmin(user)) {
        return new Response(
          JSON.stringify({ error: "Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // 获取各种状态的帖子统计
      const [pendingPosts, publishedPosts, rejectedPosts] = await Promise.all([
        getPostsByStatus('pending_approval'),
        getPostsByStatus('published'),
        getPostsByStatus('rejected')
      ]);

      // 计算今日统计 (UTC时间)
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const todayApproved = publishedPosts.filter(post => 
        post.published_at && post.published_at.startsWith(today)
      ).length;

      const todayRejected = rejectedPosts.filter(post => 
        post.updated_at && post.updated_at.startsWith(today) && post.status === 'rejected'
      ).length;

      const stats = {
        pending: pendingPosts.length,
        todayApproved,
        todayRejected, 
        totalPublished: publishedPosts.length,
        totalRejected: rejectedPosts.length,
        lastUpdated: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify({ 
          success: true,
          data: stats
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
      
    } catch (error) {
      console.error("Get admin stats error:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch admin statistics",
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