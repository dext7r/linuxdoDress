/**
 * 数据库初始化和管理
 * 使用 SQLite 作为数据存储
 */

import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

// 数据库路径
const DB_PATH = "./data/linuxdo_dress.db";

let db: DB | null = null;

/**
 * 初始化数据库连接
 */
export function initDB(): DB {
  if (db) {
    return db;
  }

  try {
    // 确保数据目录存在
    Deno.mkdirSync("./data", { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }

  db = new DB(DB_PATH);
  
  // 启用外键约束
  db.execute("PRAGMA foreign_keys = ON");
  
  createTables();
  return db;
}

/**
 * 获取数据库实例
 */
export function getDB(): DB {
  if (!db) {
    return initDB();
  }
  return db;
}

/**
 * 关闭数据库连接
 */
export function closeDB(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * 创建数据表
 */
function createTables(): void {
  const db = getDB();
  
  // 创建作者表
  db.execute(`
    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT,
      avatar TEXT,
      profile_url TEXT,
      trust_level INTEGER DEFAULT 0,
      badge_count INTEGER DEFAULT 0,
      is_staff BOOLEAN DEFAULT FALSE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建分类表
  db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      color TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建标签表
  db.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建帖子表
  db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      raw_content TEXT,
      excerpt TEXT,
      
      source_url TEXT UNIQUE NOT NULL,
      source_id TEXT,
      source_platform TEXT NOT NULL DEFAULT 'linux.do',
      
      author_id INTEGER NOT NULL,
      category_id INTEGER,
      
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      replies INTEGER DEFAULT 0,
      score REAL DEFAULT 0,
      last_activity TEXT,
      
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      published_at TEXT,
      source_created_at TEXT,
      
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'pending_approval', 'published', 'hidden', 'deleted', 'rejected')),
      featured BOOLEAN DEFAULT FALSE,
      approved BOOLEAN DEFAULT FALSE,
      
      collected_at TEXT,
      collector_version TEXT,
      processing_notes TEXT,
      
      FOREIGN KEY (author_id) REFERENCES authors (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  // 创建帖子图片表
  db.execute(`
    CREATE TABLE IF NOT EXISTS post_images (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      alt TEXT,
      width INTEGER,
      height INTEGER,
      size INTEGER,
      original_url TEXT,
      local_path TEXT,
      is_featured BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
    )
  `);

  // 创建帖子标签关联表
  db.execute(`
    CREATE TABLE IF NOT EXISTS post_tags (
      post_id TEXT NOT NULL,
      tag_id INTEGER NOT NULL,
      
      PRIMARY KEY (post_id, tag_id),
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
    )
  `);

  // 创建采集任务表
  db.execute(`
    CREATE TABLE IF NOT EXISTS collection_tasks (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
      progress INTEGER DEFAULT 0,
      error TEXT,
      result_post_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (result_post_id) REFERENCES posts (id)
    )
  `);

  // 创建索引
  createIndexes();
  
  console.log("✅ Database tables created successfully");
}

/**
 * 创建数据库索引
 */
function createIndexes(): void {
  const db = getDB();
  
  // 帖子相关索引
  db.execute("CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts (featured)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts (category_id)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts (published_at)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_posts_views ON posts (views)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts (likes)");
  
  // 图片相关索引
  db.execute("CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON post_images (post_id)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_post_images_featured ON post_images (is_featured)");
  
  // 标签相关索引
  db.execute("CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags (post_id)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags (tag_id)");
  
  // 任务相关索引
  db.execute("CREATE INDEX IF NOT EXISTS idx_collection_tasks_status ON collection_tasks (status)");
  db.execute("CREATE INDEX IF NOT EXISTS idx_collection_tasks_created_at ON collection_tasks (created_at)");
}

/**
 * 插入默认数据
 */
export function insertDefaultData(): void {
  const db = getDB();
  
  // 插入默认分类
  const defaultCategories = [
    { name: "女装分享", slug: "nvzhuang-fenxiang", color: "#e91e63", description: "女装照片分享" },
    { name: "妆容教程", slug: "zhuangrong-jiaocheng", color: "#9c27b0", description: "化妆教程和技巧" },
    { name: "穿搭指南", slug: "chuanda-zhinan", color: "#673ab7", description: "服装搭配建议" },
    { name: "购物推荐", slug: "gouwu-tuijian", color: "#3f51b5", description: "好物推荐" },
    { name: "经验交流", slug: "jingyan-jiaoliu", color: "#2196f3", description: "经验分享" }
  ];
  
  for (const category of defaultCategories) {
    try {
      db.query(
        "INSERT OR IGNORE INTO categories (name, slug, color, description) VALUES (?, ?, ?, ?)",
        [category.name, category.slug, category.color, category.description]
      );
    } catch (error) {
      console.warn(`Failed to insert category ${category.name}:`, error);
    }
  }
  
  // 插入默认标签
  const defaultTags = [
    "女装", "自拍", "OOTD", "化妆", "护肤", "发型", "美甲", "配饰", 
    "连衣裙", "半身裙", "上衣", "裤装", "鞋子", "包包", "首饰",
    "日系", "韩系", "欧美", "森系", "甜美", "帅气", "优雅", "可爱"
  ];
  
  for (const tagName of defaultTags) {
    try {
      db.query("INSERT OR IGNORE INTO tags (name) VALUES (?)", [tagName]);
    } catch (error) {
      console.warn(`Failed to insert tag ${tagName}:`, error);
    }
  }
  
  console.log("✅ Default data inserted successfully");
}