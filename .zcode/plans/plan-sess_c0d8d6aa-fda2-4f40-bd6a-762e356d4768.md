# Grid 卡片重构：抓取 favicon + 站点主色背景（fontstand 风格）

## 目标
把首页 Grid 视图改成 fontstand 风格：每张卡片背景用该 foundry 网站的**主色**，中间放该 foundry 的 **favicon**。每行 **8 个**卡片。抓不到 favicon 的用 category 色块 + foundry 名兜底。

## 技术方案

### 1. 新建 Python 脚本 `scripts/ingest_foundry_assets.py`
完全沿用 `ingest_typefaces.py` 的约定（stdlib + 顶部 docstring + `ROOT = Path(__file__).resolve().parent.parent` + 自动生成 banner）。

**输入**：解析 `src/data/foundries.ts`，用正则提取 `(id, name, website, category)`。复用现有脚本的 `id/name` 正则，扩展捕获 `website` 和 `category`。

**处理**（对 974 个 foundry）：
1. **归一化 host**：`urllib.parse.urlparse("https://" + website).hostname`（website 可能带 path 如 `jetbrains.com/mono`）。
2. **抓 favicon**：`GET https://www.google.com/s2/favicons?domain={host}&sz=128`，存到 `public/favicons/{id}.png`。Google S2 永远返回一张图（找不到会给默认地球图），用文件大小判断是否是默认图（默认地球图约 ~1KB），过小的丢弃。
3. **提取主色**（用 Pillow）：
   - 打开 favicon，转 RGBA，缩小到 32x32 加速。
   - 遍历像素，统计颜色频率，**跳过**接近纯白（L>0.93）、纯黑（L<0.07）、接近透明（A<128）的像素。
   - 取频率最高的色作为 primary，存 hex。
   - 若整张图都是黑白/透明（即跳过了所有像素），primary 留空（交给前端兜底）。
4. **并发**：用 `concurrent.futures.ThreadPoolExecutor(max_workers=16)` 控制，加超时（每请求 8s）和 retry（1 次）。整体跑完打印成功/失败计数。
5. **断点续跑**：若 `public/favicons/{id}.png` 已存在则跳过抓取（方便重跑），但重新计算颜色（快）。

**依赖**：`Pillow`（新增）。若环境没装，脚本顶部给清晰报错提示 `pip install Pillow`。

**输出 2 个文件**：
- `public/favicons/{id}.png` × 974（favicon 图片，新建目录 `public/favicons/`）
- `public/data/foundry-assets.json` —— 形如：
  ```json
  {"1":{"color":"#0a0a0a","favicon":"/favicons/1.png"},"2":{"color":"#1a4d8f", ...}, ...}
  ```
  只有抓到 favicon 且取到色的才进这个 map。没进 map 的 foundry 前端用 category 兜底。

**运行**：`python3 scripts/ingest_foundry_assets.py`（手动跑，产出物提交 git，与现有 ingest 约定一致）。预计 974 个站 × 并发16，几分钟跑完。

### 2. 新建 `src/data/foundryAssets.ts`
加载数据层（仿 `src/data/typefaces.ts` 的 `useTypefaces` 模式，但这次用静态 import 而非 fetch——因为数据小，且需要在 `FoundryTable` 同步可用）：
- 定义 `type FoundryAsset = { color?: string; favicon?: string }` 和 `Record<number, FoundryAsset>`。
- 直接把 `public/data/foundry-assets.json` 内容作为 TS 导出（或在 vite 里 import json）。考虑体积：974 条 × ~50 字节 ≈ 50KB，可接受。

> 决策：用 Vite 的 JSON import（`import assets from "../../public/data/foundry-assets.json"`），零新代码，构建时内联。

### 3. 重写 `src/components/FoundryCard.tsx`
卡片视觉（fontstand 风格）：
- `aspect-square`（正方形，8 列时更紧凑）。
- **背景色**：若 `asset.color` 存在 → `style={{ backgroundColor: asset.color }}`；否则按 category 兜底色板（classic 黑 / modern 白 / indie 玫红 / tech 翠绿 / studio 紫）。
- **前景**：若 `asset.favicon` 存在 → 居中放 `<img>`（`h-1/3 w-1/3 object-contain`，白色或根据背景明暗自动反色）；否则居中放 foundry 名（大字号，像上一版）。
- **文字色**：根据背景色亮度自动选黑/白（用一个小的 `luminance` 工具函数从 hex 算 L，>0.5 用黑字否则白字）——确保 favicon 兜底文字也清晰。
- hover 轻微 `opacity-90`。整张卡片是 `<Link to={/foundries/${id}}>`。
- **去掉**所有 meta（描述/国家/年份/外链/category标签）。

### 4. 改 `src/components/FoundryTable.tsx`
- import foundry-assets 数据。
- Grid 分支列数改为 8：`grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8`（移动端 2 列，逐步到桌面 8 列）。gap 收紧到 `gap-2`。
- `<FoundryCard>` 传入 `foundry` + 对应 `asset`。

### 5. 跑脚本 + 启动 dev
1. `pip install Pillow`（若未装）。
2. `python3 scripts/ingest_foundry_assets.py`（生成 favicon 图片 + foundry-assets.json）。
3. `bun run check`（lint/类型）。
4. `bun dev`（dev 已在跑，HMR 会热更）。

## 风险 / 兜底
- **Google S2 默认图**：脚本用文件大小阈值过滤；漏网的，前端那张卡背景色仍会被取成地球图的蓝，视觉上可接受。
- **黑白 favicon 取不到色**：`color` 留空 → category 兜底色 → 仍有背景色，不会白板。
- **部分 foundry 网站已失效**：S2 多半仍能从缓存返回历史 favicon；实在没有就走 category 兜底。
- **体积**：974 张 128px png，每张约 2-10KB，总计 ~5MB，进 `public/` 按需加载（`<img loading=lazy>`），不影响首屏。

## 不在范围
- 不改 List（表格）视图。
- 不改 TypefaceGrid / DesignerGrid。
- 不把脚本接入 `prebuild`（与现有 ingest 约定一致：手动跑、产出物提交）。
