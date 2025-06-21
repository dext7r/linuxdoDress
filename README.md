# Athena Template

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/dext7r/athena)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/dext7r/athena/blob/main/LICENSE)
[![Deno](https://img.shields.io/badge/deno-2.0+-black.svg)](https://deno.land/)
[![Fresh](https://img.shields.io/badge/fresh-1.7.3-yellow.svg)](https://fresh.deno.dev/)

一个现代化的 React + Deno 全栈开发模板，集成了 TailwindCSS + Sass + Zustand，为您提供完整的项目基础架构。

**作者：** h7ml <h7ml@h7ml.com>
**仓库：** [https://github.com/dext7r/athena.git](https://github.com/dext7r/athena.git)
**主页：** [https://athena.deno.dev](https://athena.deno.dev)
**问题反馈：** [https://github.com/dext7r/athena/issues](https://github.com/dext7r/athena/issues)
**demo：** [https://athena.deno.dev](https://athena.deno.dev)
**文档：** [https://athena.deno.dev/docs](https://athena.deno.dev/docs)

## 🚀 技术栈

| 技术 | 版本 | 描述 |
|------|------|------|
| **[Fresh](https://fresh.deno.dev/)** | 1.7.3 | Deno 的现代 Web 框架 |
| **[Preact](https://preactjs.com/)** | 10.22.0 | 轻量级 React 替代方案 |
| **[TailwindCSS](https://tailwindcss.com/)** | 3.4.1 | 原子化 CSS 框架 |
| **[Sass](https://sass-lang.com/)** | 1.69.5 | CSS 预处理器 |
| **[Zustand](https://zustand-demo.pmnd.rs/)** | 4.4.7 | 轻量级状态管理 |
| **[TypeScript](https://www.typescriptlang.org/)** | Latest | 类型安全的 JavaScript |
| **[Preact Signals](https://preactjs.com/guide/v10/signals/)** | 1.2.2 | 响应式状态管理 |
| **[Deno Standard Library](https://deno.land/std)** | 0.216.0 | Deno 标准库 |

## ✨ 特性

- 🎨 **丰富的 UI 组件库** - Button、Card、Input、Modal 等
- 🔧 **实用 Hooks 库** - useLocalStorage、useDebounce、useFetch 等
- 🌙 **主题切换系统** - 支持亮色、暗色和系统主题
- 📱 **响应式设计** - 完美适配桌面端、平板和移动端
- ⚡ **高性能** - 基于 Islands 架构，实现最佳性能
- 🔒 **类型安全** - 全面的 TypeScript 支持
- 🎯 **SSR 兼容** - 服务端渲染支持
- 💾 **状态持久化** - 自动保存用户偏好

## 🚀 快速开始

### 前置要求

- [Deno](https://deno.land/) 2.0+

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/dext7r/athena.git
cd athena

# 启动开发服务器
deno task start
```

项目将在 [http://localhost:8000](http://localhost:8000) 启动。

### 可用的 Deno 任务

| 命令 | 描述 |
|------|------|
| `deno task start` | 启动开发服务器（带热重载） |
| `deno task build` | 构建生产版本 |
| `deno task preview` | 预览生产版本 |
| `deno task check` | 代码格式化、Lint 检查和类型检查 |
| `deno task manifest` | 生成 Fresh 清单文件 |
| `deno task update` | 更新 Fresh 框架到最新版本 |

## 📖 使用指南

### 组件使用

```tsx
import Button from '../components/ui/Button.tsx';
import Card from '../components/ui/Card.tsx';

function MyComponent() {
  return (
    <Card>
      <Button variant="primary" size="lg">
        点击我
      </Button>
    </Card>
  );
}
```

### 自定义 Hooks

```tsx
import { useLocalStorage, useDebounce } from '../hooks/index.ts';

function MyComponent() {
  const [value, setValue] = useLocalStorage('key', 'default');
  const debouncedValue = useDebounce(value, 500);

  return <div>{debouncedValue}</div>;
}
```

### 状态管理

```tsx
import { useAppStore } from '../stores/useAppStore.ts';

function MyComponent() {
  const { isLoading, setLoading } = useAppStore();

  return (
    <button onClick={() => setLoading(!isLoading)}>
      {isLoading ? '加载中...' : '开始加载'}
    </button>
  );
}
```

## 🎨 样式系统

项目使用 TailwindCSS + Sass 的混合方案：

- **TailwindCSS** - 用于快速原型和原子化样式
- **Sass** - 用于复杂样式逻辑、主题变量和组件特定样式

## 📁 项目结构

```text
athena/
├── components/          # 可复用组件
│   ├── ui/             # 基础 UI 组件
│   ├── layout/         # 布局组件
│   └── forms/          # 表单组件
├── islands/            # Fresh Islands (客户端组件)
├── routes/             # 路由页面
│   ├── api/           # API 路由
│   └── status/        # 状态页面
├── hooks/              # 自定义 Hooks
├── stores/             # Zustand 状态管理
├── styles/             # Sass 样式文件
├── static/             # 静态资源
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
├── deno.json          # Deno 配置文件
├── fresh.config.ts    # Fresh 配置
└── tailwind.config.ts # TailwindCSS 配置
```

## 🔧 开发工具配置

### TypeScript 配置

- JSX 运行时：`react-jsx`
- JSX 导入源：`preact`
- 自动生成 node_modules 目录

### Lint 规则

- 使用 Fresh 推荐规则
- 自动排除 `_fresh` 构建目录

### 部署配置

- 支持 Deno Deploy
- 入口文件：`main.ts`
- 自动排除 node_modules

## 🌐 部署

### Deno Deploy

项目已配置 Deno Deploy 支持，可以直接部署到 [Deno Deploy](https://deno.com/deploy)。

```bash
# 构建项目
deno task build

# 预览生产版本
deno task preview
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。
