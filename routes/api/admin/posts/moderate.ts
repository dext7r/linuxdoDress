/**
 * 管理员内容审核 API
 * POST /api/admin/posts/moderate
 */

import { HandlerContext } from "$fresh/server.ts";
import { verifyJWT, userFromJWTPayload } from "../../../../utils/jwt.ts";
import { updatePost, getPostById, getAuthor } from "../../../../utils/database_kv.ts";
import { isAdmin } from "../../../../utils/adminConfig.ts";

export const handler = {
  async POST(req: Request, _ctx: HandlerContext): Promise<Response> {
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
      
      // 解析请求体
      const body = await req.json();
      const { postId, action, reason } = body;
      
      // 验证必要字段
      if (!postId || !action) {
        return new Response(
          JSON.stringify({ 
            error: "Missing required fields",
            details: "postId and action are required"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (!['approve', 'reject'].includes(action)) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid action",
            details: "action must be 'approve' or 'reject'"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 获取帖子
      const post = await getPostById(postId);
      if (!post) {
        return new Response(
          JSON.stringify({ error: "Post not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // 检查帖子状态
      if (post.status !== 'pending_approval') {
        return new Response(
          JSON.stringify({ 
            error: "Post is not pending approval",
            details: `Post status is currently: ${post.status}`
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 执行审核操作
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (action === 'approve') {
        updateData.status = 'published';
        updateData.approved = true;
        updateData.published_at = new Date().toISOString();
      } else if (action === 'reject') {
        updateData.status = 'rejected';
        updateData.approved = false;
        if (reason) {
          updateData.processing_notes = reason;
        }
      }
      
      // 更新帖子
      const updatedPost = await updatePost(postId, updateData);
      
      if (!updatedPost) {
        return new Response(
          JSON.stringify({ error: "Failed to update post" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // 记录审核日志
      console.log(`Post ${postId} ${action}d by admin ${user.username}: ${reason || 'No reason provided'}`);
      
      const actionText = action === 'approve' ? '批准' : '拒绝';
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: `内容已成功${actionText}`,
          data: {
            postId: updatedPost.id,
            status: updatedPost.status,
            action,
            reason: reason || null,
            moderatedBy: user.username,
            moderatedAt: updateData.updated_at
          }
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
      
    } catch (error) {
      console.error("Moderation error:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to process moderation",
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