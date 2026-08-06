## 目标

把 type.family 从「Geist Mono 全局等宽 + 0 圆角 + 粗边框」的极简风，改成 PostScheduler 那种「Geist 无衬线正文 + Geist Mono 标签/数字 + 14px 圆角卡片 + 胶囊按钮 + 柔和灰阶」的编辑型目录风格。**保留宽布局（max-w-5xl）和现有搜索/筛选/表格行为，只改视觉语言。**

## 设计决策（基于你的回答）

| 维度 | 决定 |
|---|---|
| 字体 | **Geist（无衬线）**作正文/标题，**Geist Mono** 作标签/数字/eyebrow（双字体系统，PostScheduler 编辑感的核心）|
| 宽度 | 保持 `max-w-5xl`（1024px）|
| 结构 | 不动搜索/筛选/表格行为，只重做样式 |
| 范围 | Foundation（tokens）+ 全部页面 |

---

## 改动一：设计 Token 基座 — `src/index.css`

这是全局生效的关键，改完大部分效果就出来了。

**字体导入**：扩展 Google Fonts 引入 Geist 无衬线：
```css
@import url("...family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@300;400;500;600;700...");
```

**`:root` 颜色**（对齐 PostScheduler 灰阶，更柔和）：
| Token | 旧 | 新 | 说明 |
|---|---|---|---|
| `--foreground` | `9%`(#171717) | `10%`(#1A1A1A) | 柔和近黑 ink |
| `--card` | `100%`(白) | `98%`(#FAFAFA) | 卡片表面，区别于纯白背景 |
| `--muted` | `96%` | `94%`(#F0F0F0) | chip/按钮填充 |
| `--border` | `90%` | `94%`(#F0F0F0) | hairline 细线，更轻 |
| `--input` | `90%` | `94%` | 同 border |
| `--accent` | `96%` | `96%`(#F5F5F5) | hover 态保留 |
| `--radius` | **`0px`** | **`14px`** | **圆角核心改动** → sm=10/md=12/lg=14/xl≈20 |

`@theme inline` 字体映射：
- `--font-sans` / `--font-heading` → `"Geist", sans-serif`（原来是 Geist Mono）
- `--font-mono` → `"Geist Mono", monospace`（保留）

`@layer base`：
- `body` 字体 → Geist sans，字号 13px → **14px**
- 标题：`font-weight: 700`、`letter-spacing: -0.02em`（负字距）、**去掉 `text-transform: uppercase`**、字体改 Geist sans

> `.dark` 一套做对应同步（已有定义，跟着调）。

---

## 改动二：Header/Nav — `src/components/HeroSection.tsx`

- 标题「全球字体厂商目录」：Geist、正常字距（不再 uppercase）
- 导航项：**激活态变胶囊填充**（`bg-muted rounded-full px-3 py-1`），非激活纯文本；标签用 Geist Mono 做编辑感 eyebrow
- Submit 按钮：**深色胶囊 CTA**（`bg-foreground text-background rounded-full`），呼应 PostScheduler 的 "Submit your tool" 黑色药丸
- `<hr>` 保留，因为 border 已变 #F0F0F0，会自动变柔和

---

## 改动三：核心目录 — `src/components/FoundryTable.tsx`（首页主体）

保留 `<table>` 结构与搜索/筛选逻辑，重做视觉：

- **国家筛选 chip** → 胶囊：`rounded-full`，未选 `bg-muted text-muted-foreground`，选中 `bg-foreground text-background`
- **搜索框** → 胶囊：`rounded-full border px-4 py-2`，略放大
- **表格容器** → 圆角卡片包裹：`rounded-xl border overflow-hidden`
- **表头**：去 uppercase、用 Geist Mono、`bg-muted/50`、`text-xs`
- **行 hover**：`hover:bg-accent`（#F5F5F5 柔和填充）
- 名称列用 Geist medium；序号/计数用 `font-mono tabular-nums`
- 外链箭头保留 `ExternalLink`

---

## 改动四：设计师卡片 — `src/components/DesignerGrid.tsx`

- 筛选 chip + 搜索框：与 FoundryTable 完全一致的胶囊样式
- **卡片** → PostScheduler featured-card 风格：`rounded-xl border bg-card p-4 hover:bg-accent transition`
- 设计师名：Geist medium；作品数：`font-mono tabular-nums`
- 国家/厂商：小型 chip 或 mono 文本
- **分页**：上一页/下一页 → 胶囊按钮，页码用 mono tabular-nums

---

## 改动五：About 页 — `src/pages/About.tsx`（内容最丰富）

逐节重做，目标是「编辑型长文」观感：

- **所有 section eyebrow**（「关于 type.fish」「数据概览」等）：从 `uppercase tracking-wide` → **Geist Mono、`text-muted-foreground`**（PostScheduler section-label 的 SF Mono #C0C0C0 感）
- H1「全球字体厂商目录」：Geist bold + `tracking-tight`，不 uppercase（已接近，微调）
- 统计网格：保留 hairline 网格（border 已自动变柔）；数字用 `font-mono tabular-nums`，label 用 mono eyebrow
- 国家分布标签 → 胶囊 chip（`rounded-full bg-muted`）
- 类型条形图：轨道 `bg-muted rounded-full`，填充 `bg-foreground rounded-full`
- 技术栈 tag → 胶囊 chip
- 参与贡献按钮 → 胶囊 CTA
- Colophon：mono 小字注脚

---

## 改动六：其余页面

- `Typefaces.tsx` / `Submit.tsx`（占位页）：「即将推出」居中，用 mono + muted 风格
- `NotFound.tsx`：404 用 Geist bold，容器加圆角
- `Footer.tsx`：基本自动适配（border 已变柔），保持不变或微调

---

## 不做的事（边界）

- ❌ 不改 max-w-5xl 宽度
- ❌ 不把表格改成 PostScheduler 式 list-row（属于结构重构，你选了「只重做样式」）
- ❌ 不引入彩色 badge（设计规范明确「不要引入与内容竞争的亮色」；现有数据也无 badge 需求）
- ❌ 不动搜索/筛选/分页逻辑、不改路由、不抽 Layout 组件（超出「重做样式」范围）
- ❌ 不删 `App.css`（未被引用的死文件，与本次无关）

---

## 验证

- dev server 已在 **http://localhost:8080** 跑着，改完直接热更新查看
- 逐页核对：首页表格、Designers 卡片、About 各 section、两个占位页、404
- 检查暗色模式 token 是否同步（虽然目前没启用 toggle）

## 文件清单（共 8 个）

1. `src/index.css` — token 基座（字体/颜色/圆角/排版）
2. `src/components/HeroSection.tsx`
3. `src/components/FoundryTable.tsx`
4. `src/components/DesignerGrid.tsx`
5. `src/pages/About.tsx`
6. `src/pages/Typefaces.tsx`
7. `src/pages/Submit.tsx`
8. `src/pages/NotFound.tsx`

（`Footer.tsx` 大概率不用动，确认后决定）