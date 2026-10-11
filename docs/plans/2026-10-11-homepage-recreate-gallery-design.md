# 首页静态作品墙 + Recreate

## 概述

在首页生成区下方把现有 `DemoVideoGallery` 升级为 Higgsfield 风格的静态作品墙：hover 显示 Recreate，点击后把模版视频、参考图、提示词等参数填入 Hero 生成区。同时移除首页底部的 `StickyComposer` 悬浮生成器，仅保留 Hero 内唯一一份 `GeneratorPanel`。不改 genjutsu API 生命周期，Generate 仍走现有 `attempt → upload → seal → generate`。

## 已定决策

- **内容源**：静态 demo（扩展现有 [`src/components/landing/DemoVideoGallery.tsx`](../../src/components/landing/DemoVideoGallery.tsx)），不做 CMS/社区。
- **预填方式**：Recreate 时从 `public/` URL `fetch` → `File` → 填入生成区（与本地上传同构，零 API 改动）。
- **R2**：点 Recreate 不上传；用户点 Generate 时仍按现有链路上传并 seal（与手动选同一文件一致）。模版服务端复用（zombie-hug 的 `useDefaultTemplate`）留作后续优化，本阶段不做。
- **UI 范围**：hover 显示 Recreate（参考 Higgsfield）；移动端常显可点击按钮，不做 Community tabs / expand 全屏 / 侧栏工具。作者名等元数据可做轻量静态字段，非必须。
- **首页生成器**：只保留 Hero 中的 `GeneratorPanel`；在 `src/routes/index.tsx` 移除 `<StickyComposer />` 及 import。确认无其他引用后可删除 `StickyComposer.tsx`。本阶段不再为 Recreate 引入全局或模块级 draft store。

## 架构

```mermaid
flowchart LR
  Gallery[DemoVideoGallery] -->|onRecreate(work)| Hero[Hero state / callback]
  Hero -->|recreate request with id| HeroPanel[Hero GeneratorPanel]
  HeroPanel -->|fetch assets + validate + populate| HeroPanel
  HeroPanel -->|scrollIntoView| HeroAnchor["#hero-generator"]
  HeroPanel -->|upload File then| Pipeline["attempt → upload → seal → generate"]
```

首页只有一份 `GeneratorPanel`，不需要跨实例同步。由 `Hero` 管理一次性 Recreate 事件（例如 `{ requestId, work }`），通过 props 传给 `GeneratorPanel`；`DemoVideoGallery` 通过 `onRecreate(work)` 回调触发。`requestId` 每次点击都变化，允许重复点击同一作品。Recreate 预填是**一次性应用**，用户后续手动编辑 prompt / 文件 / 分辨率仍由原有 `GeneratorPanel` 本地 state 管理；不引入模块级 store、Context 或另一套生成状态。

## 数据模型

新建 `src/components/landing/demo-works.ts`（或扩写 gallery 文件）定义：

```ts
type DemoWork = {
  id: string;
  result: { src: string; poster: string; aspect: 'portrait' | 'landscape' };
  labelKey: string; // i18n
  mode: 'motion-transfer' | 'objects-swap';
  prompt: string; // 或 i18n key
  resolution?: '480p' | '720p' | '1080p';
  sourceVideo: string; // public URL, e.g. /videos/demos/.../source.mp4
  referenceImages: string[]; // public image URLs
};
```

现有 5 条 demo **只有成品视频**，没有 source/reference。实现时：

- 配置层先写好字段；
- 为至少 **1～2 条**可 recreate 的作品补齐 `public/videos/demos/<id>/` 下的 `source.mp4` + 参考图（其余条目只展示且不提供可操作的 Recreate，不使用与成品不匹配的占位 source/reference）。

## 关键改动

### 1. Hero 单实例 Recreate 预填

- `Hero.tsx` 持有一次性 Recreate request，`DemoVideoGallery` 接收 `onRecreate(work)`；通过 props 把 request 传给唯一的 `GeneratorPanel`，**不新增 `generator-draft-store`**。
- `GeneratorPanel.tsx` 接收 request 后按顺序 `fetch` 模版视频/图片 → 转成 `File` → 复用手动上传的媒体校验（视频类型、大小、时长 4–30s，图片类型/大小/最多 8 张）→ 构建 `MediaItem`，确保视频带 `durationSeconds`，使积分预估仍正常。
- 所有素材下载并校验完成后，再一次性覆盖 `mode` / `prompt` / `resolution` / `video` / `images`；失败 toast，保留原有输入，不出现半预填状态。
- 使用 `AbortController` 或单调递增 `requestId` 防止连续点击作品导致旧请求覆盖新请求；按钮显示 loading。生成过程中禁止触发新的 Recreate，避免干扰正在进行的任务。
- 明确 `MediaItem` Object URL 的所有权与释放时机；替换旧文件、删除文件和组件卸载时避免泄漏或释放仍在使用的 URL。Recreate 与手动上传共用同一校验/构建入口。
- 未登录访客可以浏览作品；若允许访客预填后跳转登录，需支持通过作品 ID 恢复预填；否则明确要求登录后执行 Recreate，避免登录后丢失草稿。
- 不改变 `/api/genjutsu/*` 生命周期（符合 higgsfield-genjutsu-pipeline 规则）。

### 2. 升级 DemoVideoGallery UI

- 卡片 `relative`；默认隐藏 overlay，`:hover` / `focus-within` 显示底部右侧 **Recreate**（高对比色按钮 + 复制图标；颜色贴近现有品牌琥珀，避免强行 #CCFF00）。
- 点击 Recreate：`onRecreate(work)` → 加载并应用预填 → `document.getElementById('hero-generator')?.scrollIntoView({ behavior: 'smooth' })`（也可立即滚动并在 Hero 展示加载中状态）。
- 保留现有网格（3 竖 + 2 横）即可，不必上真 masonry；hover 交互是重点。

### 3. Hero 接线 + 移除 StickyComposer

- [`Hero.tsx`](../../src/components/landing/Hero.tsx) 保留 `GeneratorPanel` + `DemoVideoGallery`，由 Hero 用 props / callback 连通两者。
- [`src/routes/index.tsx`](../../src/routes/index.tsx) 删除 `StickyComposer` 的 import 和 `<StickyComposer />`，不要影响页头、Hero、SEO 区块、Footer 等其余布局。
- `StickyComposer.tsx` 若确认没有其他使用者，可删除未引用组件文件，避免留死代码；不再添加第二份 `GeneratorPanel`。

### 4. i18n

在现有 `messages/en.json`、`messages/ja.json`、`messages/ko.json` 增加：`site.demo.recreate`、必要时作品标题/提示词 key；不添加已不存在的 `messages/zh.json`。

## 明确不做

- 社区 trending/new tabs、后台 CMS、用户公开作品流。
- 改 seal/generate 以跳过模版视频上传。
- 引入跨实例 draft store、Context 或 Sticky 专属上传链路；首页只保留 Hero 单实例。

## 验证

- 桌面 hover / 键盘 focus 出 Recreate，移动端可直接点；点击后 Hero 填好 mode/prompt/视频/图并滚动到 `#hero-generator`。
- 首页已无 Sticky 悬浮输入框，且只有一个 `GeneratorPanel` 实例；页面其余区块布局保持不变。
- 预填与手动上传共享视频/图片校验；`durationSeconds` 正确并展示符合当前 provider 的积分预估。
- 连续点击不同作品仅最后一次生效；下载失败不破坏原有输入；生成中不能用 Recreate 覆盖正在使用的媒体。
- 未登录访客的 Recreate → 登录路径符合选定策略，没有无提示丢失输入。
- 登录后 Generate 仍走 attempt → upload-url → seal-inputs → generate → status；手动上传与 Recreate 分别做回归。
- `pnpm build` 通过。

## 实现待办

1. `src/routes/index.tsx` 移除 StickyComposer 挂载和 import；确认无其他使用后删除组件文件
2. 定义 `DemoWork` 静态配置 + 至少 1～2 条真正可 recreate 作品的 public 素材路径
3. `Hero` 通过 props / callback 接线；`GeneratorPanel` 处理单实例预填（fetch→File→共用校验→原子更新、竞态/URL 清理）
4. `DemoVideoGallery` 增加桌面 hover / 键盘 focus、移动端可点击的 Recreate + 滚动 Hero
5. 补充 en/ja/ko recreate / demo 相关 i18n keys
6. 完成未登录策略，手动走通 Recreate、手动上传和 Generate 回归 + build 校验
