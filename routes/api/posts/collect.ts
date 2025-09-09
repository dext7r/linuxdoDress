/**
 * 帖子采集 API
 * POST /api/posts/collect
 */

import { HandlerContext } from "$fresh/server.ts";
import { verifyJWT, userFromJWTPayload } from "../../../utils/jwt.ts";
import { collectPost, isValidLinuxDoUrl } from "../../../utils/postCollector.ts";
import { saveCollectedPost } from "../../../utils/postService.ts";

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
      const { url, processImages = true, extractText = true } = body;
      
      // 验证URL
      if (!url || typeof url !== 'string') {
        return new Response(
          JSON.stringify({ 
            error: "Invalid URL",
            details: "A valid linux.do post URL is required"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      if (!isValidLinuxDoUrl(url)) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid linux.do URL",
            details: "URL must be a valid linux.do post URL"
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // 采集帖子
      const collectedPost = await collectPost({
        url,
        processImages,
        extractText,
      });
      
      // 保存到数据库（等待审核状态）
      const savedPostId = await saveCollectedPost(collectedPost, {
        collectorUserId: user.id,
        collectorUsername: user.username,
        sourceUrl: url,
        status: 'pending_approval', // 等待审核
      });
      
      return new Response(
        JSON.stringify({ 
          success: true,
          data: {
            postId: savedPostId,
            title: collectedPost.title,
            status: 'pending_approval',
          },
          message: "帖子信息已采集完成，管理员审核通过后将在列表中显示"
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
      
    } catch (error) {
      console.error("Collect post error:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to collect post",
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