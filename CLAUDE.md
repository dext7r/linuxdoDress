# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 项目概述

云远模板是一个基于 Fresh (Deno)、Preact、TailwindCSS、Sass 和 Zustand 构建的现代化全栈开发模板。它提供了完整的项目基础架构，包含认证系统、状态管理、UI 组件和部署配置。

## 开发命令

**启动开发服务器：**

```bash
deno task start
```

启动支持热重载的开发服务器，访问地址：<http://localhost:8000>

**构建生产版本：**

```bash
deno task build
```

**预览生产构建：**

```bash
deno task preview
```

**代码质量检查：**

```bash
deno task check
```

运行代码格式化、Lint 检查和 TypeScript 类型检查

**更新 Fresh 框架：**

```bash
deno task update
```

**生成清单文件：**

```bash
deno task manifest
```

## 架构概览

### 技术栈

- **Fresh 1.7.3**: 基于 Deno 的 Web 框架，采用 Islands 架构
- **Preact 10.22.0**: 轻量级 React 替代方案
- **TypeScript**: 完整类型安全，配置为 Preact 的 JSX 运行时
- **TailwindCSS 3.4.1**: 原子化 CSS 框架，带有自定义主题扩展
- **Sass 1.69.5**: CSS 预处理器，用于复杂样式逻辑
- **Zustand 4.4.7**: 轻量级状态管理
- **Preact Signals 1.2.2**: 响应式状态管理
- **DJWT 3.0.2**: JWT 认证库
- **Deno Standard Library 0.216.0**: Deno 标准库

### 核心目录

**`/routes/`** - 基于文件的路由系统

- `/api/auth/` - GitHub OAuth 认证端点
- `/status/` - 错误状态页面 (401, 403, 500 等)
- `_app.tsx` - 根应用组件
- `_404.tsx` - 404 错误页面

**`/islands/`** - 客户端交互组件 (Fresh Islands 架构)

- 在客户端进行水合的交互组件
- 状态管理和动态用户交互

**`/components/`** - 服务端渲染组件

- `/ui/` - 基础 UI 组件 (Button, Card, Input, Modal)
- `/layout/` - 布局组件 (Header, Layout, Sidebar)
- `/auth/` - 认证相关组件

**`/stores/`** - Zustand 状态管理

- `useAuthStore.ts` - 用户认证状态，带持久化
- `useThemeStore.ts` - 主题切换 (浅色/深色/系统)
- `useAppStore.ts` - 全局应用状态

**`/hooks/`** - 自定义 React Hooks

- `useFetch.ts`, `useDebounce.ts`, `useLocalStorage.ts` 等

**`/utils/`** - 工具函数

- `auth.ts` - GitHub OAuth 配置和用户转换
- `jwt.ts` - JWT 令牌处理
- `middleware.ts` - 请求/响应工具

**`/styles/`** - Sass 样式表架构

- `main.scss` - 导入所有其他样式的入口点
- `/variables/` - 主题变量和设计令牌
- `/utilities/` - Mixins 和工具函数
- `/base/` - 重置和基础样式
- `/components/` - 组件特定样式

## 认证系统

项目使用 GitHub OAuth 和 JWT 会话：

**必需的环境变量：**

- `GITHUB_CLIENT_ID` - GitHub OAuth 应用客户端 ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth 应用客户端密钥
- `JWT_SECRET` - JWT 签名密钥 (应为安全的随机字符串)
- `APP_BASE_URL` - OAuth 重定向的基础 URL (默认为 localhost:8000)
- `SESSION_EXPIRE_TIME` - JWT 过期时间，秒为单位 (默认为 86400)

**认证流程：**

1. `/api/auth/github` - 启动 GitHub OAuth
2. `/api/auth/callback` - 处理 OAuth 回调
3. `/api/auth/me` - 获取当前用户信息
4. `/api/auth/logout` - 清除会话

**Store 用法：**

```typescript
const { isAuthenticated, user, login, logout, checkAuth } = useAuthStore()
```

## 样式系统

**双重方案：**

- **TailwindCSS**: 用于快速原型开发的原子化工具类
- **Sass**: 复杂样式逻辑、主题变量、组件特定样式

**TailwindCSS 配置：**

- 自定义主色调色板 (蓝色变体)
- 通过 `class` 策略支持深色模式
- 自定义动画 (fade-in, slide-up, gradient-flow 等)
- 响应式断点

**Sass 结构：**

- 变量位于 `/styles/variables/_theme.scss`
- Mixins 位于 `/styles/utilities/_mixins.scss`
- 组件样式位于 `/styles/components/_custom.scss`
- 全局工具类如 `.glass-effect`, `.text-gradient`

## 组件开发指南

**UI 组件 (`/components/ui/`)：**

- 为 props 使用 TypeScript 接口
- 适当支持 variant 和 size props
- 包含加载状态和禁用状态
- 使用 forwardRef 进行 DOM 元素访问
- 结合 TailwindCSS 类和自定义 Sass 类

**Button 变体示例：**

- `primary`, `secondary`, `outline`, `ghost`, `gradient`, `glass`
- 尺寸: `sm`, `md`, `lg`

## 状态管理模式

**Zustand stores 包含：**

- 用于数据持久化的 Persist 中间件
- 用于 API 调用的异步操作
- 与 stores 一起导出的工具函数
- 用于类型安全的 TypeScript 接口

**认证 store 功能：**

- 自动令牌刷新
- 持久登录状态
- 错误处理
- 加载状态

## 文件命名约定

- 组件: PascalCase (`Button.tsx`, `AuthGuard.tsx`)
- Hooks: 以 `use` 开头的 camelCase (`useCounter.ts`)
- Stores: 以 `use` 开头的 camelCase (`useAuthStore.ts`)
- 工具: camelCase (`auth.ts`, `middleware.ts`)
- 页面: camelCase (`index.tsx`, `profile.tsx`)

## 开发注意事项

- 入口点: 生产环境用 `main.ts`，开发环境用 `dev.ts`
- Fresh 自动生成 `fresh.gen.ts` 清单
- 通过 `$std/dotenv/load.ts` 加载环境变量
- 客户端代码应放在 `/islands/` 中进行水合
- 服务端组件放在 `/components/` 中进行 SSR
- 启用 TypeScript 严格模式，配置 Preact JSX 运行时