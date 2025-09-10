import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/layout/Layout.tsx";
import { getPostsForUser } from "../utils/database_kv.ts";
import { verifyJWT, userFromJWTPayload } from "../utils/jwt.ts";

interface HomePageData {
  featuredPosts: any[];
  totalPosts: number;
  userTrustLevel: number;
  isAuthenticated: boolean;
}

export const handler: Handlers<HomePageData> = {
  async GET(req, ctx) {
    try {
      // 从 cookie 中获取用户信息
      const cookieHeader = req.headers.get("Cookie") || "";
      const cookies = parseCookies(cookieHeader);
      const token = cookies.auth_token;

      let userTrustLevel = 0;
      let isAuthenticated = false;

      if (token) {
        const payload = await verifyJWT(token);
        if (payload) {
          const user = userFromJWTPayload(payload);
          userTrustLevel = user.trustLevel || 0;
          isAuthenticated = true;
        }
      }

      // 根据用户信任等级获取可见帖子
      const allPosts = await getPostsForUser(userTrustLevel);
      const featuredPosts = allPosts.filter(post => post.featured).slice(0, 6);

      return ctx.render({
        featuredPosts,
        totalPosts: allPosts.length,
        userTrustLevel,
        isAuthenticated,
      });
    } catch (error) {
      console.error("Homepage data fetch error:", error);
      return ctx.render({
        featuredPosts: [],
        totalPosts: 0,
        userTrustLevel: 0,
        isAuthenticated: false,
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

export default function Home({ data }: PageProps<HomePageData>) {
  return (
    <>
      <Head>
        <title>Linux.do 女装展示 - 首页</title>
        <meta
          name="description"
          content="Linux.do 女装展示系统，聚合展示社区女装相关帖子，分享美丽瞬间"
        />
      </Head>
      <Layout title="Linux.do 女装展示">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-950 dark:via-purple-950 dark:to-indigo-950 opacity-60"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
            <div className="text-center space-y-8">
              {/* 主标题 */}
              <div className="space-y-4">
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">💄</span>
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                  <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Linux.do
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    女装展示
                  </span>
                </h1>
              </div>
              
              {/* 副标题 */}
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                聚合展示 Linux.do 社区的女装相关帖子
                <br />
                <span className="text-lg text-pink-600 dark:text-pink-400 font-medium">
                  分享美妆技巧 • 穿搭心得 • 美丽瞬间
                </span>
              </p>
              
              {/* 按钮组 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <a 
                  href="/dress"
                  className="group px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>✨ 进入展示页面</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 特性介绍 */}
        <div className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                为什么选择我们？
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                专业的女装展示平台，让美丽更简单
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* 特性1 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  精美展示
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  优雅的界面设计，让每一个瞬间都闪闪发光
                </p>
              </div>
              
              {/* 特性2 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  智能聚合
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  自动采集 Linux.do 相关帖子，智能分类整理
                </p>
              </div>
              
              {/* 特性3 */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">💫</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  社区互动
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  连接 Linux.do 社区，分享美丽，传递温暖
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Posts Section */}
        {data.featuredPosts.length > 0 && (
          <div className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  ✨ 精选内容
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  发现社区最受欢迎的女装分享
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>📊 共 {data.totalPosts} 篇帖子</span>
                  <span>⭐ {data.featuredPosts.length} 篇精选</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.featuredPosts.map((post: any) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                    {/* 精选标记 */}
                    <div className="relative">
                      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        ⭐ 精选
                      </div>
                      
                      {/* 图片或占位符 */}
                      <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage.thumbnailUrl || post.featuredImage.url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl opacity-50">💄</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      {/* 分类 */}
                      {post.category && (
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: post.category.color || "#6B7280" }}
                          ></span>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {post.category.name}
                          </span>
                        </div>
                      )}

                      {/* 标题 */}
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {post.title}
                      </h3>

                      {/* 摘要 */}
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      {/* 统计信息 */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>👀 {post.stats?.views || 0}</span>
                          <span>❤️ {post.stats?.likes || 0}</span>
                        </div>
                        
                        <a
                          href={post.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                        >
                          查看
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 查看更多按钮 */}
              <div className="text-center">
                <a
                  href="/dress"
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <span>查看全部内容</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 如果没有精选内容，显示统计信息 */}
        {data.featuredPosts.length === 0 && data.totalPosts > 0 && (
          <div className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="text-6xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                已有 {data.totalPosts} 篇精彩内容
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                社区成员正在分享美妆技巧、穿搭心得和美丽瞬间
              </p>
              <a
                href="/dress"
                className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <span>浏览全部内容</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-pink-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              准备好展示你的美丽了吗？
            </h2>
            <p className="text-xl text-pink-100 mb-8">
              加入我们，让每一次分享都成为美好的回忆
            </p>
            <a 
              href="/dress"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-pink-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span>💖 立即开始</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
}
