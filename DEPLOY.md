# Linux.do 女装展示系统部署指南

## 🚀 快速部署到 Deno Deploy

### 1. 准备工作

#### 1.1 获取 Linux.do OAuth 应用
1. 访问 [Linux.do Connect 控制台](https://connect.linux.do/dash/sso/new)
2. 创建新的 SSO 应用
3. 获取 `Client ID` 和 `Client Secret`
4. 设置回调URL：`https://linuxdodress.deno.dev/api/auth/callback`

#### 1.2 Fork 项目
1. Fork 本项目到你的 GitHub 账户
2. 克隆到本地进行开发（可选）

### 2. Deno Deploy 部署

#### 2.1 创建项目
1. 访问 [Deno Deploy](https://deno.com/deploy)
2. 连接你的 GitHub 账户
3. 选择 fork 的项目仓库
4. 设置项目名称（如：`linuxdo-dress`）

#### 2.2 配置环境变量
在 Deno Deploy 项目设置中添加以下环境变量：

```bash
# 必需的环境变量
LINUXDO_CLIENT_ID=你的_linux_do_client_id
LINUXDO_CLIENT_SECRET=你的_linux_do_client_secret
APP_BASE_URL=https://linuxdodress.deno.dev
JWT_SECRET=至少32位的安全密钥
SESSION_EXPIRE_TIME=86400

# 可选的环境变量
NODE_ENV=production
DATABASE_PATH=./data/linuxdo_dress.db
```

#### 2.3 部署设置
- **Entry Point**: `main.ts`
- **Build Step**: `deno task build` (自动执行)
- **Branch**: `main`

### 3. GitHub Actions 自动部署

项目已配置 GitHub Actions，每次推送到 `main` 分支时会自动部署。

需要在 GitHub 项目的 Settings -> Secrets 中添加：

```bash
LINUXDO_CLIENT_ID=你的_client_id
LINUXDO_CLIENT_SECRET=你的_client_secret
APP_BASE_URL=https://linuxdodress.deno.dev
JWT_SECRET=你的_jwt_密钥
SESSION_EXPIRE_TIME=86400
```

### 4. 本地开发

#### 4.1 环境准备
```bash
# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件，填入你的配置
```

#### 4.2 启动开发服务器
```bash
# 安装依赖并启动
deno task start
```

访问 `http://localhost:8000` 开始开发。

### 5. 管理员配置

#### 5.1 添加管理员
编辑 `utils/adminConfig.ts` 文件：

```typescript
export const ADMIN_USERNAMES = [
  'dext7r',
  'your_username', // 添加你的用户名
];
```

#### 5.2 管理员功能
管理员可以：
- 访问 `/admin` 管理面板
- 审核用户提交的帖子
- 批准或拒绝帖子发布
- 查看系统统计信息

### 6. 功能特性

#### 6.1 用户功能
- ✅ Linux.do OAuth 登录
- ✅ 帖子采集（输入Linux.do帖子链接）
- ✅ 用户资料页面
- ✅ 响应式设计

#### 6.2 管理员功能
- ✅ 管理员面板
- ✅ 帖子审核（批准/拒绝）
- ✅ 用户管理
- ✅ 系统统计

#### 6.3 技术特性
- 🔥 Fresh 1.7.3 + Deno 2.x
- ⚡ Preact + TypeScript
- 🎨 TailwindCSS + Sass
- 🗄️ SQLite 数据库
- 🔐 JWT 身份认证
- 📱 响应式设计
- 🚀 自动部署

### 7. 故障排除

#### 7.1 常见问题
- **OAuth 回调失败**: 检查回调URL配置是否正确
- **数据库错误**: 确保数据目录权限正确
- **认证失败**: 检查 JWT_SECRET 配置

#### 7.2 调试模式
```bash
# 启用详细日志
NODE_ENV=development deno task start
```

### 8. 更新维护

#### 8.1 更新依赖
```bash
# 更新 Fresh 框架
deno task update
```

#### 8.2 数据备份
定期备份 SQLite 数据库文件：
```bash
cp ./data/linuxdo_dress.db ./backup/linuxdo_dress_$(date +%Y%m%d).db
```

### 9. 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

### 10. 许可证

MIT License - 可自由使用和修改

---

🎉 **部署完成后，访问你的域名即可体验 Linux.do 女装展示系统！**