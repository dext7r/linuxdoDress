/**
 * GitHub OAuth 认证工具 (保留备用)
 */

// GitHub OAuth 配置
export const GITHUB_OAUTH_CONFIG = {
  clientId: Deno.env.get("GITHUB_CLIENT_ID") || "",
  clientSecret: Deno.env.get("GITHUB_CLIENT_SECRET") || "",
  redirectUri: `${Deno.env.get("APP_BASE_URL") || "http://localhost:8000"}/api/auth/github/callback`,
  scope: "user:email",
  authorizeUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  userApiUrl: "https://api.github.com/user",
};

// GitHub 用户信息接口
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

/**
 * 生成 GitHub OAuth 授权 URL
 */
export function generateGitHubAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH_CONFIG.clientId,
    redirect_uri: GITHUB_OAUTH_CONFIG.redirectUri,
    scope: GITHUB_OAUTH_CONFIG.scope,
    state: state || crypto.randomUUID(),
  });

  return `${GITHUB_OAUTH_CONFIG.authorizeUrl}?${params.toString()}`;
}

/**
 * 使用授权码获取访问令牌
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch(GITHUB_OAUTH_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GITHUB_OAUTH_CONFIG.clientId,
      client_secret: GITHUB_OAUTH_CONFIG.clientSecret,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

/**
 * 使用访问令牌获取用户信息
 */
export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch(GITHUB_OAUTH_CONFIG.userApiUrl, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Yunyuan-Template",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * 转换 GitHub 用户信息为应用用户信息
 */
export function transformGitHubUser(githubUser: GitHubUser) {
  return {
    id: githubUser.id,
    username: githubUser.login,
    name: githubUser.name,
    email: githubUser.email,
    avatar: githubUser.avatar_url,
    profileUrl: githubUser.html_url,
    bio: githubUser.bio,
    location: githubUser.location,
    company: githubUser.company,
    website: githubUser.blog,
    publicRepos: githubUser.public_repos,
    followers: githubUser.followers,
    following: githubUser.following,
    joinedAt: githubUser.created_at,
    lastLoginAt: new Date().toISOString(),
  };
}