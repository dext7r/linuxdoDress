/**
 * 管理员帖子审核 API
 * POST /api/admin/posts/approve
 */

import { HandlerContext } from "$fresh/server.ts";
import { verifyJWT, userFromJWTPayload } from "../../../../utils/jwt.ts";
import { getKV, getPostById, updatePost } from "../../../../utils/database_kv.ts";
import { isAdmin } from "../../../../utils/adminConfig.ts";

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
      
      // 检查管理员权限
      if (!isAdmin(user)) {
        return new Response(
          JSON.stringify({ error: "Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 解析请求体
      const body = await req.json();
      const { postId, action, reason } = body; // action: 'approve' | 'reject'
      
      // 验证参数
      if (!postId || !action || !['approve', 'reject'].includes(action)) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid parameters",
            details: "postId and valid action (approve/reject) are required"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      const now = new Date().toISOString();
      
      // 检查帖子是否存在
      const post = await getPostById(postId);
      
      if (!post) {
        return new Response(
          JSON.stringify({ error: "Post not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 更新帖子状态
      let updatedPost;
      if (action === 'approve') {
        updatedPost = await updatePost(postId, {
          status: 'published',
          approved: true,
          published_at: now,
          processing_notes: (post.processing_notes || '') + 
            `\n${now}: 管理员 ${user.username} 批准发布` + (reason ? ` - ${reason}` : ''),
        });
      } else {
        updatedPost = await updatePost(postId, {
          status: 'rejected',
          approved: false,
          processing_notes: (post.processing_notes || '') + 
            `\n${now}: 管理员 ${user.username} 拒绝发布` + (reason ? ` - ${reason}` : ''),
        });
      }
      
      if (!updatedPost) {
        return new Response(
          JSON.stringify({ error: "Failed to update post" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          data: {
            postId,
            title: post.title,
            action,
            previousStatus: post.status,
            newStatus: action === 'approve' ? 'published' : 'rejected',
          },
          message: action === 'approve' 
            ? `帖子 "${post.title}" 已审核通过，现在可以在列表中显示` 
            : `帖子 "${post.title}" 已被拒绝`
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
      
    } catch (error) {
      console.error("Post approval error:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to process approval",
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