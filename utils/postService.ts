/**
 * 帖子管理服务 - 数据库操作
 */

import { getDB } from "./database.ts";
import type { Post, PostInput, PostFilter, PostsResponse, PostAuthor, PostImage, PostTag } from "../types/post.ts";
import type { CollectedPost } from "./postCollector.ts";

/**
 * 保存采集的帖子到数据库
 */
export async function saveCollectedPost(
  collectedPost: CollectedPost, 
  metadata: {
    collectorUserId: number;
    collectorUsername: string;
    sourceUrl: string;
    status?: 'pending_approval' | 'approved' | 'rejected';
  }
): Promise<string> {
  const db = getDB();
  const postId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  try {
    await db.transaction(() => {
      // 首先确保作者存在
      const authorId = ensureAuthorExists(collectedPost.author);
      
      // 确保分类存在
      let categoryId = null;
      if (collectedPost.category) {
        categoryId = ensureCategoryExists(collectedPost.category);
      }
      
      // 插入帖子
      db.query(`
        INSERT INTO posts (
          id, title, content, raw_content, source_url, source_id, 
          source_platform, author_id, category_id, views, likes, replies,
          created_at, updated_at, source_created_at, status, approved,
          collected_at, collector_version, processing_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        postId,
        collectedPost.title,
        collectedPost.content,
        collectedPost.rawContent,
        metadata.sourceUrl,
        metadata.sourceUrl.split('/').pop(), // 提取URL中的ID
        'linux.do',
        authorId,
        categoryId,
        collectedPost.stats.views,
        collectedPost.stats.likes,
        collectedPost.stats.replies,
        now,
        now,
        collectedPost.createdAt,
        metadata.status || 'pending_approval',
        false, // 默认未审核通过
        now,
        '1.0',
        `由用户 ${metadata.collectorUsername} (ID: ${metadata.collectorUserId}) 采集`
      ]);
      
      // 保存图片
      if (collectedPost.images && collectedPost.images.length > 0) {
        collectedPost.images.forEach((image, index) => {
          const imageId = crypto.randomUUID();
          db.query(`
            INSERT INTO post_images (
              id, post_id, url, alt, width, height, 
              original_url, sort_order, is_featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            imageId,
            postId,
            image.url,
            image.alt || '',
            image.width || null,
            image.height || null,
            image.url,
            index,
            index === 0 // 第一张图片设为特色图片
          ]);
        });
      }
      
      // 保存标签
      if (collectedPost.tags && collectedPost.tags.length > 0) {
        collectedPost.tags.forEach(tagName => {
          const tagId = ensureTagExists(tagName);
          // 避免重复关联
          try {
            db.query(`
              INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)
            `, [postId, tagId]);
          } catch (error) {
            // 忽略重复关联错误
            console.warn(`Duplicate tag association ignored: ${tagName}`);
          }
        });
      }
    });
    
    console.log(`✅ Post saved successfully: ${postId} - ${collectedPost.title}`);
    return postId;
  } catch (error) {
    console.error("Failed to save collected post:", error);
    throw new Error(`Failed to save collected post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 确保作者存在，如果不存在则创建
 */
function ensureAuthorExists(author: CollectedPost['author']): number {
  const db = getDB();
  
  // 尝试查找现有作者
  const existing = db.query(`
    SELECT id FROM authors WHERE username = ?
  `, [author.username]);
  
  if (existing.length > 0) {
    // 更新作者信息
    db.query(`
      UPDATE authors SET 
        display_name = ?, avatar = ?, trust_level = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE username = ?
    `, [
      author.displayName || author.username,
      author.avatar || '',
      author.trustLevel || 0,
      author.username
    ]);
    return (existing[0] as any).id;
  } else {
    // 创建新作者
    db.query(`
      INSERT INTO authors (
        id, username, display_name, avatar, profile_url, trust_level
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      author.id,
      author.username,
      author.displayName || author.username,
      author.avatar || '',
      `https://linux.do/u/${author.username}`,
      author.trustLevel || 0
    ]);
    return author.id;
  }
}

/**
 * 确保分类存在，如果不存在则创建
 */
function ensureCategoryExists(category: NonNullable<CollectedPost['category']>): number {
  const db = getDB();
  
  const existing = db.query(`
    SELECT id FROM categories WHERE slug = ?
  `, [category.slug]);
  
  if (existing.length > 0) {
    return (existing[0] as any).id;
  } else {
    const result = db.query(`
      INSERT INTO categories (name, slug) VALUES (?, ?)
    `, [category.name, category.slug]);
    return db.lastInsertRowId;
  }
}

/**
 * 确保标签存在，如果不存在则创建
 */
function ensureTagExists(tagName: string): number {
  const db = getDB();
  
  const existing = db.query(`
    SELECT id FROM tags WHERE name = ?
  `, [tagName]);
  
  if (existing.length > 0) {
    // 增加标签计数
    db.query(`
      UPDATE tags SET count = count + 1 WHERE id = ?
    `, [(existing[0] as any).id]);
    return (existing[0] as any).id;
  } else {
    const result = db.query(`
      INSERT INTO tags (name, count) VALUES (?, 1)
    `, [tagName]);
    return db.lastInsertRowId;
  }
}

/**
 * 创建新帖子
 */
export async function createPost(input: PostInput): Promise<string> {
  const db = getDB();
  const postId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  try {
    db.transaction(() => {
      // 插入帖子基本信息
      db.query(`
        INSERT INTO posts (
          id, title, content, source_url, status, featured, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        postId,
        input.title,
        input.content,
        input.sourceUrl,
        input.status || 'draft',
        input.featured || false,
        now,
        now
      ]);
      
      // 关联分类
      if (input.categoryId) {
        db.query(`
          UPDATE posts SET category_id = ? WHERE id = ?
        `, [input.categoryId, postId]);
      }
      
      // 关联标签
      if (input.tagIds && input.tagIds.length > 0) {
        for (const tagId of input.tagIds) {
          db.query(`
            INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)
          `, [postId, tagId]);
        }
      }
    });
    
    return postId;
  } catch (error) {
    throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 根据ID获取帖子
 */
export function getPostById(id: string): Post | null {
  const db = getDB();
  
  try {
    const postRow = db.query(`
      SELECT 
        p.*,
        a.username as author_username,
        a.display_name as author_display_name,
        a.avatar as author_avatar,
        a.trust_level as author_trust_level,
        a.badge_count as author_badge_count,
        a.is_staff as author_is_staff,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color
      FROM posts p
      LEFT JOIN authors a ON p.author_id = a.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (postRow.length === 0) {
      return null;
    }
    
    const row = postRow[0] as any;
    
    // 获取图片
    const images = getPostImages(id);
    
    // 获取标签
    const tags = getPostTags(id);
    
    return mapRowToPost(row, images, tags);
  } catch (error) {
    throw new Error(`Failed to get post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 获取帖子列表
 */
export function getPosts(filter: PostFilter = {}): PostsResponse {
  const db = getDB();
  
  const {
    status,
    category,
    tags,
    author,
    featured,
    dateFrom,
    dateTo,
    hasImages,
    sortBy = 'created_at',
    sortOrder = 'desc',
    limit = 20,
    offset = 0
  } = filter;
  
  try {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    // 构建查询条件
    if (status && status.length > 0) {
      whereClause += ` AND p.status IN (${status.map(() => '?').join(',')})`;
      params.push(...status);
    }
    
    if (category && category.length > 0) {
      whereClause += ` AND p.category_id IN (${category.map(() => '?').join(',')})`;
      params.push(...category);
    }
    
    if (author && author.length > 0) {
      whereClause += ` AND a.username IN (${author.map(() => '?').join(',')})`;
      params.push(...author);
    }
    
    if (featured !== undefined) {
      whereClause += ' AND p.featured = ?';
      params.push(featured);
    }
    
    if (dateFrom) {
      whereClause += ' AND p.created_at >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      whereClause += ' AND p.created_at <= ?';
      params.push(dateTo);
    }
    
    if (hasImages !== undefined) {
      if (hasImages) {
        whereClause += ' AND EXISTS (SELECT 1 FROM post_images WHERE post_id = p.id)';
      } else {
        whereClause += ' AND NOT EXISTS (SELECT 1 FROM post_images WHERE post_id = p.id)';
      }
    }
    
    // 标签过滤需要特殊处理
    let tagJoin = '';
    if (tags && tags.length > 0) {
      tagJoin = `
        INNER JOIN post_tags pt ON p.id = pt.post_id
        INNER JOIN tags t ON pt.tag_id = t.id
      `;
      whereClause += ` AND t.id IN (${tags.map(() => '?').join(',')})`;
      params.push(...tags);
    }
    
    const baseQuery = `
      FROM posts p
      LEFT JOIN authors a ON p.author_id = a.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${tagJoin}
      ${whereClause}
    `;
    
    // 获取总数
    const countResult = db.query(`SELECT COUNT(DISTINCT p.id) as total ${baseQuery}`, params);
    const total = (countResult[0] as any).total;
    
    // 获取数据
    const dataQuery = `
      SELECT DISTINCT
        p.*,
        a.username as author_username,
        a.display_name as author_display_name,
        a.avatar as author_avatar,
        a.trust_level as author_trust_level,
        a.badge_count as author_badge_count,
        a.is_staff as author_is_staff,
        c.name as category_name,
        c.slug as category_slug,
        c.color as category_color
      ${baseQuery}
      ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;
    
    const rows = db.query(dataQuery, [...params, limit, offset]);
    
    const posts = rows.map((row: any) => {
      const images = getPostImages(row.id);
      const postTags = getPostTags(row.id);
      return mapRowToPost(row, images, postTags);
    });
    
    const page = Math.floor(offset / limit) + 1;
    const hasNext = offset + limit < total;
    const hasPrevious = offset > 0;
    
    return {
      posts,
      total,
      page,
      pageSize: limit,
      hasNext,
      hasPrevious,
    };
  } catch (error) {
    throw new Error(`Failed to get posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 获取帖子的图片
 */
function getPostImages(postId: string): PostImage[] {
  const db = getDB();
  
  const rows = db.query(`
    SELECT * FROM post_images WHERE post_id = ? ORDER BY sort_order ASC
  `, [postId]);
  
  return rows.map((row: any) => ({
    id: row.id,
    url: row.url,
    thumbnailUrl: row.thumbnail_url,
    alt: row.alt,
    width: row.width,
    height: row.height,
    size: row.size,
    originalUrl: row.original_url,
    localPath: row.local_path,
  }));
}

/**
 * 获取帖子的标签
 */
function getPostTags(postId: string): PostTag[] {
  const db = getDB();
  
  const rows = db.query(`
    SELECT t.* FROM tags t
    INNER JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = ?
    ORDER BY t.name
  `, [postId]);
  
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    count: row.count,
  }));
}

/**
 * 将数据库行映射为Post对象
 */
function mapRowToPost(row: any, images: PostImage[], tags: PostTag[]): Post {
  const author: PostAuthor = {
    id: row.author_id,
    username: row.author_username,
    displayName: row.author_display_name,
    avatar: row.author_avatar,
    profileUrl: `https://linux.do/u/${row.author_username}`,
    trustLevel: row.author_trust_level,
    badgeCount: row.author_badge_count,
    isStaff: row.author_is_staff,
  };
  
  const category = row.category_name ? {
    id: row.category_id,
    name: row.category_name,
    slug: row.category_slug,
    color: row.category_color,
  } : undefined;
  
  const featuredImage = images.find(img => img.id === row.featured_image_id) || images[0];
  
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    rawContent: row.raw_content,
    excerpt: row.excerpt,
    sourceUrl: row.source_url,
    sourceId: row.source_id,
    sourcePlatform: row.source_platform as 'linux.do' | 'manual',
    author,
    category,
    tags,
    images,
    featuredImage,
    stats: {
      views: row.views,
      likes: row.likes,
      replies: row.replies,
      score: row.score,
      lastActivity: row.last_activity,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    sourceCreatedAt: row.source_created_at,
    status: row.status,
    featured: row.featured,
    approved: row.approved,
    metadata: {
      collectedAt: row.collected_at,
      collectorVersion: row.collector_version,
      processingNotes: row.processing_notes,
    },
  };
}

/**
 * 更新帖子
 */
export function updatePost(id: string, input: Partial<PostInput>): boolean {
  const db = getDB();
  const now = new Date().toISOString();
  
  try {
    const updates: string[] = [];
    const params: any[] = [];
    
    if (input.title !== undefined) {
      updates.push('title = ?');
      params.push(input.title);
    }
    
    if (input.content !== undefined) {
      updates.push('content = ?');
      params.push(input.content);
    }
    
    if (input.status !== undefined) {
      updates.push('status = ?');
      params.push(input.status);
    }
    
    if (input.featured !== undefined) {
      updates.push('featured = ?');
      params.push(input.featured);
    }
    
    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);
    
    const result = db.query(`
      UPDATE posts SET ${updates.join(', ')} WHERE id = ?
    `, params);
    
    return result.length > 0;
  } catch (error) {
    throw new Error(`Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 删除帖子
 */
export function deletePost(id: string): boolean {
  const db = getDB();
  
  try {
    const result = db.query('DELETE FROM posts WHERE id = ?', [id]);
    return result.length > 0;
  } catch (error) {
    throw new Error(`Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}