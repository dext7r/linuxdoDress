import { Head } from "$fresh/runtime.ts";
import Layout from "../components/layout/Layout.tsx";

export default function Home() {
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
