## type.fish → Astro 迁移方案

**目标**:把 17k 个详情页变成可被搜索引擎抓取的静态 HTML,解决 SEO 审计发现的 P0 问题。方式:**原地渐进改造**(保留 git 历史),**列表页保留为 React island**(首屏 SSR + hydrate),**详情页构建时 import 数据**(去掉运行时 fetch)。

---

### 阶段 1:脚手架与清理(基础设施)

**新增**:
- `astro.config.mjs` — `@astrojs/react` 集成 + `@tailwindcss/vite` 插件 + `@` 别名 + `site: 'https://type.fish'` + `output: 'static'`
- `src/layouts/BaseLayout.astro` — 全站 shell(`<html>`/`<head>`/Plausible/body),接收 `title`/`description`/`canonical`/`ogImage`/`jsonLd` props。**这是 SEO 的核心载体** —— 每页独立 meta 在这里注入。
- `src/components/HeroNav.astro` + `src/components/Footer.astro` — 从 React 转为纯 Astro 组件。active-link 用 `Astro.url.pathname` 服务端计算(去掉 React Router 的 `useLocation`)。

**删除死代码**:
- `src/components/ui/` 整个目录(70+ 文件,只 `skeleton` 被用 —— 把用到的那个简单骨架样式内联到 TypefaceGrid island)
- `src/components/NavLink.tsx`(未使用)
- `src/hooks/use-mobile.ts(.tsx)`(重复且未使用)
- `src/App.css`(Vite 模板残留)
- `package.json` 删除未用依赖:`@base-ui/react`、`@shadcn/react`、`cmdk`、`recharts`、`react-hook-form`、`@hookform/resolvers`、`react-resizable-panels`、`vaul`、`react-day-picker`、`embla-carousel-react`、`input-otp`、`next-themes`、`zod`、`date-fns`、`sonner`、`react-router-dom`(整个去掉)

**改造**:
- `vite.config.ts` 删除(Astro 接管构建)
- `index.html` 删除(Astro 用 layout)
- `src/main.tsx` 删除(Astro 入口)
- `tsconfig.json` 改为 extend Astro 的 baseline,保留 `@/*` 别名 + `strictNullChecks: true`
- `src/index.css` 保留不动(Tailwind v4 + 主题 token),改由 BaseLayout 引入;Google Fonts `@import` 移到 layout 的 `<link>` 以提升性能

**保留不动**(纯 TS,直接可复用):
- `src/data/foundries.ts`、`designers.ts`、`foundry-bridge.ts`、`foundry-assets.ts`
- `src/lib/utils.ts`(cn)、`src/lib/countries.ts`
- `public/data/*.json`、`public/favicons/`
- `scripts/ingest_*.py`
- `CONTEXT.md`、`docs/adr/`

**验证点**:`astro dev` 能起,首页和 about 页能渲染(虽然此时还是空壳)。

---

### 阶段 2:静态页面与布局

**新建 Astro 页面**(从 React 页面一对一翻译):
- `src/pages/index.astro`(← Index.tsx)— 静态渲染 HeroNav + FoundryTable island + Footer
- `src/pages/about.astro`(← About.tsx)— 全静态。统计数字在 frontmatter 里算一次。
- `src/pages/submit.astro`(← Submit.tsx)— stub,加 `<meta name="robots" content="noindex">`
- `src/pages/404.astro`(← NotFound.tsx)

**BaseLayout 注入 SEO 元数据**:
- `<title>{title}</title>` — 每页传入,格式 `{实体名} · type.fish`
- `<meta name="description">` — 每页传入
- `<link rel="canonical">` — 用 `Astro.url` + `Astro.site` 拼绝对 URL
- OG/Twitter tags — 包括默认 og-image
- JSON-LD `<script>` slot —— 由页面传入

**`__GIT_LAST_COMMIT_DATE__` 处理**:改为在 `astro.config.mjs` 里用 `execSync` 读取,通过 `import.meta.env.__GIT_LAST_COMMIT_DATE__` 暴露(Astro 支持 Vite 的 define)。

---

### 阶段 3:详情页(17k 静态页面 —— SEO 核心)

这是迁移的最高价值部分。每个详情页**构建时**生成独立 HTML,带独立 title/description/canonical/JSON-LD。

**`src/pages/foundries/[id].astro`**:
```astro
---
import typefacesData from '../../../public/data/typefaces.json';
import indexMaps from '../../../public/data/index-maps.json';
import { foundries } from '@/data/foundries';
import { foundrySlugByLocalId } from '@/data/foundry-bridge';

export async function getStaticPaths() {
  return foundries.map(f => ({ params: { id: String(f.id) }, props: { foundry: f } }));
}
const { foundry } = Astro.props;
// 在 frontmatter 里解析 typefaces 关系(构建时,一次)
const slug = foundrySlugByLocalId[foundry.id];
const typefaceIds = slug ? indexMaps.byFoundry[slug] ?? [] : [];
const foundryTypefaces = typefaceIds.map(id => typefacesData.find(t => t.id === id)).filter(Boolean);
// 传给 BaseLayout
const title = `${foundry.name} · type.fish`;
const description = foundry.description ?? `Type foundry: ${foundry.name}`;
const jsonLd = { '@type': 'Organization', name: foundry.name, ... };
---
<BaseLayout title={title} description={description} jsonLd={jsonLd}>
  <!-- 静态 HTML,SEO 可见 -->
</BaseLayout>
```

**`src/pages/typefaces/[slug].astro`**:类似,`getStaticPaths` 遍历 15,460 个 typeface。JSON-LD 用 `CreativeWork` schema。

**`src/pages/designers/[slug].astro`**:类似,`getStaticPaths` 用 `slugifyName` 生成 slug(从 lib 抽出公共函数)。

**SEO 输出验证**:每个详情页有独立 `<title>`、独立 description、canonical、JSON-LD、真实 H1。`curl /typefaces/fairweather` 返回完整 HTML(不再是空 `<div id="root">`)。

---

### 阶段 4:列表页 React islands

三个列表页保留交互,但首屏 SSR 渲染(让 SEO 看到内容)。

**改造 FoundryTable/TypefaceGrid/DesignerGrid 为 islands**:
- 文件位置:`src/components/islands/FoundryTable.tsx` 等(保留 React)
- 改动:`react-router` 的 `Link` → 普通 `<a href>`(Astro 不用 React Router);`useSearchParams` 改为读 `window.location`(hydrate 后)
- **首屏数据通过 props 传入**:Astro 页面在 frontmatter 算好第一页 48 条 + 国家统计,作为 props 传给 island。island 初始渲染用这些 props(SEO 可见),hydrate 后接管。
- `__GIT_LAST_COMMIT_DATE__` 改为从 props 传入。

**Astro 页面调用 island**:
```astro
---
import { foundries } from '@/data/foundries';
import FoundryTableIsland from '@/components/islands/FoundryTable.tsx';
const initialFoundries = [...foundries].sort(...).slice(0, 48);
---
<FoundryTableIsland 
  client:load
  initialFoundries={initialFoundries}
  allFoundries={foundries}
  gitDate={import.meta.env.__GIT_LAST_COMMIT_DATE__}
/>
```

**`/typefaces` 列表页**:同样 island 模式。但因为 7.7MB 数据,首屏 SSR 只渲染第一页 48 条 + 分类统计(在 frontmatter 从构建时 import 的数据算)。`?license=open-source` 预设也走 SSR。

---

### 阶段 5:SEO 配套(直接做完 P0+P1)

**`public/robots.txt`** 改:
- 加 `Sitemap: https://type.fish/sitemap-index.xml`

**`scripts/generate_sitemap.py`**(新增,接在 ingest 之后):
- 基于已生成的数据生成 sitemap-index.xml + 分片(foundries/typefaces/designers 各一个),共 ~17k URL
- 输出到 `public/`

**OG image**:
- 生成默认 `public/og-image.png`(1200×630,品牌视觉)
- BaseLayout 默认引用

**详情页 JSON-LD**:
- Foundry:`Organization`(name, foundingDate, country, url)
- Typeface:`CreativeWork`(name, creator, license, inLanguage)
- 首页:`WebSite` + `SearchAction`(站内搜索 rich snippet)

**H1 修复**:HeroNav 的品牌名用 `<div>` 不用 `<h1>`,每页单一 H1。

---

### 阶段 6:验证与部署

- `astro build` 成功,`dist/` 生成 17k+ 个 HTML 文件
- 抽查:`curl dist/typefaces/fairweather/index.html` 有真实 title/H1/JSON-LD
- `dist/sitemap*.xml` 存在且包含全部 URL
- 删除 `public/_redirects`(静态站点不再需要 SPA fallback)
- 本地 `astro preview` 全功能验证
- 提交到 main,推送,确认 Cloudflare Pages 自动构建(这次会跑 `astro build` —— 需要在 Cloudflare 控制台把 build command 从 `vite build` 改为 `astro build`,output dir 仍 `dist`)

---

### 关键改动文件清单

**新增**(约 12 个文件):
- `astro.config.mjs`、`src/layouts/BaseLayout.astro`
- `src/pages/` 下 8 个 `.astro` 文件
- `src/components/HeroNav.astro`、`src/components/Footer.astro`
- `src/components/islands/`(3 个 React island)
- `src/lib/slug.ts`(抽出公共 slugifyName)
- `scripts/generate_sitemap.py`
- `public/og-image.png`、`public/robots.txt`(改)

**改造**:`tsconfig.json`、`biome.jsonc`(去掉 `__GIT__` global,加 Astro 文件规则)、`package.json`

**删除**:整个 `src/components/ui/`、`src/hooks/`、`src/App.tsx`、`src/main.tsx`、`vite.config.ts`、`index.html`、`src/App.css`、`src/vite-env.d.ts`,以及 13 个未用 npm 依赖

### 风险与缓解
- **Cloudflare build command 变更**:迁移后需要把 Cloudflare Pages 的 build command 改为 `astro build`(我会提醒你,这是部署侧的手动步骤)
- **17k 页面构建时间**:Astro 基准测试 100k 页 22 秒,17k 应该 < 5 秒,Cloudflare Pages 默认构建限制(通常 20 分钟)远够
- **数据构建时 import**:`getStaticPaths` 会读一次 7.7MB JSON,内存峰值正常(< 1GB),Node 默认堆够用
- **回归**:详情页的交叉链接(foundry↔typeface↔designer)逻辑不变,只是从运行时 fetch 改为构建时 import —— 用的还是同样的 bridge maps 和 index

迁移期间 dev server 可能短暂不可用,完成后我会验证所有路由。