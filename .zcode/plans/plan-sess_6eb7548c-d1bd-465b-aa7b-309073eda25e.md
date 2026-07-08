# 全面升级 + Radix UI → Base UI 迁移方案

## 现状摘要（调研结论）

- **应用实际只用 2 个 shadcn 组件**：`sonner`、`tooltip`（在 `App.tsx`）。另有一个 legacy `Toaster`（基于 `@radix-ui/react-toast`）被挂载但**从未被任何代码触发**。
- **45/49 个 ui 组件文件是死代码**，从未被 app 代码 import。
- **应用代码 0 处直接 import `@radix-ui/*`**，0 处使用 `asChild`——整个 Radix 依赖被完全封装在 `src/components/ui/` 内。
- 所有页面和业务组件（pages、HeroSection、FoundryTable 等）都是手写 HTML + Tailwind，只用设计 token（`bg-background`、`text-muted-foreground` 等），不依赖任何 Radix 组件。
- Base UI 要求 **React 19**，必须先升 React。

**结论：迁移风险被天然隔离在 `src/components/ui/` 内，业务代码无需改动。**

## 执行步骤（每步独立验证，单提交）

### 阶段 A — 准备与清理

1. **创建分支** `chore/upgrade-base-ui`。
2. **删除死代码**：
   - 删除全部 45 个未使用的 ui 文件
   - 删除 legacy toast 系统：`src/components/ui/toast.tsx`、`toaster.tsx`、`use-toast.ts`、`src/hooks/use-toast.ts`
   - 修改 `src/App.tsx`：移除 `Toaster` 的 import 和渲染（保留 `Sonner`）
   - 仅保留 `src/components/ui/sonner.tsx`、`tooltip.tsx`（临时保留，下一步重建）
   - 验证：`bun install` + `bun run build` 通过

### 阶段 B — Tailwind v3 → v4 迁移（独立提交）

3. **依赖**：移除 `tailwindcss@3`、`autoprefixer`、`postcss`、`tailwindcss-animate`；安装 `tailwindcss@4`、`@tailwindcss/vite`、`tw-animate-css`。移除孤儿依赖 `@tailwindcss/typography`（未在 config 中使用）。
4. **`postcss.config.js`** → 删除（改用 Vite 插件）。
5. **`vite.config.ts`** → `plugins: [tailwindcss(), react()]`。
6. **`tailwind.config.ts`** → 删除（v4 用 CSS 配置）。`components.json` 中 `tailwind.config` 字段相应清理。
7. **`src/index.css`** 重写为 v4 形式：
   - 顶部 `@import` Google Fonts（修正原本违反 CSS 规范的 @import 位置）
   - `@import "tailwindcss";` + `@import "tw-animate-css";`
   - `@custom-variant dark (&:is(.dark *));`
   - `@theme inline { ... }`：把原 `theme.extend` 的全部 token（colors、borderRadius calc、container、fontFamily、keyframes/animation）迁入 CSS
   - 保留现有 `--background`、`--foreground` 等 HSL channel 值（你的设计是纯灰阶 + `--radius: 0px`，全部原样保留）
   - `@layer base` 块（border-border、字体、标题样式）原样保留
8. **`biome.jsonc`**：移除 CSS 相关的 `noUnknownAtRules`、`noInvalidPositionAtImportRule` 抑制规则（v4 后这些 lint 不再触发）。
9. 验证：`bun run dev` 视觉对比 + `bun run build` 通过。

### 阶段 C — React 19 + 核心依赖升级（独立提交）

10. 升级：`react@19`、`react-dom@19`、`@types/react@19`、`@types/react-dom@19`。
11. 移除全部 27 个 `@radix-ui/react-*` 依赖（马上用 Base UI 替代）。
12. 升级其他可跨主版本的包：`zod@4` + `@hookform/resolvers@5`、`react-router-dom@7`、`@vitejs/plugin-react-swc@4`、`vite@8`、`typescript@6`、`@types/node@26`、`lucide-react@1`、`recharts@3`、`react-day-picker@10`、`sonner@2`、`vaul@1`、`next-themes@0.4`、`date-fns@4`、`react-resizable-panels@4`、`@tanstack/react-query@5`(latest)、`react-hook-form@7`(latest)、`tailwind-merge@3`。
13. 验证：`bun install` + `bun run build`。

### 阶段 D — Radix → Base UI 迁移（核心，独立提交）

14. **`components.json`**：更新为 Base UI 配置（`"base": "base-ui"` 字段，`style` 更新为新默认值，移除旧 `tailwind.config` 引用）。
15. 删除临时保留的 `sonner.tsx`、`tooltip.tsx`（旧 Radix 版本）。
16. **重新初始化 shadcn for Base UI**：
    - `bunx shadcn@latest init -b base -y --force`（设置 Base UI registry）
    - `bunx shadcn@latest add -a -y`（添加全部组件，从 Base UI registry 拉取）
    - 验证 `package.json` 出现 `@base-ui-components/react`、`radix-ui`(unified) 等新依赖，无残留 `@radix-ui/react-*`。
17. **修正 `App.tsx`**：确认 `<Sonner />` 和 `<TooltipProvider>` 的 import 指向新生成的 Base UI 版本（API 通常兼容，必要时微调）。
18. **API 适配**（按需）：
    - `asChild` → Base UI 的 `render={<Component />}`（仅 ui 内部，业务代码无此问题）
    - 确认 `App.tsx` 中 `TooltipProvider`、`Sonner` 的 props 兼容
19. 验证：`bun run dev` 完整功能测试 + `bun run build` + `bun run check`(ultracite/biome lint)。

### 阶段 E — 收尾

20. 全量 lint：`bun run fix`，修复 Base UI 新代码的风格问题（biome 的 ui/ hooks/ override 规则可能需要微调以匹配新组件）。
21. 最终 `bun run build` 确认，汇总变更报告。

## 风险与回滚

- **每阶段独立 git 提交**，任何阶段失败可单独回滚。
- **最大风险点**：Tailwind v4 的 token 迁移（阶段 B）。缓解：token 全量保留原值，仅改声明语法；逐项 build 验证。
- **次要风险**：个别包跨主版本 API 变化（recharts、react-day-picker 等）。但这些包在死代码中或未被使用——实际上 `recharts/chart.tsx`、`react-day-picker/calendar.tsx` 都在删除列表里，业务代码无直接依赖，风险极低。
- Base UI 的 sonner/tooltip 与现有 `App.tsx` 用法基本兼容，必要时微调。

## 需要你确认的动作权限

执行期间我会运行：`bun install`、`bun run build`、`bun run dev`(临时)、`bun run check`/`fix`、`bunx shadcn ...`、`git add`/`git commit`（不 push）。