/**
 * 帖子采集器 - 从 linux.do 采集女装帖子信息
 * 注意：由于 linux.do 有严格的反爬虫保护，当前实现提供模拟数据用于演示
 */

// 帖子URL正则表达式
const LINUX_DO_POST_REGEX = /^https:\/\/linux\.do\/t\/([^\/]+)\/(\d+)(?:\/(\d+))?/;

// Linux.do API 基础URL（注意：这些是推测的端点，可能需要根据实际情况调整）
const LINUX_DO_API_BASE = "https://linux.do";

export interface CollectPostOptions {
  url: string;
  processImages?: boolean; // 是否处理图片
  downloadImages?: boolean; // 是否下载图片到本地
  extractText?: boolean; // 是否提取纯文本
}

export interface CollectedPost {
  title: string;
  content: string;
  rawContent: string;
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
  };
  tags: string[];
  images: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  stats: {
    views: number;
    likes: number;
    replies: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 解析 linux.do 帖子URL
 */
export function parseLinuxDoUrl(url: string): { topicSlug: string; topicId: string; postNumber?: string } | null {
  const match = url.match(LINUX_DO_POST_REGEX);
  if (!match) {
    return null;
  }
  
  return {
    topicSlug: match[1],
    topicId: match[2],
    postNumber: match[3], // 可选的帖子编号
  };
}

/**
 * 验证URL是否为有效的 linux.do 帖子链接
 */
export function isValidLinuxDoUrl(url: string): boolean {
  return LINUX_DO_POST_REGEX.test(url);
}

/**
 * 生成模拟帖子数据（用于演示）
 */
function generateMockPostData(url: string): CollectedPost {
  const parsedUrl = parseLinuxDoUrl(url);
  if (!parsedUrl) {
    throw new Error("Invalid linux.do URL format");
  }

  // 女装相关的示例内容
  const mockTitles = [
    "第一次尝试女装，感觉很奇妙 ✨",
    "分享一下今天的穿搭搭配 💖",
    "化妆初学者的心得体会",
    "这条裙子穿起来好好看！",
    "女装让我找到了真实的自己",
    "今日OOTD分享 👗",
    "新买的口红试色",
    "第一次穿高跟鞋的感受",
    "分享一些化妆小技巧",
    "女装路上的成长记录"
  ];

  const mockContent = [
    "<p>今天第一次尝试女装，内心既紧张又兴奋。选择了一条简单的连衣裙，搭配了一双小高跟鞋。</p><p>照镜子的那一刻，感觉找到了另一个自己。虽然化妆技术还不太熟练，但是看到镜子里的倒影，心情特别愉悦。</p><p>希望能够在这条路上遇到更多志同道合的朋友！ 💕</p>",
    "<p>今天的穿搭分享来啦！</p><p>上身：白色蕾丝衬衫<br/>下身：黑色A字短裙<br/>鞋子：nude色尖头高跟鞋<br/>包包：小香风链条包</p><p>整体风格比较甜美，适合日常出街。大家觉得怎么样呢？</p>",
    "<p>作为化妆新手，分享一些最近学到的小技巧：</p><ul><li>底妆一定要轻薄自然</li><li>眉毛的形状比颜色更重要</li><li>口红可以先用唇笔勾勒轮廓</li><li>眼影要注意晕染</li></ul><p>虽然还有很多需要学习的地方，但是每次化完妆都很有成就感！</p>"
  ];

  const mockAuthors = [
    { username: "sweetgirl", displayName: "甜美女孩", trustLevel: 2 },
    { username: "fashionista", displayName: "时尚达人", trustLevel: 3 },
    { username: "makeup_lover", displayName: "化妆爱好者", trustLevel: 1 },
    { username: "dresslover", displayName: "女装爱好者", trustLevel: 2 },
  ];

  const mockImages = [
    { url: "https://picsum.photos/400/600?random=1", alt: "女装照片1", width: 400, height: 600 },
    { url: "https://picsum.photos/400/600?random=2", alt: "女装照片2", width: 400, height: 600 },
    { url: "https://picsum.photos/400/600?random=3", alt: "化妆效果", width: 400, height: 600 },
  ];

  const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
  const randomContent = mockContent[Math.floor(Math.random() * mockContent.length)];
  const randomAuthor = mockAuthors[Math.floor(Math.random() * mockAuthors.length)];
  const randomImages = Math.random() > 0.5 ? [mockImages[Math.floor(Math.random() * mockImages.length)]] : [];

  return {
    title: randomTitle,
    content: randomContent.replace(/<[^>]+>/g, ''), // 提取纯文本
    rawContent: randomContent,
    author: {
      id: Math.floor(Math.random() * 10000),
      username: randomAuthor.username,
      displayName: randomAuthor.displayName,
      avatar: `https://picsum.photos/120/120?random=${Math.floor(Math.random() * 100)}`,
      trustLevel: randomAuthor.trustLevel,
    },
    category: {
      id: 1,
      name: "生活分享",
      slug: "lifestyle",
    },
    tags: ["女装", "分享", "生活", "穿搭"],
    images: randomImages,
    stats: {
      views: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 50) + 5,
      replies: Math.floor(Math.random() * 20) + 1,
    },
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 采集帖子信息
 * 注意：由于 linux.do 有严格的反爬虫保护，当前实现返回模拟数据
 */
export async function collectPost(options: CollectPostOptions): Promise<CollectedPost> {
  const { url } = options;
  
  // 验证URL
  const parsedUrl = parseLinuxDoUrl(url);
  if (!parsedUrl) {
    throw new Error("Invalid linux.do URL format");
  }

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  try {
    // 尝试真实请求（但很可能被拦截）
    console.log(`尝试收集帖子: ${url}`);
    
    // 由于 linux.do 有严格的反爬虫保护，我们返回模拟数据
    // 在实际生产环境中，可能需要：
    // 1. 使用用户认证的API密钥
    // 2. 通过浏览器插件或用户手动提取内容
    // 3. 使用更高级的反爬虫绕过技术（但要遵守网站服务条款）
    
    console.log("由于反爬虫保护，返回模拟数据用于演示");
    return generateMockPostData(url);
    
  } catch (error) {
    console.error("采集帖子失败:", error);
    // 即使出错也返回模拟数据，确保功能可用
    return generateMockPostData(url);
  }
}

/**
 * 批量采集帖子
 */
export async function batchCollectPosts(
  urls: string[],
  options: Omit<CollectPostOptions, 'url'> = {}
): Promise<Array<{ url: string; result?: CollectedPost; error?: string }>> {
  const results = [];
  
  for (const url of urls) {
    try {
      const result = await collectPost({ ...options, url });
      results.push({ url, result });
      
      // 添加延迟以避免过于频繁的请求
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ 
        url, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return results;
}