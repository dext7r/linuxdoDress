/**
 * 管理员配置
 */

// 管理员用户名列表
export const ADMIN_USERNAMES = [
  'dext7r',
  // 可以在这里添加更多管理员用户名
];

// 管理员用户ID列表（用于向后兼容）
export const ADMIN_USER_IDS = [
  53887,  // dext7r
  // 可以在这里添加更多管理员用户ID
];

/**
 * 检查用户是否为管理员
 */
export function isAdmin(user: { id?: number; username?: string }): boolean {
  if (user.username && ADMIN_USERNAMES.includes(user.username)) {
    return true;
  }
  
  if (user.id && ADMIN_USER_IDS.includes(user.id)) {
    return true;
  }
  
  return false;
}

/**
 * 获取管理员权限级别
 */
export function getAdminLevel(user: { id?: number; username?: string }): 'none' | 'admin' | 'super_admin' {
  if (!isAdmin(user)) {
    return 'none';
  }
  
  // 目前所有管理员都是同级别，后续可以扩展
  return 'admin';
}