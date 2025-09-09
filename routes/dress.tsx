/**
 * 女装展示主页
 */

import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/layout/Layout.tsx";
import PostGrid from "../islands/PostGrid.tsx";
import PostForm from "../islands/PostForm.tsx";
import { LinuxDoLoginButton } from "../components/auth/LoginButton.tsx";
import { verifyJWT, userFromJWTPayload } from "../utils/jwt.ts";
import { AppUser } from "../utils/auth_linuxdo.ts";

interface DressPageData {
  user: AppUser | null;
  isAuthenticated: boolean;
}

export const handler: Handlers<DressPageData> = {
  async GET(req, ctx) {
    try {
      // 从 cookie 中获取 JWT
      const cookieHeader = req.headers.get("Cookie") || "";
      const cookies = parseCookies(cookieHeader);
      const token = cookies.auth_token;

      let user: AppUser | null = null;
      let isAuthenticated = false;

      if (token) {
        // 验证 JWT 并获取用户信息
        const payload = await verifyJWT(token);
        if (payload) {
          user = userFromJWTPayload(payload) as AppUser;
          isAuthenticated = true;
        }
      }

      return ctx.render({
        user,
        isAuthenticated,
      });
    } catch (error) {
      console.error("Dress page authentication check error:", error);
      // 发生错误时，仍然渲染页面但用户未认证状态
      return ctx.render({
        user: null,
        isAuthenticated: false,
      });
    }
  },
};

export default function Home({ data }: PageProps<DressPageData>) {
  const { user, isAuthenticated } = data;
  return (
    <>
      <Head>
        <title>Linux.do 女装展示 - 首页</title>
        <meta
          name="description"
          content="Linux.do 女装展示系统，聚合展示社区女装相关帖子，分享美丽瞬间"
        />
        <meta
          name="keywords"
          content="Linux.do, 女装, 展示, 社区, 分享, 美妆, 穿搭"
        />
        <meta property="og:title" content="Linux.do 女装展示 - 首页" />
        <meta
          property="og:description"
          content="Linux.do 女装展示系统，聚合展示社区女装相关帖子，分享美丽瞬间"
        />
        <meta property="og:type" content="website" />
      </Head>
      
      <Layout title="Linux.do 女装展示">
        <div className="space-y-8">
          {/* Hero 区域 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 md:p-12">
            {/* 背景装饰 */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-pink-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
              <div className="absolute top-0 right-1/4 w-32 h-32 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
              <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
            </div>

            {/* Hero 内容 */}
            <div className="relative text-center space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-800 dark:text-pink-200 text-sm font-medium">
                💄 Linux.do 女装展示系统
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  美丽瞬间
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  精彩分享
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                聚合展示 Linux.do 社区的女装相关帖子，分享美妆技巧、穿搭心得，
                <br className="hidden md:block" />
                记录每一个精彩的蜕变时刻 ✨
              </p>

              {/* CTA 按钮 - 只有未登录用户才显示登录按钮 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!isAuthenticated ? (
                  <>
                    <LinuxDoLoginButton className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" />
                    <a 
                      href="#posts" 
                      className="px-6 py-3 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-400 dark:hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-300"
                    >
                      浏览帖子
                    </a>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img 
                          src={user?.avatar} 
                          alt={user?.username || "用户头像"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        欢迎回来，{user?.name || user?.username}！
                      </span>
                    </div>
                    <a 
                      href="#posts" 
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      开始创作
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 功能介绍 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                📱
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                帖子采集
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                一键采集 Linux.do 女装相关帖子，自动提取标题、内容、图片等信息
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                🎨
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                精美展示
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                卡片式布局展示帖子内容，支持图片预览、标签分类、作者信息展示
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                🔍
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                智能筛选
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                支持按分类、标签、作者等多维度筛选，快速找到感兴趣的内容
              </p>
            </div>
          </div>

          {/* 帖子表单 - 只有登录用户可见 */}
          <PostForm />

          {/* 帖子展示区域 */}
          <div id="posts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                精选帖子
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                实时更新中...
              </div>
            </div>
            
            <PostGrid />
          </div>

          {/* 统计信息 */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">💕</div>
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-pink-100">精选帖子</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">📸</div>
                <div className="text-2xl font-bold">5,678</div>
                <div className="text-pink-100">精美图片</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">👥</div>
                <div className="text-2xl font-bold">890</div>
                <div className="text-pink-100">活跃用户</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">❤️</div>
                <div className="text-2xl font-bold">12.3k</div>
                <div className="text-pink-100">获赞总数</div>
              </div>
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