import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/layout/Layout.tsx";
import { verifyJWT, userFromJWTPayload } from "../utils/jwt.ts";
import { AppUser } from "../utils/auth_linuxdo.ts";

interface ProfileData {
  user: AppUser | null;
  isAuthenticated: boolean;
}

export const handler: Handlers<ProfileData> = {
  async GET(req, ctx) {
    try {
      // 从 cookie 中获取 JWT
      const cookieHeader = req.headers.get("Cookie") || "";
      const cookies = parseCookies(cookieHeader);
      const token = cookies.auth_token;

      console.log("Profile page access:");
      console.log("- Cookie header:", cookieHeader ? "Present" : "Missing");
      console.log("- Auth token:", token ? "Present" : "Missing");

      if (!token) {
        console.log("No auth token found, redirecting to login");
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/api/auth/linux",
          },
        });
      }

      // 验证 JWT 并获取用户信息
      const payload = await verifyJWT(token);
      console.log("JWT verification:", payload ? "Success" : "Failed");
      
      if (!payload) {
        console.log("JWT verification failed, redirecting to login");
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/api/auth/linux",
          },
        });
      }

      // 从 JWT payload 重建用户对象
      const user = userFromJWTPayload(payload);
      console.log("Profile page access successful for user:", user.username);
      
      return ctx.render({
        user: user as AppUser,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Profile page error:", error);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/api/auth/linux",
        },
      });
    }
  },
};

export default function ProfilePage({ data }: PageProps<ProfileData>) {
  const { user } = data;

  if (!user) {
    return (
      <>
        <Head>
          <title>用户资料 - Linux.do 女装展示</title>
        </Head>
        <Layout title="用户资料">
          <div className="max-w-2xl mx-auto p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">请先登录</h1>
              <a 
                href="/api/auth/linux" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                立即登录
              </a>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{user.name || user.username} - 用户资料</title>
      </Head>
      <Layout title="用户资料">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* 用户资料卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* 头部背景 */}
            <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600"></div>
            
            {/* 用户信息 */}
            <div className="relative px-6 pb-6">
              {/* 头像 */}
              <div className="absolute -top-16 left-6">
                <img
                  src={user.avatar}
                  alt={`${user.name || user.username}'s avatar`}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                  loading="lazy"
                />
              </div>
              
              {/* 用户详情 */}
              <div className="pt-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.name || user.username}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                    {user.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {user.email}
                      </p>
                    )}
                  </div>
                  
                  {/* Linux.do 资料按钮 */}
                  <a
                    href={user.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    访问 Linux.do 资料
                  </a>
                </div>
                
                {/* 标签和统计 */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.trustLevel !== undefined && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm">
                      信任等级 {user.trustLevel}
                    </span>
                  )}
                  {user.isStaff && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded-full text-sm">
                      管理员
                    </span>
                  )}
                  {user.isAdmin && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full text-sm">
                      系统管理员
                    </span>
                  )}
                  {user.badgeCount > 0 && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-sm">
                      徽章 {user.badgeCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 账户信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              账户信息
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户ID
                </label>
                <p className="text-gray-900 dark:text-white font-mono">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户名
                </label>
                <p className="text-gray-900 dark:text-white">@{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  显示名称
                </label>
                <p className="text-gray-900 dark:text-white">{user.name || "未设置"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  邮箱地址
                </label>
                <p className="text-gray-900 dark:text-white">{user.email || "未提供"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  注册时间
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('zh-CN') : "未知"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  最后登录
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('zh-CN') : "未知"}
                </p>
              </div>
            </div>
          </div>

          {/* 操作区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              账户操作
            </h2>
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => globalThis.location.href = '/api/auth/logout'}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出登录
              </button>
            </div>
          </div>
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