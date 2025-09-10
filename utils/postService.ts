/**
 * 帖子管理服务 - 基于 Deno KV
 */

import {
  getKV,
  createPost as kvCreatePost,
  updatePost as kvUpdatePost,
  deletePost as kvDeletePost,
  getPostById as kvGetPostById,
  getPosts as kvGetPosts,
  getPostsByStatus,
  createAuthor,
  getAuthorByUsername,
  addPostImage,
  type Post,
  type Author,
  type PostImage
} from "./database_kv.ts";
import type { PostInput, PostFilter, PostsResponse } from "../types/post.ts";
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
    status?: 'pending_approval' | 'published' | 'rejected';
  }
): Promise<string> {
  try {
    // 确保作者存在
    const author = await ensureAuthorExists(collectedPost.author);
    
    // 创建帖子
    const post = await kvCreatePost({
      title: collectedPost.title,
      content: collectedPost.content,
      raw_content: collectedPost.rawContent,
      excerpt: extractExcerpt(collectedPost.content),
      source_url: metadata.sourceUrl,
      source_id: metadata.sourceUrl.split('/').pop(),
      source_platform: 'linux.do',
      author_id: author.id,
      category_id: 1, // 默认分类
      views: collectedPost.stats.views,
      likes: collectedPost.stats.likes,
      replies: collectedPost.stats.replies,
      score: 0,
      status: metadata.status || 'pending_approval',
      featured: false,
      approved: false,
      collected_at: new Date().toISOString(),
      collector_version: '1.0',
      processing_notes: `由用户 ${metadata.collectorUsername} (ID: ${metadata.collectorUserId}) 采集`,
      source_created_at: collectedPost.createdAt,
    });

    // 保存图片
    if (collectedPost.images && collectedPost.images.length > 0) {
      for (let i = 0; i < collectedPost.images.length; i++) {
        const image = collectedPost.images[i];
        await addPostImage({
          post_id: post.id,
          url: image.url,
          thumbnail_url: image.url,
          alt: image.alt || '',
          width: image.width,
          height: image.height,
          original_url: image.url,
          is_featured: i === 0, // 第一张图片设为特色图片
          sort_order: i,
        });
      }
    }
    
    console.log(`✅ Post saved successfully: ${post.id} - ${collectedPost.title}`);
    return post.id;
  } catch (error) {
    console.error("Failed to save collected post:", error);
    throw new Error(`Failed to save collected post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 确保作者存在，如果不存在则创建
 */
async function ensureAuthorExists(authorData: CollectedPost['author']): Promise<Author> {
  // 尝试查找现有作者
  const existing = await getAuthorByUsername(authorData.username);
  
  if (existing) {
    return existing;
  } else {
    // 创建新作者
    return await createAuthor({
      username: authorData.username,
      display_name: authorData.displayName || authorData.username,
      avatar: authorData.avatar || '',
      profile_url: `https://linux.do/u/${authorData.username}`,
      trust_level: authorData.trustLevel || 0,
      badge_count: 0,
      is_staff: false,
    });
  }
}

/**
 * 提取摘要
 */
function extractExcerpt(content: string, maxLength = 200): string {
  // 移除HTML标签
  const text = content.replace(/<[^>]*>/g, '');
  // 截取前200个字符
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * 创建新帖子
 */
export async function createPost(input: PostInput): Promise<string> {
  try {
    const post = await kvCreatePost({
      title: input.title,
      content: input.content,
      raw_content: input.content,
      excerpt: extractExcerpt(input.content),
      source_url: input.sourceUrl,
      source_platform: 'manual',
      author_id: 1, // 默认作者，需要根据实际情况调整
      views: 0,
      likes: 0,
      replies: 0,
      score: 0,
      status: input.status || 'draft',
      featured: input.featured || false,
      approved: false,
    });
    
    return post.id;
  } catch (error) {
    throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 根据ID获取帖子
 */
export async function getPostById(id: string): Promise<Post | null> {
  try {
    return await kvGetPostById(id);
  } catch (error) {
    throw new Error(`Failed to get post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 获取帖子列表
 */
export async function getPosts(filter: PostFilter = {}): Promise<PostsResponse> {
  try {
    const posts = await kvGetPosts();
    
    // 简单过滤和分页 (在实际应用中可能需要更复杂的实现)
    let filteredPosts = posts;
    
    if (filter.status) {
      filteredPosts = filteredPosts.filter(post => 
        filter.status!.includes(post.status)
      );
    }
    
    if (filter.featured !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.featured === filter.featured);
    }
    
    const total = filteredPosts.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 20;
    const page = Math.floor(offset / limit) + 1;
    const hasNext = offset + limit < total;
    const hasPrevious = offset > 0;
    
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);
    
    return {
      posts: paginatedPosts.map(transformPostForAPI),
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
 * 转换Post对象为API格式
 */
function transformPostForAPI(post: Post): any {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    rawContent: post.raw_content,
    excerpt: post.excerpt,
    sourceUrl: post.source_url,
    sourceId: post.source_id,
    sourcePlatform: post.source_platform,
    author: {
      id: post.author_id,
      username: "unknown", // 需要从作者表获取，这里简化处理
      displayName: "Unknown User",
      avatar: "",
      profileUrl: "",
      trustLevel: 0,
      badgeCount: 0,
      isStaff: false,
    },
    category: undefined, // 需要从分类表获取
    tags: [], // 需要从标签表获取
    images: [], // 需要从图片表获取
    featuredImage: undefined,
    stats: {
      views: post.views,
      likes: post.likes,
      replies: post.replies,
      score: post.score,
      lastActivity: post.last_activity,
    },
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    publishedAt: post.published_at,
    sourceCreatedAt: post.source_created_at,
    status: post.status,
    featured: post.featured,
    approved: post.approved,
    metadata: {
      collectedAt: post.collected_at,
      collectorVersion: post.collector_version,
      processingNotes: post.processing_notes,
    },
  };
}

/**
 * 更新帖子
 */
export async function updatePost(id: string, input: Partial<PostInput>): Promise<boolean> {
  try {
    const result = await kvUpdatePost(id, {
      title: input.title,
      content: input.content,
      status: input.status,
      featured: input.featured,
    });
    return result !== null;
  } catch (error) {
    throw new Error(`Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 删除帖子
 */
export async function deletePost(id: string): Promise<boolean> {
  try {
    return await kvDeletePost(id);
  } catch (error) {
    throw new Error(`Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 获取待审核的帖子
 */
export async function getPendingPosts(): Promise<Post[]> {
  try {
    return await getPostsByStatus('pending_approval');
  } catch (error) {
    throw new Error(`Failed to get pending posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 批准帖子
 */
export async function approvePost(id: string): Promise<boolean> {
  try {
    const result = await kvUpdatePost(id, {
      status: 'published',
      approved: true,
      published_at: new Date().toISOString(),
    });
    return result !== null;
  } catch (error) {
    throw new Error(`Failed to approve post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 拒绝帖子
 */
export async function rejectPost(id: string): Promise<boolean> {
  try {
    const result = await kvUpdatePost(id, {
      status: 'rejected',
      approved: false,
    });
    return result !== null;
  } catch (error) {
    throw new Error(`Failed to reject post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}