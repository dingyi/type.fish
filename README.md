# type.fish

全球字体厂商目录，收录 981 家字体设计公司与工作室。

## 技术栈

- [Vite](https://vitejs.dev/) 8 — 构建工具
- [React](https://react.dev/) 19 — UI 框架
- [TypeScript](https://www.typescriptlang.org/) 6 — 类型系统
- [Tailwind CSS](https://tailwindcss.com/) 4 — 样式方案
- [shadcn/ui](https://ui.shadcn.com/) — 组件库（基于 [Base UI](https://base-ui.com/)）
- [React Router](https://reactrouter.com/) 7 — 路由
- [TanStack Query](https://tanstack.com/query) — 数据请求
- [Lucide React](https://lucide.dev/) — 图标
- [Biome](https://biomejs.dev/)（经 [ultracite](https://ultracite.dev/) 封装）— 代码格式化与 Lint

## 本地开发

```sh
# 安装依赖
bun install

# 启动开发服务器 (localhost:8080)
bun dev

# 构建生产版本
bun run build

# 预览生产构建
bun run preview

# Lint 检查 / 自动修复
bun run check
bun run fix
```

## 项目结构

```
src/
├── components/
│   ├── ui/              # shadcn/ui 组件（Base UI）
│   ├── FoundryTable.tsx # 厂商列表表格（搜索 + 表格）
│   ├── HeroSection.tsx  # 页面头部
│   ├── NavLink.tsx      # 导航链接
│   └── Footer.tsx       # 页脚
├── data/
│   └── foundries.ts     # 字体厂商数据（981 条）
├── pages/
│   ├── Index.tsx         # 首页
│   ├── Typefaces.tsx     # 字体列表
│   ├── Designers.tsx     # 设计师列表
│   ├── About.tsx         # 关于
│   ├── Submit.tsx        # 提交厂商
│   └── NotFound.tsx      # 404 页面
├── App.tsx              # 路由配置
└── main.tsx             # 入口
```
