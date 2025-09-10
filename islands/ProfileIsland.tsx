/**
 * 个人资料页面 Island 组件
 * 处理客户端认证状态和用户信息显示
 */

import { useEffect, useState } from "preact/hooks";
import { useAuthStore } from "../stores/useAuthStore.ts";
import { isAdmin } from "../utils/adminConfig.ts";

export default function ProfileIsland() {
  const { isAuthenticated, user, isLoading, checkAuth, performLogout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  // 登出处理
  const handleLogout = async () => {
    await performLogout("/");
  };

  // 未挂载时显示空内容（避免服务端渲染不匹配）
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"></div>;
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 未认证状态
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            请先登录
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            您需要登录才能查看个人资料
          </p>
          <a
            href="/api/auth/linux"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            登录
          </a>
        </div>
      </div>
    );
  }

  // 认证后的个人资料页面
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            个人资料
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            管理您的账户信息和偏好设置
          </p>
        </div>

        {/* 用户信息卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          <div className="relative px-6 pb-6">
            {/* 头像 */}
            <div className="flex items-start -mt-16 mb-4">
              <div className="relative">
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.displayName || user.username}
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-white"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.png';
                  }}
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              
              <div className="ml-6 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.displayName || user.username}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  @{user.username}
                </p>
              </div>
            </div>

            {/* 用户标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {user.trustLevel !== undefined && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm">
                  信任等级 {user.trustLevel}
                </span>
              )}
              {isAdmin(user) && (
                <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full text-sm">
                  管理员
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

        {/* 详细信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              基本信息
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户名
                </label>
                <p className="text-gray-900 dark:text-white">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  显示名称
                </label>
                <p className="text-gray-900 dark:text-white">{user.displayName || '未设置'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  用户 ID
                </label>
                <p className="text-gray-900 dark:text-white">{user.id}</p>
              </div>
            </div>
          </div>

          {/* 账户统计 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              账户统计
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  信任等级
                </label>
                <p className="text-gray-900 dark:text-white">{user.trustLevel || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  徽章数量
                </label>
                <p className="text-gray-900 dark:text-white">{user.badgeCount || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  注册时间
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  最后活跃
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              编辑资料
            </button>
          </div>
          <div className="flex-1">
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              隐私设置
            </button>
          </div>
          <div className="flex-1">
            <button 
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}