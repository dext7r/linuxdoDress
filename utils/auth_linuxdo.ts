/**
 * Linux.do OAuth 认证工具
 */

// Linux.do OAuth 配置 - 根据测试结果更新
export const LINUXDO_OAUTH_CONFIG = {
  clientId: Deno.env.get("LINUXDO_CLIENT_ID") || "",
  clientSecret: Deno.env.get("LINUXDO_CLIENT_SECRET") || "",
  redirectUri: `${Deno.env.get("APP_BASE_URL") || "http://localhost:8000"}/api/auth/callback`,
  scope: "user",
  authorizeUrl: "https://connect.linux.do/oauth2/authorize",
  tokenUrl: "https://connect.linux.do/oauth2/token",
  userApiUrl: "https://connect.linux.do/api/user", // 正确的端点
};

// JWT 配置保持不变
export const JWT_CONFIG = {
  secret: Deno.env.get("JWT_SECRET") || "default_secret_key",
  expiresIn: parseInt(Deno.env.get("SESSION_EXPIRE_TIME") || "86400"), // 24小时
};

// Linux.do 用户信息接口（更新为实际返回的数据结构）
export interface LinuxDoUser {
  id: number;
  sub?: string;
  username: string;
  login?: string;
  name: string;
  email?: string;
  avatar_template?: string;
  avatar_url: string;
  active?: boolean;
  trust_level: number;
  badge_count: number;
  moderator: boolean;
  admin: boolean;
  silenced?: boolean;
  email_verified: boolean;
  external_ids?: any;
  api_key?: string;
}

// 应用用户信息接口（更新）
export interface AppUser {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  avatar: string;
  profileUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  trustLevel: number;
  badgeCount: number;
  isStaff: boolean;
  isAdmin: boolean;
  joinedAt: string;
  lastLoginAt: string;
}

/**
 * 生成 Linux.do OAuth 授权 URL
 */
export function generateLinuxDoAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: LINUXDO_OAUTH_CONFIG.clientId,
    redirect_uri: LINUXDO_OAUTH_CONFIG.redirectUri,
    scope: LINUXDO_OAUTH_CONFIG.scope,
    response_type: "code",
    state: state || crypto.randomUUID(),
  });

  return `${LINUXDO_OAUTH_CONFIG.authorizeUrl}?${params.toString()}`;
}

/**
 * 使用授权码获取访问令牌 - 根据官方文档更新
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to exchange code for token (attempt ${attempt}/${maxRetries})`);
      
      // 根据官方文档，使用 POST 表单提交而不是 Basic Auth
      const response = await fetch(LINUXDO_OAUTH_CONFIG.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "User-Agent": "LinuxDo-Dress/1.0",
        },
        body: new URLSearchParams({
          client_id: LINUXDO_OAUTH_CONFIG.clientId,
          client_secret: LINUXDO_OAUTH_CONFIG.clientSecret,
          code,
          redirect_uri: LINUXDO_OAUTH_CONFIG.redirectUri,
          grant_type: "authorization_code",
        }),
        // 增加超时时间
        signal: AbortSignal.timeout(15000), // 15 秒超时
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Linux.do OAuth error: ${data.error_description || data.error}`);
      }

      if (!data.access_token) {
        throw new Error("No access token in response");
      }

      console.log("Successfully obtained access token");
      return data.access_token;

    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      // 如果是连接错误且还有重试次数，则等待后重试
      if (attempt < maxRetries && (
        error.message.includes("Connection reset by peer") ||
        error.message.includes("Connection refused") ||
        error.message.includes("timeout") ||
        error.message.includes("network") ||
        error.message.includes("ECONNRESET")
      )) {
        const delay = Math.pow(2, attempt) * 1000; // 指数退避
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // 如果不是网络错误或者已达到最大重试次数，直接抛出错误
      break;
    }
  }

  // 如果所有重试都失败了，抛出最后一个错误
  throw new Error(`Failed to exchange code for token after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * 使用访问令牌获取用户信息
 */
export async function fetchLinuxDoUser(accessToken: string): Promise<LinuxDoUser> {
  console.log(`Fetching user info from: ${LINUXDO_OAUTH_CONFIG.userApiUrl}`);
  
  const response = await fetch(LINUXDO_OAUTH_CONFIG.userApiUrl, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json",
      "User-Agent": "LinuxDo-Dress/1.0",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const userData = await response.json();
  console.log("Linux.do user data:", userData);

  // 根据实际返回的数据结构进行映射
  return {
    id: userData.id,
    username: userData.username,
    name: userData.name,
    avatar_url: userData.avatar_url,
    trust_level: userData.trust_level || 0,
    badge_count: 0, // API 没有返回 badge_count，设为默认值
    moderator: false, // API 没有返回 moderator 信息，设为默认值
    admin: false, // API 没有返回 admin 信息，设为默认值
    email_verified: userData.active || false, // 使用 active 状态
    // 额外字段供后续使用
    email: userData.email,
    login: userData.login,
    sub: userData.sub,
    avatar_template: userData.avatar_template,
    silenced: userData.silenced,
    api_key: userData.api_key,
  };
}

/**
 * 转换 Linux.do 用户信息为应用用户信息
 */
export function transformLinuxDoUser(linuxdoUser: LinuxDoUser): AppUser {
  return {
    id: linuxdoUser.id,
    username: linuxdoUser.username,
    name: linuxdoUser.name || linuxdoUser.username,
    email: linuxdoUser.email || null,
    avatar: linuxdoUser.avatar_url,
    profileUrl: `https://linux.do/u/${linuxdoUser.username}`,
    bio: null, // Linux.do API 不提供个人简介
    location: null, // Linux.do API 不提供位置信息
    company: null, // Linux.do API 不提供公司信息
    website: null, // Linux.do API 不提供网站信息
    trustLevel: linuxdoUser.trust_level,
    badgeCount: linuxdoUser.badge_count,
    isStaff: linuxdoUser.moderator || linuxdoUser.admin,
    isAdmin: linuxdoUser.admin,
    joinedAt: new Date().toISOString(), // Linux.do API 不提供注册时间，使用当前时间
    lastLoginAt: new Date().toISOString(),
  };
}

/**
 * 验证 OAuth 配置是否完整
 */
export function validateOAuthConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!LINUXDO_OAUTH_CONFIG.clientId) {
    errors.push("LINUXDO_CLIENT_ID is required");
  }

  if (!LINUXDO_OAUTH_CONFIG.clientSecret) {
    errors.push("LINUXDO_CLIENT_SECRET is required");
  }

  if (!JWT_CONFIG.secret || JWT_CONFIG.secret === "default_secret_key") {
    errors.push("JWT_SECRET should be set to a secure random string");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// 保留 GitHub 相关函数以备后用或兼容性
export {
  generateGitHubAuthUrl,
  exchangeCodeForToken as exchangeGitHubCodeForToken,
  fetchGitHubUser,
  transformGitHubUser,
} from "./auth_github.ts";