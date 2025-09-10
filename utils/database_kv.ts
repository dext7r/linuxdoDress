/**
 * 基于 Deno KV 的数据库层
 * 支持本地和 Deno Deploy 环境
 */

// 类型定义
export interface Author {
  id: number;
  username: string;
  display_name?: string;
  avatar?: string;
  profile_url?: string;
  trust_level: number;
  badge_count: number;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  description?: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  count: number;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  raw_content?: string;
  excerpt?: string;
  source_url: string;
  source_id?: string;
  source_platform: string;
  author_id: number;
  category_id?: number;
  views: number;
  likes: number;
  replies: number;
  score: number;
  last_activity?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  source_created_at?: string;
  status: 'draft' | 'pending_approval' | 'published' | 'hidden' | 'deleted' | 'rejected';
  featured: boolean;
  approved: boolean;
  collected_at?: string;
  collector_version?: string;
  processing_notes?: string;
}

export interface PostImage {
  id: string;
  post_id: string;
  url: string;
  thumbnail_url?: string;
  alt?: string;
  width?: number;
  height?: number;
  size?: number;
  original_url?: string;
  local_path?: string;
  is_featured: boolean;
  sort_order: number;
}

export interface CollectionTask {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  result_post_id?: string;
  created_at: string;
  updated_at: string;
}

// KV 数据库实例
let kv: Deno.Kv | null = null;

/**
 * 初始化 KV 数据库
 */
export async function initKV(): Promise<Deno.Kv> {
  if (kv) {
    return kv;
  }

  kv = await Deno.openKv();
  
  // 初始化默认数据
  await insertDefaultData();
  
  console.log("✅ Deno KV database initialized");
  return kv;
}

/**
 * 获取 KV 数据库实例
 */
export async function getKV(): Promise<Deno.Kv> {
  if (!kv) {
    return await initKV();
  }
  return kv;
}

/**
 * 关闭 KV 数据库
 */
export function closeKV(): void {
  if (kv) {
    kv.close();
    kv = null;
  }
}

// 数据操作函数

/**
 * 获取所有已发布的帖子
 */
export async function getPosts(): Promise<Post[]> {
  const kv = await getKV();
  const posts: Post[] = [];
  
  const iter = kv.list({ prefix: ["posts"] });
  for await (const entry of iter) {
    const post = entry.value as Post;
    if (post.status === 'published') {
      posts.push(post);
    }
  }
  
  // 按创建时间倒序排序
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * 根据状态获取帖子
 */
export async function getPostsByStatus(status: Post['status']): Promise<Post[]> {
  const kv = await getKV();
  const posts: Post[] = [];
  
  const iter = kv.list({ prefix: ["posts"] });
  for await (const entry of iter) {
    const post = entry.value as Post;
    if (post.status === status) {
      posts.push(post);
    }
  }
  
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * 根据 ID 获取帖子
 */
export async function getPostById(id: string): Promise<Post | null> {
  const kv = await getKV();
  const result = await kv.get(["posts", id]);
  return result.value as Post | null;
}

/**
 * 创建新帖子
 */
export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
  const kv = await getKV();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const newPost: Post = {
    ...post,
    id,
    created_at: now,
    updated_at: now,
  };
  
  await kv.set(["posts", id], newPost);
  return newPost;
}

/**
 * 更新帖子
 */
export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
  const kv = await getKV();
  const existing = await kv.get(["posts", id]);
  
  if (!existing.value) {
    return null;
  }
  
  const updatedPost: Post = {
    ...(existing.value as Post),
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  await kv.set(["posts", id], updatedPost);
  return updatedPost;
}

/**
 * 删除帖子
 */
export async function deletePost(id: string): Promise<boolean> {
  const kv = await getKV();
  const existing = await kv.get(["posts", id]);
  
  if (!existing.value) {
    return false;
  }
  
  await kv.delete(["posts", id]);
  return true;
}

/**
 * 获取帖子图片
 */
export async function getPostImages(postId: string): Promise<PostImage[]> {
  const kv = await getKV();
  const images: PostImage[] = [];
  
  const iter = kv.list({ prefix: ["post_images", postId] });
  for await (const entry of iter) {
    images.push(entry.value as PostImage);
  }
  
  return images.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * 添加帖子图片
 */
export async function addPostImage(image: Omit<PostImage, 'id'>): Promise<PostImage> {
  const kv = await getKV();
  const id = crypto.randomUUID();
  
  const newImage: PostImage = {
    ...image,
    id,
  };
  
  await kv.set(["post_images", image.post_id, id], newImage);
  return newImage;
}

/**
 * 获取作者信息
 */
export async function getAuthor(id: number): Promise<Author | null> {
  const kv = await getKV();
  const result = await kv.get(["authors", id]);
  return result.value as Author | null;
}

/**
 * 根据用户名获取作者
 */
export async function getAuthorByUsername(username: string): Promise<Author | null> {
  const kv = await getKV();
  const iter = kv.list({ prefix: ["authors"] });
  
  for await (const entry of iter) {
    const author = entry.value as Author;
    if (author.username === username) {
      return author;
    }
  }
  
  return null;
}

/**
 * 创建作者
 */
export async function createAuthor(author: Omit<Author, 'id' | 'created_at' | 'updated_at'>): Promise<Author> {
  const kv = await getKV();
  
  // 生成新的作者 ID
  const counterResult = await kv.get(["counters", "authors"]);
  const nextId = (counterResult.value as number || 0) + 1;
  await kv.set(["counters", "authors"], nextId);
  
  const now = new Date().toISOString();
  const newAuthor: Author = {
    ...author,
    id: nextId,
    created_at: now,
    updated_at: now,
  };
  
  await kv.set(["authors", nextId], newAuthor);
  return newAuthor;
}

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<Category[]> {
  const kv = await getKV();
  const categories: Category[] = [];
  
  const iter = kv.list({ prefix: ["categories"] });
  for await (const entry of iter) {
    categories.push(entry.value as Category);
  }
  
  return categories.sort((a, b) => a.id - b.id);
}

/**
 * 获取所有标签
 */
export async function getTags(): Promise<Tag[]> {
  const kv = await getKV();
  const tags: Tag[] = [];
  
  const iter = kv.list({ prefix: ["tags"] });
  for await (const entry of iter) {
    tags.push(entry.value as Tag);
  }
  
  return tags.sort((a, b) => b.count - a.count);
}

/**
 * 创建采集任务
 */
export async function createCollectionTask(url: string): Promise<CollectionTask> {
  const kv = await getKV();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const task: CollectionTask = {
    id,
    url,
    status: 'pending',
    progress: 0,
    created_at: now,
    updated_at: now,
  };
  
  await kv.set(["collection_tasks", id], task);
  return task;
}

/**
 * 更新采集任务
 */
export async function updateCollectionTask(id: string, updates: Partial<CollectionTask>): Promise<CollectionTask | null> {
  const kv = await getKV();
  const existing = await kv.get(["collection_tasks", id]);
  
  if (!existing.value) {
    return null;
  }
  
  const updatedTask: CollectionTask = {
    ...(existing.value as CollectionTask),
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  await kv.set(["collection_tasks", id], updatedTask);
  return updatedTask;
}

/**
 * 插入默认数据
 */
export async function insertDefaultData(): Promise<void> {
  const kv = await getKV();
  
  // 检查是否已经初始化
  const initialized = await kv.get(["system", "initialized"]);
  if (initialized.value) {
    return;
  }
  
  // 插入默认分类
  const defaultCategories: Omit<Category, 'id'>[] = [
    { name: "女装分享", slug: "nvzhuang-fenxiang", color: "#e91e63", description: "女装照片分享", created_at: new Date().toISOString() },
    { name: "妆容教程", slug: "zhuangrong-jiaocheng", color: "#9c27b0", description: "化妆教程和技巧", created_at: new Date().toISOString() },
    { name: "穿搭指南", slug: "chuanda-zhinan", color: "#673ab7", description: "服装搭配建议", created_at: new Date().toISOString() },
    { name: "购物推荐", slug: "gouwu-tuijian", color: "#3f51b5", description: "好物推荐", created_at: new Date().toISOString() },
    { name: "经验交流", slug: "jingyan-jiaoliu", color: "#2196f3", description: "经验分享", created_at: new Date().toISOString() }
  ];
  
  for (let i = 0; i < defaultCategories.length; i++) {
    const category: Category = { ...defaultCategories[i], id: i + 1 };
    await kv.set(["categories", category.id], category);
  }
  
  await kv.set(["counters", "categories"], defaultCategories.length);
  
  // 插入默认标签
  const defaultTags = [
    "女装", "自拍", "OOTD", "化妆", "护肤", "发型", "美甲", "配饰", 
    "连衣裙", "半身裙", "上衣", "裤装", "鞋子", "包包", "首饰",
    "日系", "韩系", "欧美", "森系", "甜美", "帅气", "优雅", "可爱"
  ];
  
  for (let i = 0; i < defaultTags.length; i++) {
    const tag: Tag = {
      id: i + 1,
      name: defaultTags[i],
      count: 0,
      created_at: new Date().toISOString()
    };
    await kv.set(["tags", tag.id], tag);
  }
  
  await kv.set(["counters", "tags"], defaultTags.length);
  
  // 标记为已初始化
  await kv.set(["system", "initialized"], true);
  
  console.log("✅ Default data inserted to Deno KV");
}