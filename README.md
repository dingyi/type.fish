# type.fish

全球字体资料目录，收录字体厂商、字体、设计师与相关工具。

## 技术栈

- [Astro](https://astro.build/) 7 — 静态站点框架
- [React](https://react.dev/) 19 — UI 框架
- [TypeScript](https://www.typescriptlang.org/) 6 — 类型系统
- [Tailwind CSS](https://tailwindcss.com/) 4 — 样式方案
- [Lucide React](https://lucide.dev/) — 图标
- [Bun](https://bun.sh/) — 包管理与脚本运行时
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
│   ├── islands/         # 需要客户端交互的 React 组件
│   └── *.astro          # 导航、页脚等静态组件
├── data/
│   ├── foundries.ts     # 字体厂商数据
│   ├── designers.ts     # 字体设计师数据
│   └── tools.ts         # 字体工具数据
├── pages/
│   ├── index.astro      # 字体厂商目录
│   ├── typefaces/       # 字体列表与详情
│   ├── designers/       # 设计师列表与详情
│   ├── tools.astro      # 字体工具
│   ├── about.astro      # 关于与数据覆盖
│   └── submit.astro     # 提交与纠错
└── layouts/             # 页面布局与元数据

public/data/             # 构建时与按需加载的目录数据
scripts/                 # 数据摄取、sitemap 与 GEO 验收脚本
```
