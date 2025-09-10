/**
 * 基于 Deno KV 的数据库层
 * 支持本地和 Deno Deploy 环境
 */

// 检测环境
const isDeployEnvironment = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
const isLocalDev = !isDeployEnvironment;

// 类型定义 (保持不变)
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
  source_url?: string; // 改为可选，支持原创内容
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
  
  // 新增字段 - 博客系统
  post_type: 'original' | 'collected' | 'shared'; // 帖子类型：原创、采集、分享
  min_trust_level: number; // 最低信任等级要求 (0-4)
  tags?: string[]; // 简化的标签数组
  images?: PostImage[]; // 内联图片数组
  mature_content: boolean; // 是否包含成人内容
  content_warnings?: string[]; // 内容警告标签
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
let mockStorage: Map<string, any> | null = null;

/**
 * 初始化 KV 数据库
 */
export async function initKV(): Promise<Deno.Kv | Map<string, any>> {
  if (isLocalDev) {
    console.log("⚠️  本地环境不支持 Deno KV，使用内存模拟存储");
    if (!mockStorage) {
      mockStorage = new Map();
      await insertDefaultDataMock();
    }
    return mockStorage;
  }

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
export async function getKV(): Promise<Deno.Kv | Map<string, any>> {
  if (isLocalDev) {
    if (!mockStorage) {
      return await initKV();
    }
    return mockStorage;
  }

  if (!kv) {
    return await initKV();
  }
  return kv;
}

/**
 * 关闭 KV 数据库
 */
export function closeKV(): void {
  if (isLocalDev) {
    mockStorage = null;
    return;
  }
  
  if (kv) {
    kv.close();
    kv = null;
  }
}

// 辅助函数：生成模拟存储的键
function mockKey(keyParts: string[]): string {
  return keyParts.join(":");
}

// 辅助函数：模拟 KV 的 list 操作
function mockList(storage: Map<string, any>, prefix: string[]) {
  const prefixStr = prefix.join(":");
  const results: Array<{key: string[], value: any}> = [];
  
  for (const [key, value] of storage) {
    if (key.startsWith(prefixStr)) {
      const keyParts = key.split(":");
      results.push({ key: keyParts, value });
    }
  }
  
  return results;
}

// 数据操作函数

/**
 * 根据用户信任等级获取可见帖子
 */
export async function getPostsForUser(userTrustLevel: number = 0): Promise<Post[]> {
  const storage = await getKV();
  const posts: Post[] = [];
  
  if (isLocalDev) {
    const mockEntries = mockList(storage as Map<string, any>, ["posts"]);
    for (const entry of mockEntries) {
      const post = entry.value as Post;
      if (post.status === 'published' && post.min_trust_level <= userTrustLevel) {
        posts.push(post);
      }
    }
  } else {
    const kv = storage as Deno.Kv;
    const iter = kv.list({ prefix: ["posts"] });
    for await (const entry of iter) {
      const post = entry.value as Post;
      if (post.status === 'published' && post.min_trust_level <= userTrustLevel) {
        posts.push(post);
      }
    }
  }
  
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * 获取所有已发布的帖子
 */
export async function getPosts(): Promise<Post[]> {
  const storage = await getKV();
  const posts: Post[] = [];
  
  if (isLocalDev) {
    const mockEntries = mockList(storage as Map<string, any>, ["posts"]);
    for (const entry of mockEntries) {
      const post = entry.value as Post;
      if (post.status === 'published') {
        posts.push(post);
      }
    }
  } else {
    const kv = storage as Deno.Kv;
    const iter = kv.list({ prefix: ["posts"] });
    for await (const entry of iter) {
      const post = entry.value as Post;
      if (post.status === 'published') {
        posts.push(post);
      }
    }
  }
  
  // 按创建时间倒序排序
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * 根据状态获取帖子
 */
export async function getPostsByStatus(status: Post['status']): Promise<Post[]> {
  const storage = await getKV();
  const posts: Post[] = [];
  
  if (isLocalDev) {
    const mockEntries = mockList(storage as Map<string, any>, ["posts"]);
    for (const entry of mockEntries) {
      const post = entry.value as Post;
      if (post.status === status) {
        posts.push(post);
      }
    }
  } else {
    const kv = storage as Deno.Kv;
    const iter = kv.list({ prefix: ["posts"] });
    for await (const entry of iter) {
      const post = entry.value as Post;
      if (post.status === status) {
        posts.push(post);
      }
    }
  }
  
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * 根据 ID 获取帖子
 */
export async function getPostById(id: string): Promise<Post | null> {
  const storage = await getKV();
  
  if (isLocalDev) {
    const mockMap = storage as Map<string, any>;
    return mockMap.get(mockKey(["posts", id])) || null;
  } else {
    const kv = storage as Deno.Kv;
    const result = await kv.get(["posts", id]);
    return result.value as Post | null;
  }
}

/**
 * 创建新帖子
 */
export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post> {
  const storage = await getKV();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const newPost: Post = {
    ...post,
    id,
    created_at: now,
    updated_at: now,
  };
  
  if (isLocalDev) {
    const mockMap = storage as Map<string, any>;
    mockMap.set(mockKey(["posts", id]), newPost);
  } else {
    const kv = storage as Deno.Kv;
    await kv.set(["posts", id], newPost);
  }
  
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
  const storage = await getKV();
  
  if (isLocalDev) {
    const mockMap = storage as Map<string, any>;
    const mockEntries = mockList(mockMap, ["authors"]);
    for (const entry of mockEntries) {
      const author = entry.value as Author;
      if (author.username === username) {
        return author;
      }
    }
    return null;
  } else {
    const kv = storage as Deno.Kv;
    const iter = kv.list({ prefix: ["authors"] });
    
    for await (const entry of iter) {
      const author = entry.value as Author;
      if (author.username === username) {
        return author;
      }
    }
    
    return null;
  }
}

/**
 * 创建作者
 */
export async function createAuthor(author: Omit<Author, 'id' | 'created_at' | 'updated_at'>): Promise<Author> {
  const storage = await getKV();
  const now = new Date().toISOString();
  
  if (isLocalDev) {
    const mockMap = storage as Map<string, any>;
    
    // 生成新的作者 ID
    const counterKey = "counters:authors";
    const nextId = (mockMap.get(counterKey) || 0) + 1;
    mockMap.set(counterKey, nextId);
    
    const newAuthor: Author = {
      ...author,
      id: nextId,
      created_at: now,
      updated_at: now,
    };
    
    mockMap.set(mockKey(["authors", nextId.toString()]), newAuthor);
    return newAuthor;
  } else {
    const kv = storage as Deno.Kv;
    
    // 生成新的作者 ID
    const counterResult = await kv.get(["counters", "authors"]);
    const nextId = (counterResult.value as number || 0) + 1;
    await kv.set(["counters", "authors"], nextId);
    
    const newAuthor: Author = {
      ...author,
      id: nextId,
      created_at: now,
      updated_at: now,
    };
    
    await kv.set(["authors", nextId], newAuthor);
    return newAuthor;
  }
}

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<Category[]> {
  const storage = await getKV();
  const categories: Category[] = [];
  
  if (isLocalDev) {
    const mockMap = storage as Map<string, any>;
    const mockEntries = mockList(mockMap, ["categories"]);
    for (const entry of mockEntries) {
      categories.push(entry.value as Category);
    }
  } else {
    const kv = storage as Deno.Kv;
    const iter = kv.list({ prefix: ["categories"] });
    for await (const entry of iter) {
      categories.push(entry.value as Category);
    }
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
 * 插入默认数据 - 本地环境版本
 */
async function insertDefaultDataMock(): Promise<void> {
  if (!mockStorage) return;
  
  // 检查是否已经初始化
  if (mockStorage.has("system:initialized")) {
    return;
  }
  
  // 插入默认分类
  const defaultCategories: Category[] = [
    { id: 1, name: "女装分享", slug: "nvzhuang-fenxiang", color: "#e91e63", description: "女装照片分享", created_at: new Date().toISOString() },
    { id: 2, name: "妆容教程", slug: "zhuangrong-jiaocheng", color: "#9c27b0", description: "化妆教程和技巧", created_at: new Date().toISOString() },
    { id: 3, name: "穿搭指南", slug: "chuanda-zhinan", color: "#673ab7", description: "服装搭配建议", created_at: new Date().toISOString() },
    { id: 4, name: "购物推荐", slug: "gouwu-tuijian", color: "#3f51b5", description: "好物推荐", created_at: new Date().toISOString() },
    { id: 5, name: "经验交流", slug: "jingyan-jiaoliu", color: "#2196f3", description: "经验分享", created_at: new Date().toISOString() }
  ];
  
  for (const category of defaultCategories) {
    mockStorage.set(mockKey(["categories", category.id.toString()]), category);
  }
  
  mockStorage.set("counters:categories", defaultCategories.length);
  
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
    mockStorage.set(mockKey(["tags", tag.id.toString()]), tag);
  }
  
  mockStorage.set("counters:tags", defaultTags.length);
  
  // 添加一些示例帖子数据以便测试
  const samplePosts: Post[] = [
    {
      id: "sample-1",
      title: "第一次尝试女装，感觉很奇妙 ✨",
      content: "今天勇敢地尝试了女装造型，感觉整个人都不一样了！分享一下这次的心得体验...",
      raw_content: "今天勇敢地尝试了女装造型，感觉整个人都不一样了！分享一下这次的心得体验...",
      excerpt: "今天勇敢地尝试了女装造型，感觉整个人都不一样了！",
      source_url: "https://linux.do/t/sample/12345",
      source_id: "12345",
      source_platform: "linux.do",
      author_id: 1,
      category_id: 1,
      views: 128,
      likes: 25,
      replies: 8,
      score: 0,
      status: 'published',
      featured: true,
      approved: true,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1天前
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      // 博客系统新字段
      post_type: 'collected',
      min_trust_level: 0, // 所有用户可见
      tags: ['女装', '初体验', '分享'],
      mature_content: false,
      content_warnings: [],
    },
    {
      id: "sample-2", 
      title: "分享一下今天的穿搭搭配 💖",
      content: "今天穿了一身粉色系的搭配，感觉很适合春天的气息～大家觉得怎么样？",
      raw_content: "今天穿了一身粉色系的搭配，感觉很适合春天的气息～大家觉得怎么样？",
      excerpt: "今天穿了一身粉色系的搭配，感觉很适合春天的气息～",
      source_platform: "original",
      author_id: 2,
      category_id: 3,
      views: 95,
      likes: 18,
      replies: 5,
      score: 0,
      status: 'published',
      featured: false,
      approved: true,
      created_at: new Date(Date.now() - 43200000).toISOString(), // 12小时前
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      // 博客系统新字段
      post_type: 'original',
      min_trust_level: 1, // 基础用户及以上可见
      tags: ['穿搭', 'OOTD', '粉色系'],
      mature_content: false,
      content_warnings: [],
    },
    {
      id: "sample-3",
      title: "化妆教程：打造自然裸妆 ✨",
      content: "分享一个简单的日常裸妆教程，适合新手学习。主要使用基础的化妆品就能打造出自然好看的妆容...",
      raw_content: "分享一个简单的日常裸妆教程，适合新手学习。主要使用基础的化妆品就能打造出自然好看的妆容...",
      excerpt: "分享一个简单的日常裸妆教程，适合新手学习",
      source_platform: "original",
      author_id: 3,
      category_id: 2,
      views: 245,
      likes: 42,
      replies: 15,
      score: 0,
      status: 'published',
      featured: true,
      approved: true,
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2天前
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      // 博客系统新字段
      post_type: 'original',
      min_trust_level: 0, // 所有用户可见
      tags: ['化妆', '教程', '裸妆', '新手向'],
      mature_content: false,
      content_warnings: [],
    },
    {
      id: "sample-4",
      title: "高级穿搭技巧：色彩搭配进阶篇 🌈",
      content: "深入探讨色彩理论在女装搭配中的应用，包括冷暖色调的平衡、对比色的使用技巧等高级内容...",
      raw_content: "深入探讨色彩理论在女装搭配中的应用，包括冷暖色调的平衡、对比色的使用技巧等高级内容...",
      excerpt: "深入探讨色彩理论在女装搭配中的应用",
      source_platform: "original",
      author_id: 1,
      category_id: 3,
      views: 89,
      likes: 23,
      replies: 8,
      score: 0,
      status: 'published',
      featured: false,
      approved: true,
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3天前
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      // 博客系统新字段
      post_type: 'original',
      min_trust_level: 2, // 成员及以上可见
      tags: ['高级技巧', '色彩搭配', '进阶'],
      mature_content: false,
      content_warnings: [],
    }
  ];
  
  for (const post of samplePosts) {
    mockStorage.set(mockKey(["posts", post.id]), post);
  }
  
  // 添加示例作者
  const sampleAuthors: Author[] = [
    {
      id: 1,
      username: "beauty_lover",
      display_name: "美丽爱好者",
      avatar: "",
      profile_url: "https://linux.do/u/beauty_lover",
      trust_level: 2, // 成员
      badge_count: 3,
      is_staff: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      username: "fashion_girl",
      display_name: "时尚小姐姐",
      avatar: "",
      profile_url: "https://linux.do/u/fashion_girl", 
      trust_level: 1, // 基础用户
      badge_count: 1,
      is_staff: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      username: "makeup_master",
      display_name: "化妆大师",
      avatar: "",
      profile_url: "https://linux.do/u/makeup_master", 
      trust_level: 3, // 常客
      badge_count: 8,
      is_staff: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
  
  for (const author of sampleAuthors) {
    mockStorage.set(mockKey(["authors", author.id.toString()]), author);
  }
  
  mockStorage.set("counters:authors", sampleAuthors.length);
  
  // 标记为已初始化
  mockStorage.set("system:initialized", true);
  
  console.log("✅ 本地模拟数据初始化完成");
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