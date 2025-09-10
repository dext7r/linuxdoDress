/**
 * 管理员面板组件 - 博客内容审核
 */

import { useEffect, useState } from "preact/hooks";

interface PendingPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  post_type: 'original' | 'collected' | 'shared';
  min_trust_level: number;
  mature_content: boolean;
  content_warnings?: string[];
  source_url?: string;
  tags?: string[];
  author: {
    id: number;
    username: string;
    display_name?: string;
    avatar?: string;
    trust_level: number;
  };
  category?: {
    id: number;
    name: string;
    color: string;
  };
  created_at: string;
  status: 'pending_approval' | 'published' | 'rejected';
}

interface PostsResponse {
  posts: PendingPost[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface AdminStats {
  pending: number;
  todayApproved: number;
  todayRejected: number;
  totalPublished: number;
}

export default function AdminPanel() {
  const [pendingPosts, setPendingPosts] = useState<PostsResponse | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // 获取管理员统计信息
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  // 获取帖子列表
  const fetchPosts = async (page = 1, status = selectedTab) => {
    try {
      setLoading(true);
      const endpoint = status === 'pending' ? 'pending' : status;
      const response = await fetch(`/api/admin/posts/${endpoint}?page=${page}&limit=10`);
      if (response.ok) {
        const result = await response.json();
        setPendingPosts(result.data);
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // 审核帖子
  const handleApproval = async (postId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setProcessing(postId);
      const response = await fetch('/api/admin/posts/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postId, 
          action, 
          reason: reason || (action === 'approve' ? '内容符合规范' : '不符合发布要求')
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // 刷新列表和统计信息
        await Promise.all([
          fetchPosts(currentPage, selectedTab),
          fetchStats()
        ]);
      } else {
        const error = await response.json();
        alert(`操作失败: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("操作失败，请重试");
    } finally {
      setProcessing(null);
    }
  };

  // 切换选项卡
  const handleTabChange = (tab: 'pending' | 'approved' | 'rejected') => {
    setSelectedTab(tab);
    setCurrentPage(1);
  };

  // 页面加载时获取数据
  useEffect(() => {
    Promise.all([
      fetchPosts(currentPage, selectedTab),
      fetchStats()
    ]);
  }, [currentPage, selectedTab]);

  // 获取可见性级别描述
  const getTrustLevelLabel = (level: number) => {
    const labels = {
      0: '🌍 公开',
      1: '👥 基础用户+',
      2: '⭐ 成员+',
      3: '🌟 常客+',
      4: '💎 领导者'
    };
    return labels[level as keyof typeof labels] || `Level ${level}`;
  };

  // 获取内容类型描述
  const getPostTypeLabel = (type: string) => {
    const labels = {
      'original': '✍️ 原创',
      'collected': '📚 教程',
      'shared': '🔗 分享'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading && !pendingPosts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">
            {stats?.pending || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            待审核内容
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats?.todayApproved || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            今日批准
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">
            {stats?.todayRejected || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            今日拒绝
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">
            {stats?.totalPublished || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            总发布数
          </div>
        </div>
      </div>

      {/* 选项卡导航 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'pending', label: '待审核', count: stats?.pending || 0 },
              { key: 'approved', label: '已批准', count: stats?.totalPublished || 0 },
              { key: 'rejected', label: '已拒绝', count: stats?.todayRejected || 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* 内容列表 */}
        {pendingPosts && pendingPosts.posts.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingPosts.posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 帖子标题和基本信息 */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {getPostTypeLabel(post.post_type)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          {getTrustLevelLabel(post.min_trust_level)}
                        </span>
                        {post.mature_content && (
                          <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            🔞 成人内容
                          </span>
                        )}
                        {post.category && (
                          <span 
                            className="text-xs px-2 py-1 rounded text-white"
                            style={{ backgroundColor: post.category.color }}
                          >
                            {post.category.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {post.title || "无标题"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                        {post.excerpt || post.content || "无内容"}
                      </p>
                    </div>

                    {/* 作者信息 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        {post.author?.avatar && (
                          <img
                            src={post.author.avatar}
                            alt="头像"
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span>@{post.author?.username || "未知用户"}</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          信任等级 {post.author?.trust_level || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* 标签 */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 内容警告 */}
                    {post.content_warnings && post.content_warnings.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          ⚠️ 内容警告: {post.content_warnings.join(', ')}
                        </div>
                      </div>
                    )}

                    {/* 来源链接 */}
                    {post.source_url && (
                      <div className="text-sm">
                        <a
                          href={post.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          🔗 查看来源链接
                        </a>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  {selectedTab === 'pending' && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleApproval(post.id, 'approve')}
                        disabled={processing === post.id}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {processing === post.id ? '处理中...' : '✅ 批准'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('请输入拒绝原因（可选）:');
                          if (reason !== null) { // 用户没有取消
                            handleApproval(post.id, 'reject', reason || '不符合发布要求');
                          }
                        }}
                        disabled={processing === post.id}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {processing === post.id ? '处理中...' : '❌ 拒绝'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">
              {selectedTab === 'pending' ? '📝' : selectedTab === 'approved' ? '✅' : '❌'}
            </div>
            <div className="text-lg font-medium mb-2">
              {selectedTab === 'pending' ? '暂无待审核内容' : 
               selectedTab === 'approved' ? '暂无已批准内容' : '暂无已拒绝内容'}
            </div>
            <div className="text-sm">
              {selectedTab === 'pending' ? '所有内容都已审核完成' : '暂时没有相关内容'}
            </div>
          </div>
        )}

        {/* 分页 */}
        {pendingPosts && pendingPosts.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              显示第 {((currentPage - 1) * pendingPosts.pageSize) + 1} - {Math.min(currentPage * pendingPosts.pageSize, pendingPosts.total)} 条，
              共 {pendingPosts.total} 条
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pendingPosts.hasPrevious}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                上一页
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pendingPosts.hasNext}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 刷新按钮 */}
      <div className="text-center">
        <button
          onClick={() => Promise.all([fetchPosts(currentPage, selectedTab), fetchStats()])}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '刷新中...' : '🔄 刷新列表'}
        </button>
      </div>
    </div>
  );
}