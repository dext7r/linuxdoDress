/**
 * 女装帖子相关数据类型定义
 */

// 帖子作者信息
export interface PostAuthor {
  id: number;
  username: string;
  displayName?: string;
  avatar?: string;
  profileUrl?: string;
  trustLevel?: number;
  badgeCount?: number;
  isStaff?: boolean;
}

// 帖子图片信息
export interface PostImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  size?: number; // 文件大小（字节）
  originalUrl?: string; // 原始 URL（如果是从 linux.do 采集的）
  localPath?: string; // 本地存储路径（如果下载到本地）
}

// 帖子分类
export interface PostCategory {
  id: number;
  name: string;
  slug: string;
  color?: string;
  description?: string;
}

// 帖子标签
export interface PostTag {
  id: number;
  name: string;
  count?: number;
}

// 帖子统计信息
export interface PostStats {
  views: number;
  likes: number;
  replies: number;
  score?: number;
  lastActivity?: string;
}

// 帖子主体数据
export interface Post {
  id: string; // 使用 UUID
  
  // 基本信息
  title: string;
  content: string; // 处理后的内容（去除敏感信息等）
  rawContent?: string; // 原始内容
  excerpt?: string; // 摘要
  
  // 来源信息
  sourceUrl: string; // 原帖子 URL
  sourceId?: string; // 原帖子在 linux.do 的 ID
  sourcePlatform: 'linux.do' | 'manual'; // 来源平台
  
  // 作者信息
  author: PostAuthor;
  
  // 分类和标签
  category?: PostCategory;
  tags: PostTag[];
  
  // 图片信息
  images: PostImage[];
  featuredImage?: PostImage; // 主图
  
  // 统计信息
  stats: PostStats;
  
  // 时间信息
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  publishedAt?: string; // 发布时间
  sourceCreatedAt?: string; // 原帖创建时间
  
  // 状态信息
  status: 'draft' | 'published' | 'hidden' | 'deleted';
  featured: boolean; // 是否推荐
  approved: boolean; // 是否审核通过
  
  // 元数据
  metadata?: {
    collectedAt: string; // 采集时间
    collectorVersion?: string; // 采集器版本
    processingNotes?: string; // 处理说明
    flags?: string[]; // 标记（如：需要人工审核等）
  };
}

// 帖子查询过滤器
export interface PostFilter {
  status?: Post['status'][];
  category?: number[];
  tags?: number[];
  author?: string[];
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
  hasImages?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'views' | 'likes' | 'replies';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 帖子创建/更新输入
export interface PostInput {
  title: string;
  content: string;
  sourceUrl: string;
  categoryId?: number;
  tagIds?: number[];
  status?: Post['status'];
  featured?: boolean;
}

// 帖子采集任务
export interface PostCollectionTask {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  error?: string;
  progress?: number; // 0-100
  result?: Post; // 采集成功后的结果
}

// API 响应类型
export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PostResponse {
  post: Post;
}

export interface CollectionTaskResponse {
  task: PostCollectionTask;
}