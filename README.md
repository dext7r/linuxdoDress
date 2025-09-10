<div align="center">

# 💄 Linux.do 女装展示系统

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/deno-2.0+-black.svg" alt="Deno">
  <img src="https://img.shields.io/badge/fresh-1.7.3-yellow.svg" alt="Fresh">
  <img src="https://img.shields.io/badge/database-Deno%20KV-brightgreen.svg" alt="Database">
  <a href="https://linuxdodress.deno.dev" target="_blank">
    <img src="https://img.shields.io/badge/demo-online-success.svg" alt="Demo">
  </a>
  <br>
  <img src="https://img.shields.io/github/stars/dext7r/linuxdodress?style=social" alt="GitHub Stars">
  <img src="https://img.shields.io/github/forks/dext7r/linuxdodress?style=social" alt="GitHub Forks">
  <img src="https://img.shields.io/github/watchers/dext7r/linuxdodress?style=social" alt="GitHub Watchers">
</p>

<p align="center">
  <strong>基于 Linux.do 社区的女装展示系统</strong><br>
  聚合展示社区女装相关帖子，分享美妆技巧、穿搭心得、美丽瞬间
</p>

<p align="center">
  🌍 <a href="https://linuxdodress.deno.dev" target="_blank"><strong>在线演示</strong></a> |
  📚 <a href="#-快速开始"><strong>快速开始</strong></a> |
  🛠️ <a href="#-项目结构"><strong>项目结构</strong></a> |
  📄 <a href="#-许可证"><strong>许可证</strong></a>
</p>

</div>

---

## 🚀 技术栈

<div align="center">

|                            🛠️ 技术                            |  📦 版本  | 📝 描述                  |
| :-----------------------------------------------------------: | :-------: | :----------------------- |
|             **[Fresh](https://fresh.deno.dev/)**              |  `1.7.3`  | 🌊 Deno 的现代 Web 框架  |
|              **[Preact](https://preactjs.com/)**              | `10.22.0` | ⚛️ 轻量级 React 替代方案 |
|          **[TailwindCSS](https://tailwindcss.com/)**          |  `3.4.1`  | 🎨 原子化 CSS 框架       |
|              **[Sass](https://sass-lang.com/)**               | `1.69.5`  | 💅 CSS 预处理器          |
|         **[Zustand](https://zustand-demo.pmnd.rs/)**          |  `4.4.7`  | 🐻 轻量级状态管理        |
|       **[TypeScript](https://www.typescriptlang.org/)**       | `Latest`  | 🔷 类型安全的 JavaScript |
| **[Preact Signals](https://preactjs.com/guide/v10/signals/)** |  `1.2.2`  | 📡 响应式状态管理        |
|             **[DJWT](https://deno.land/x/djwt)**              |  `3.0.2`  | 🔐 JWT 认证库            |

</div>

## ✨ 功能特性

<div align="center">

### 🎯 专为 Linux.do 社区女装展示打造

</div>

<table>
<tr>
<td width="50%">

**💄 内容展示**

- ✅ 女装帖子聚合展示
- ✅ 美妆技巧分享
- ✅ 穿搭心得交流
- ✅ 图片轮播展示
- ✅ 响应式布局设计

</td>
<td width="50%">

**🔧 技术特性**

- ✅ Linux.do OAuth 认证
- ✅ 帖子数据采集
- ✅ 主题切换支持
- ✅ Islands 架构
- ✅ 服务端渲染 (SSR)

</td>
</tr>
<tr>
<td>

**🎨 用户体验**

- ✅ 现代化 UI 设计
- ✅ 深色/浅色主题
- ✅ 动画过渡效果
- ✅ 移动端适配
- ✅ 快速加载

</td>
<td>

**🛠️ 开发特性**

- ✅ TypeScript 类型安全
- ✅ 热重载开发服务器
- ✅ 代码格式化和 Lint
- ✅ 数据库集成
- ✅ API 路由系统

</td>
</tr>
</table>

## 🚀 快速开始

### 📋 前置要求

<div align="center">

![Deno](https://img.shields.io/badge/Deno-2.0+-000000?style=for-the-badge&logo=deno&logoColor=white)

</div>

确保您的系统已安装 [Deno](https://deno.land/) 2.0 或更高版本。

### ⚡ 启动步骤

```bash
# 📥 克隆项目
git clone https://github.com/h7ml/linuxdoDress.git
cd linuxdoDress

# 📝 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要的配置信息

# 🚀 启动开发服务器
deno task start
```

<div align="center">

🎉 **项目将在 [http://localhost:8000](http://localhost:8000) 启动**

</div>

### 🛠️ 可用命令

<div align="center">

|       🎯 命令        | 📝 描述           | 🔧 用途                |
| :------------------: | :---------------- | :--------------------- |
|  `deno task start`   | 🔥 启动开发服务器 | 开发时使用，支持热重载 |
|  `deno task build`   | 📦 构建生产版本   | 生产环境构建           |
| `deno task preview`  | 👀 预览生产版本   | 本地预览生产构建       |
|  `deno task check`   | ✅ 代码质量检查   | 格式化、Lint、类型检查 |
| `deno task manifest` | 📋 生成清单文件   | Fresh 框架清单         |

</div>

## ⚙️ 环境配置

### 必需的环境变量

创建 `.env` 文件并配置以下环境变量：

```bash
# Linux.do OAuth 配置
LINUXDO_CLIENT_ID=your_linuxdo_client_id
LINUXDO_CLIENT_SECRET=your_linuxdo_client_secret

# 应用配置
APP_BASE_URL=http://localhost:8000
JWT_SECRET=your_super_secret_jwt_key_here
SESSION_EXPIRE_TIME=86400

# 数据库配置
DATABASE_PATH=./data/posts.db
```

### Linux.do OAuth 应用申请

1. **查看官方文档**：https://wiki.linux.do/Community/LinuxDoConnect
2. **申请 OAuth 应用**：https://connect.linux.do/dash/sso/new
3. **配置应用信息**：
   - 应用名称：Linux.do 女装展示
   - 回调 URL（开发）：`http://localhost:8000/api/auth/callback`
   - 回调 URL（生产）：`https://linuxdodress.deno.dev/api/auth/callback`
   - 权限范围：`user`
4. **获取凭据**：记录 Client ID 和 Client Secret
5. **更新配置**：将凭据填入 `.env` 文件

### 调试工具

访问 http://localhost:8000/debug-oauth 查看配置状态和问题排查。

## 📁 项目结构

```text
📦 linuxdoDress/
├── 🎨 components/          # 可复用组件
│   ├── 🧩 ui/             # 基础 UI 组件
│   ├── 📐 layout/         # 布局组件
│   └── 🔐 auth/           # 认证组件
├── 🏝️ islands/            # Fresh Islands (客户端组件)
├── 🛣️ routes/             # 路由页面
│   ├── 🔌 api/           # API 路由
│   │   ├── 🔐 auth/      # 认证相关 API
│   │   └── 📝 posts/     # 帖子相关 API
│   └── 📊 status/        # 状态页面
├── 🪝 hooks/              # 自定义 Hooks
├── 💾 stores/             # 状态管理 (Zustand)
├── 🛠️ utils/              # 工具函数
├── 🎯 static/             # 静态资源
├── 💅 styles/             # Sass 样式
└── 🔷 types/              # TypeScript 类型定义
```

## 🤝 致谢

本项目基于 [Yunyuan Template](https://github.com/h7ml/Yunyuan) 开发，感谢原作者提供的优秀模板基础。

## 🐛 错误修复指南

### 常见错误及解决方案

1. **getPosts is not defined**
   - 原因：缺少函数导入
   - 解决：已修复 API 路由中的导入问题

2. **LINUXDO_CLIENT_ID is required**
   - 原因：缺少 Linux.do OAuth 配置
   - 解决：配置 `.env` 文件中的相关变量

## 📄 许可证

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**本项目采用 MIT 许可证**

</div>

---

<div align="center">

### 🌟 如果这个项目对您有帮助，请给我们一个 Star

**感谢您的支持！** 🙏

---

**基于 [Yunyuan Template](https://github.com/h7ml/Yunyuan) 开发**  
**Made with ❤️ by [h7ml](https://github.com/h7ml)**

---

### 📊 项目统计

<p align="center">
  <img src="https://img.shields.io/github/languages/top/dext7r/linuxdodress" alt="Top Language">
  <img src="https://img.shields.io/github/languages/count/dext7r/linuxdodress" alt="Language Count">
  <img src="https://img.shields.io/github/repo-size/dext7r/linuxdodress" alt="Repo Size">
  <img src="https://img.shields.io/github/commit-activity/m/dext7r/linuxdodress" alt="Commit Activity">
  <img src="https://img.shields.io/github/last-commit/dext7r/linuxdodress" alt="Last Commit">
</p>

### 🔗 相关链接

<p align="center">
  <a href="https://linux.do" target="_blank">
    <img src="https://img.shields.io/badge/Linux.do-社区-orange?style=for-the-badge&logo=linux" alt="Linux.do">
  </a>
  <a href="https://deno.com/deploy" target="_blank">
    <img src="https://img.shields.io/badge/Deno-Deploy-black?style=for-the-badge&logo=deno" alt="Deno Deploy">
  </a>
  <a href="https://fresh.deno.dev" target="_blank">
    <img src="https://img.shields.io/badge/Fresh-Framework-yellow?style=for-the-badge&logo=deno" alt="Fresh">
  </a>
</p>

</div>
