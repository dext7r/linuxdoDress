/**
 * 获取待审核帖子列表 API
 * GET /api/admin/posts/pending
 */

import { HandlerContext } from "$fresh/server.ts";
import { verifyJWT, userFromJWTPayload } from "../../../../utils/jwt.ts";
import { getPostsByStatus, getAuthor, getCategories } from "../../../../utils/database_kv.ts";
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
      const offset = (page - 1) * limit;
      
      // 获取待审核帖子
      const allPendingPosts = await getPostsByStatus('pending_approval');
      
      // 获取分类信息用于映射
      const categories = await getCategories();
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
      
      // 按创建时间倒序排序
      allPendingPosts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // 分页处理
      const total = allPendingPosts.length;
      const paginatedPosts = allPendingPosts.slice(offset, offset + limit);
      
      // 丰富帖子数据：添加作者和分类信息
      const enrichedPosts = await Promise.all(
        paginatedPosts.map(async (post) => {
          const author = await getAuthor(post.author_id);
          const category = post.category_id ? categoryMap.get(post.category_id) : null;
          
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            post_type: post.post_type,
            min_trust_level: post.min_trust_level,
            mature_content: post.mature_content,
            content_warnings: post.content_warnings,
            source_url: post.source_url,
            tags: post.tags,
            author: author ? {
              id: author.id,
              username: author.username,
              display_name: author.display_name,
              avatar: author.avatar,
              trust_level: author.trust_level
            } : null,
            category: category ? {
              id: category.id,
              name: category.name,
              color: category.color
            } : null,
            created_at: post.created_at,
            status: post.status
          };
        })
      );
      
      // 计算分页信息
      const pageSize = limit;
      const hasNext = offset + limit < total;
      const hasPrevious = page > 1;
      
      return new Response(
        JSON.stringify({ 
          success: true,
          data: {
            posts: enrichedPosts,
            total,
            page,
            pageSize,
            hasNext,
            hasPrevious
          }
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