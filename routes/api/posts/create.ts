/**
 * 用户内容创建 API
 * POST /api/posts/create
 */

import { HandlerContext } from "$fresh/server.ts";
import { verifyJWT, userFromJWTPayload } from "../../../utils/jwt.ts";
import { createPost, getAuthorByUsername, createAuthor } from "../../../utils/database_kv.ts";

export const handler = {
  async POST(req: Request, _ctx: HandlerContext): Promise<Response> {
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
      
      // 解析请求体
      const body = await req.json();
      const {
        title,
        content,
        category_id,
        tags,
        min_trust_level = 0,
        mature_content = false,
        post_type = 'original',
        source_url,
      } = body;
      
      // 验证必要字段
      if (!title || !content) {
        return new Response(
          JSON.stringify({ 
            error: "Missing required fields",
            details: "title and content are required"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 确保作者存在
      let author = await getAuthorByUsername(user.username);
      if (!author) {
        author = await createAuthor({
          username: user.username,
          display_name: user.name || user.username,
          avatar: user.avatar || '',
          profile_url: `https://linux.do/u/${user.username}`,
          trust_level: user.trustLevel || 0,
          badge_count: user.badgeCount || 0,
          is_staff: user.isStaff || false,
        });
      }
      
      // 处理标签
      const tagArray = typeof tags === 'string' 
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : Array.isArray(tags) ? tags : [];
      
      // 生成摘要
      const excerpt = content.replace(/<[^>]*>/g, '').substring(0, 200) + 
        (content.length > 200 ? '...' : '');
      
      // 创建帖子
      const post = await createPost({
        title,
        content,
        raw_content: content,
        excerpt,
        source_url: source_url || undefined,
        source_platform: post_type === 'collected' ? 'linux.do' : 'original',
        author_id: author.id,
        category_id: category_id ? parseInt(category_id) : undefined,
        views: 0,
        likes: 0,
        replies: 0,
        score: 0,
        status: 'pending_approval', // 需要审核
        featured: false,
        approved: false,
        post_type,
        min_trust_level: parseInt(min_trust_level) || 0,
        tags: tagArray,
        mature_content: Boolean(mature_content),
        content_warnings: mature_content ? ['成人内容'] : [],
      });
      
      return new Response(
        JSON.stringify({ 
          success: true,
          data: {
            id: post.id,
            title: post.title,
            status: post.status,
            post_type: post.post_type,
          },
          message: "内容提交成功，等待管理员审核后发布"
        }),
        { 
          status: 201, 
          headers: { "Content-Type": "application/json" } 
        }
      );
      
    } catch (error) {
      console.error("Create post error:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create post",
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