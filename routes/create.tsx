/**
 * 用户内容创建页面
 */

import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/layout/Layout.tsx";
import CreateContentForm from "../islands/CreateContentForm.tsx";
import { verifyJWT, userFromJWTPayload } from "../utils/jwt.ts";
import { AppUser } from "../utils/auth_linuxdo.ts";
import { getCategories } from "../utils/database_kv.ts";

interface CreatePageData {
  user: AppUser | null;
  isAuthenticated: boolean;
  categories: any[];
  userTrustLevel: number;
}

export const handler: Handlers<CreatePageData> = {
  async GET(req, ctx) {
    try {
      // 从 cookie 中获取 JWT
      const cookieHeader = req.headers.get("Cookie") || "";
      const cookies = parseCookies(cookieHeader);
      const token = cookies.auth_token;

      let user: AppUser | null = null;
      let isAuthenticated = false;
      let userTrustLevel = 0;

      if (token) {
        // 验证 JWT 并获取用户信息
        const payload = await verifyJWT(token);
        if (payload) {
          user = userFromJWTPayload(payload) as AppUser;
          isAuthenticated = true;
          userTrustLevel = user.trustLevel || 0;
        }
      }

      // 获取分类列表
      const categories = await getCategories();

      return ctx.render({
        user,
        isAuthenticated,
        categories,
        userTrustLevel,
      });
    } catch (error) {
      console.error("Create page error:", error);
      return ctx.render({
        user: null,
        isAuthenticated: false,
        categories: [],
        userTrustLevel: 0,
      });
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

export default function CreatePage({ data }: PageProps<CreatePageData>) {
  const { user, isAuthenticated, categories, userTrustLevel } = data;

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>创作内容 - Linux.do 女装展示</title>
          <meta name="description" content="登录后即可创作和分享内容" />
        </Head>
        <Layout title="创作内容">
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="text-center space-y-6">
              <div className="text-6xl">🔐</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                需要登录才能创作内容
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                请先登录您的 Linux.do 账号，即可开始创作和分享精彩内容
              </p>
              <a
                href="/api/auth/linuxdo"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <span>💄</span>
                <span>立即登录</span>
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
        <title>创作内容 - Linux.do 女装展示</title>
        <meta name="description" content="分享您的美妆技巧、穿搭心得和美丽瞬间" />
      </Head>
      <Layout title="创作内容">
        {/* 页面标题 */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ✨ 创作内容
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            分享您的美妆技巧、穿搭心得和美丽瞬间
          </p>
        </div>

        {/* 使用创作表单 Island */}
        <CreateContentForm categories={categories} userTrustLevel={userTrustLevel} />

        {/* 创作指南 */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              💡 创作指南
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">内容建议</h4>
                <ul className="space-y-1">
                  <li>• 分享真实的经验和感受</li>
                  <li>• 提供详细的步骤说明</li>
                  <li>• 配图能让内容更生动</li>
                  <li>• 尊重他人，友善交流</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">发布流程</h4>
                <ul className="space-y-1">
                  <li>• 创作内容后需要管理员审核</li>
                  <li>• 审核通过后将公开显示</li>
                  <li>• 可以随时编辑已发布的内容</li>
                  <li>• 遵循社区规范和准则</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
