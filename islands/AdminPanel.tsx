/**
 * 管理员面板组件
 */

import { useEffect, useState } from "preact/hooks";

interface PendingPost {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    displayName?: string;
    avatar?: string;
  };
  createdAt: string;
  sourceUrl: string;
  tags: string[];
  stats: {
    views: number;
    likes: number;
    replies: number;
  };
}

interface PostsResponse {
  posts: PendingPost[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function AdminPanel() {
  const [pendingPosts, setPendingPosts] = useState<PostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 获取待审核帖子
  const fetchPendingPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/posts/pending?page=${page}&limit=10`);
      if (response.ok) {
        const result = await response.json();
        setPendingPosts(result.data);
      } else {
        console.error("Failed to fetch pending posts");
      }
    } catch (error) {
      console.error("Error fetching pending posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // 审核帖子
  const handleApproval = async (postId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setProcessing(postId);
      const response = await fetch('/api/admin/posts/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, action, reason }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // 刷新列表
        await fetchPendingPosts(currentPage);
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

  // 页面加载时获取数据
  useEffect(() => {
    fetchPendingPosts(currentPage);
  }, [currentPage]);

  if (loading) {
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
          <div className="text-2xl font-bold text-blue-600">
            {pendingPosts?.total || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            待审核帖子
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            今日批准
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            今日拒绝
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">0</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            总发布数
          </div>
        </div>
      </div>

      {/* 待审核帖子列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            待审核帖子 ({pendingPosts?.total || 0})
          </h2>
        </div>

        {pendingPosts && pendingPosts.posts.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingPosts.posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 帖子标题和内容 */}
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {post.title || "无标题"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                        {post.content || "无内容"}
                      </p>
                    </div>

                    {/* 作者和统计信息 */}
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
                      </div>
                      <span>👁️ {post.stats?.views || 0}</span>
                      <span>❤️ {post.stats?.likes || 0}</span>
                      <span>💬 {post.stats?.replies || 0}</span>
                    </div>

                    {/* 标签 */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 来源链接 */}
                    {post.sourceUrl && (
                      <div className="text-sm">
                        <a
                          href={post.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          🔗 查看原帖
                        </a>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleApproval(post.id, 'approve', '内容符合规范')}
                      disabled={processing === post.id}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {processing === post.id ? '处理中...' : '✅ 批准'}
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('请输入拒绝原因（可选）:');
                        handleApproval(post.id, 'reject', reason || '不符合发布要求');
                      }}
                      disabled={processing === post.id}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {processing === post.id ? '处理中...' : '❌ 拒绝'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">📝</div>
            <div className="text-lg font-medium mb-2">暂无待审核帖子</div>
            <div className="text-sm">所有帖子都已审核完成</div>
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
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pendingPosts.hasNext}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          onClick={() => fetchPendingPosts(currentPage)}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '刷新中...' : '🔄 刷新列表'}
        </button>
      </div>
    </div>
  );
}