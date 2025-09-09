/**
 * 帖子管理 API - 创建帖子
 * POST /api/posts
 */

import { HandlerContext } from "$fresh/server.ts";
import { verifyJWT } from "../../../utils/jwt.ts";
import { createPost, getPosts } from "../../../utils/postService.ts";
import type { PostInput } from "../../../types/post.ts";

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
      
      // 解析请求体
      const body = await req.json();
      const postInput: PostInput = {
        title: body.title,
        content: body.content,
        sourceUrl: body.sourceUrl,
        categoryId: body.categoryId,
        tagIds: body.tagIds,
        status: body.status || 'draft',
        featured: body.featured || false,
      };
      
      // 验证必要字段
      if (!postInput.title || !postInput.content || !postInput.sourceUrl) {
        return new Response(
          JSON.stringify({ 
            error: "Missing required fields",
            details: "title, content, and sourceUrl are required"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 创建帖子
      const postId = await createPost(postInput);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { id: postId },
          message: "Post created successfully"
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
  
  async GET(req: Request, _ctx: HandlerContext): Promise<Response> {
    try {
      const url = new URL(req.url);
      const searchParams = url.searchParams;
      
      // 构建过滤器
      const filter = {
        status: searchParams.get('status')?.split(',') as any,
        category: searchParams.get('category')?.split(',').map(Number).filter(n => !isNaN(n)),
        tags: searchParams.get('tags')?.split(',').map(Number).filter(n => !isNaN(n)),
        author: searchParams.get('author')?.split(','),
        featured: searchParams.get('featured') === 'true' ? true : 
                 searchParams.get('featured') === 'false' ? false : undefined,
        hasImages: searchParams.get('hasImages') === 'true' ? true :
                  searchParams.get('hasImages') === 'false' ? false : undefined,
        sortBy: searchParams.get('sortBy') as any || 'created_at',
        sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
        limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
        offset: parseInt(searchParams.get('offset') || '0'),
      };
      
      // 获取帖子列表
      const result = await getPosts(filter);
      
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error("Get posts error:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to get posts",
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