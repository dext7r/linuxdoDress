/**
 * 管理员页面
 */

import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/layout/Layout.tsx";
import { verifyJWT, userFromJWTPayload } from "../utils/jwt.ts";
import { isAdmin } from "../utils/adminConfig.ts";
import AdminPanel from "../islands/AdminPanel.tsx";

interface AdminPageData {
  user: any;
  isAdmin: boolean;
}

export const handler: Handlers<AdminPageData> = {
  async GET(req, ctx) {
    try {
      // 从 cookie 中获取 JWT
      const cookieHeader = req.headers.get("Cookie") || "";
      const cookies = parseCookies(cookieHeader);
      const token = cookies.auth_token;

      if (!token) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/api/auth/linuxdo?redirect=" + encodeURIComponent("/admin"),
          },
        });
      }

      // 验证 JWT 并获取用户信息
      const payload = await verifyJWT(token);
      if (!payload) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/api/auth/linuxdo?redirect=" + encodeURIComponent("/admin"),
          },
        });
      }

      const user = userFromJWTPayload(payload);
      
      // 检查管理员权限
      if (!isAdmin(user)) {
        return new Response(null, {
          status: 403,
          headers: {
            Location: "/?error=admin_access_required",
          },
        });
      }

      return ctx.render({
        user,
        isAdmin: true,
      });
    } catch (error) {
      console.error("Admin page error:", error);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/?error=admin_page_error",
        },
      });
    }
  },
};

export default function AdminPage({ data }: PageProps<AdminPageData>) {
  const { user } = data;

  return (
    <>
      <Head>
        <title>管理员面板 - Linux.do 女装展示</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Layout title="管理员面板">
        <div className="max-w-7xl mx-auto p-6">
          {/* 管理员信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={`${user.username}'s avatar`}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  管理员面板
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  欢迎，{user.name || user.username} 管理员
                </p>
              </div>
            </div>
          </div>

          {/* 管理员功能面板 */}
          <AdminPanel />
        </div>
      </Layout>
    </>
  );
}

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