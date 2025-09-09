/**
 * 帖子网格展示 Island 组件
 */

import { useState, useEffect } from "preact/hooks";
import Card, { CardContent } from "../components/ui/Card.tsx";
import Button from "../components/ui/Button.tsx";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  sourceUrl: string;
  author: {
    id: number;
    username: string;
    displayName?: string;
    avatar?: string;
    trustLevel?: number;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
    color?: string;
  };
  tags: Array<{
    id: number;
    name: string;
  }>;
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    alt?: string;
  }>;
  featuredImage?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    alt?: string;
  };
  stats: {
    views: number;
    likes: number;
    replies: number;
  };
  createdAt: string;
  status: string;
  featured: boolean;
}

export default function PostGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?page=${pageNum}&limit=12&status=published&sortBy=created_at&sortOrder=desc`);
      const data = await response.json();

      if (data.success) {
        if (pageNum === 1) {
          setPosts(data.data.posts);
        } else {
          setPosts(prev => [...prev, ...data.data.posts]);
        }
        setHasMore(data.data.hasNext);
      } else {
        setError(data.message || "加载失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "未知";
    }
  };

  const getTrustLevelText = (level?: number) => {
    switch (level) {
      case 0: return "新用户";
      case 1: return "基础用户";
      case 2: return "成员";
      case 3: return "常客";
      case 4: return "领导者";
      default: return "用户";
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 加载骨架 */}
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-4xl">😕</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">加载出错了</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Button 
          onClick={() => fetchPosts(1)} 
          variant="primary"
        >
          重新加载
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-4xl">📝</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">暂无帖子</h3>
        <p className="text-gray-600 dark:text-gray-400">
          还没有发布的帖子，快去添加一些精彩内容吧！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 帖子网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            {/* 特色标记 */}
            {post.featured && (
              <div className="absolute top-3 left-3 z-10 bg-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                ⭐ 精选
              </div>
            )}

            {/* 图片 */}
            {post.featuredImage && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img
                  src={post.featuredImage.thumbnailUrl || post.featuredImage.url}
                  alt={post.featuredImage.alt || post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}

            <CardContent className="p-4 space-y-3">
              {/* 分类标签 */}
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

              {/* 标签 */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded"
                    >
                      #{tag.name}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{post.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* 作者信息 */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.displayName || post.author.username}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(post.author.displayName || post.author.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {post.author.displayName || post.author.username}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getTrustLevelText(post.author.trustLevel)}
                    </span>
                  </div>
                </div>
                
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  <div>{formatDate(post.createdAt)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span>👀 {post.stats.views}</span>
                    <span>❤️ {post.stats.likes}</span>
                  </div>
                </div>
              </div>

              {/* 查看按钮 */}
              <div className="pt-2">
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                >
                  查看原帖
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            loading={loading}
            variant="outline"
            className="px-8"
          >
            {loading ? "加载中..." : "加载更多"}
          </Button>
        </div>
      )}

      {/* 没有更多了 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            🎉 已经到底了，没有更多内容了
          </p>
        </div>
      )}
    </div>
  );
}