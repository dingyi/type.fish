# 把项目从 type.family 改名为 type.fish

## 现状
项目大部分地方其实**已经是 `type.fish`**（`package.json` name、`README.md` H1、`About.tsx` 的显示名、`hello@type.fish` 邮箱都已就位）。只剩三处收尾 + GitHub/本地文件夹。

## 执行步骤

### 1. 改源码里的 GitHub 链接
- `src/pages/About.tsx:180`：`https://github.com/dingyi/type.family` → `https://github.com/dingyi/type.fish`

### 2. GitHub 端重命名仓库（你已确认）
- `gh repo rename type.fish` 把 `dingyi/type.family` → `dingyi/type.fish`
- GitHub 会自动为旧仓库名建立 301 重定向，保留全部 commit/issue/star

### 3. 更新 git remote
- `git remote set-url origin https://github.com/dingyi/type.fish.git`

### 4. 提交 commit（你已确认）
- `git add src/pages/About.tsx`
- 提交信息：`chore: rename project to type.fish`（不 push，等你确认）

### 5. 重命名本地文件夹
- 把 `/Users/dingyi/Sites/Github/type.family` 改名为 `type.fish`
- 用 `mv` 实现（本 session 的 cwd 在文件夹内，改名后旧路径失效，但内容完整无损）
- ⚠️ 改名后**当前会话的工作目录会失效**——后续如果要继续操作，需要在新路径下重新进行

### 不需要改动的地方
- `package.json`（已是 `type.fish`）、`README.md`（已是 `# type.fish`）、`About.tsx` 显示名/邮箱（已是 type.fish）
- `index.html` 用的是中性的 "Type Foundry Directory"，不含项目名，不改
- `foundries.ts` 里 `github.com/font-store` 是某个字体厂商的数据，与本仓库无关，不动
- `font-family`、data 里"typeface family"等描述性文字，不动
- `.zcode/plans/...md` 里残留的 type.family 字样是本工具的本地规划笔记，不影响项目，不动

## 备注
- GitHub rename 后旧 URL 会 301 跳转，但 `git remote` 仍建议改成新 URL（已含在第 3 步）
- `dist/` 是 gitignored 的构建产物，下次 `bun run build` 会自动重新生成，无需手动改