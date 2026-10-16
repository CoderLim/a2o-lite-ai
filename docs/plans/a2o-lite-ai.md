# 新增 a2o-lite-ai 固定模版页（可开发版）

`/a2o-lite-ai`：用户上传两张参考图，替换模版里的两个舞者。复用 `/api/genjutsu/*`（`attempt → upload-url → upload → seal-inputs → generate → status`），不新增独立 API，不改首页 / Crazy Frog / Smalltown / Zombie Hug 行为。首版无 Preview，默认 480p。

本文档已对照最新 `main`（含 `fa9b72c` 方案）修订。**只定行为，不含实施。**

## 0. 本轮核对（采纳 / 修正）

| Review 点                                 | 代码事实                                                                                                                                                                                                                                                                                | 结论                                                                                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 不能用整个 Seedance 家族当 A2O 可用集     | `seedance.ts` 会拒绝真人肖像；`config` 注释写明 Fal Seedance 与 Higgsfield 托管 Seedance 的真人策略不同。`seedance-seeapi.ts` 注明默认上游常只改主要人物。仓库内 **没有** A2O 双人真人片在 Fal / SeeAPI / WaveSpeed / Volcengine 上的通过记录。                                         | **采纳。** 首版 allowlist 只有 `seedance-higgsfield`。不要调用 `isSeedanceFamilyProvider()` 当产品开关。                                                        |
| 产品 Prompt 不要写死 `@Image 1`           | `buildSeedanceWorkflowPrompt` 把 `userPrompt` **原样**放进 `TASK INSTRUCTION`，另起一行 `Reference N = <渠道 token>`。Higgsfield/SeeAPI 默认 `@Video1` `@Image1`；WaveSpeed 传入 `@Video 1` `@Image 1`；Volcengine 传入 `@视频1` `@图像1`。写死 `@Image 1` 不会被改写成其他渠道 token。 | **采纳。** 产品 Prompt 只用 `Reference 1` / `Reference 2`。系统层已有映射，A2O 不自建 token 转换。                                                              |
| fallback 必须是完整 `{ provider, model }` | `objects-swap` + `seedance-higgsfield` 的现成解析是 model `bytedance/seedance-2.5/video-edit`（`SEEDANCE_HIGGSFIELD_EDIT_MODEL_ID`）。只改 provider 字符串会配上旧 Genjutsu model。`normalizeProvider` 把未知字符串静默收成 `higgsfield`。                                              | **采纳。** 走现成「按 provider+mode 解析完整 target」的函数；不支持则报错，不静默回落。                                                                         |
| 已创建任务不因 env 改绑                   | `upload-url` 优先用已有 task 的 provider/model；`generate` 有 task 时用 `task.provider` / `task.model`。                                                                                                                                                                                | **已成立，测试覆盖即可。**                                                                                                                                      |
| 首版无历史 Prompt                         | A2O 尚未上线。                                                                                                                                                                                                                                                                          | **修正上一版。** 首版只允许当前正式 Prompt，**不要**预置空的 legacy 数组内容。结构上留 `LEGACY_A2O_LITE_PROMPTS`（初始 `[]`），下次改文案时把已发布旧串放进去。 |
| seal 未知产品落入 Zombie                  | `seal-inputs.ts` 非 smalltown/crazy-frog 会用 Zombie key。                                                                                                                                                                                                                              | **仍成立，实施时必须加 A2O 分支。**                                                                                                                             |

已认可、本轮不改的决策：固定 `objects-swap`、4:3、480p/720p、恰好两图、`useDefaultTemplate`、en/ja/ko、复制精简 Smalltown panel、不抽 FixedTemplate 框架、不改全局定价与其他产品路由。

---

## 1. Provider（首版）

### 1.1 唯一允许的 target

```ts
{
  provider: 'seedance-higgsfield',
  model: 'bytedance/seedance-2.5/video-edit', // objects-swap
}
```

用现有 `resolveGenjutsuProviderTargetForProvider('seedance-higgsfield', 'objects-swap')`（或同等未导出则抽一个只返回上述常量的 `resolveA2oLiteAiProviderTarget`）得到 **成对** 结果。禁止手写 `{ provider: 'seedance-higgsfield', model: 别处来的 model }`。

### 1.2 解析优先级（仅 `product === 'a2o-lite-ai'` 的新任务）

A2O **不**跟随 `GENJUTSU_OBJECT_SWAP_PROVIDER`（默认是旧 `higgsfield`）。

| 情况                                                                                    | 行为                                                  |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 任务已存在                                                                              | 用 task 上持久化的 provider + model，忽略当前 env     |
| `GENJUTSU_PRODUCT_PROVIDER` 未设置或空白                                                | 上表默认 target                                       |
| 设为 `seedance-higgsfield`                                                              | 同一默认 target（完整 pair）                          |
| 设为其他已知 provider（含 `seedance` / seeapi / wavespeed / volcengine / `higgsfield`） | **配置错误**，attempt/upload-url 返回明确错误，不生成 |
| 无效字符串                                                                              | 同上。不要走 `normalizeProvider` 的静默 `higgsfield`  |
| 首页 / Crazy Frog / Smalltown                                                           | 仍走现有 `resolveProductProviderTarget`，本函数不介入 |

扩展：以后某渠道通过真人双图整片测试后，只把该 provider 加入 `A2O_LITE_ALLOWED_PROVIDERS`，并用现有 per-provider resolver 取 **匹配的** model。未加入前一律拒绝。

### 1.3 积分

- Route `loader` 调用 **同一** `resolveA2oLiteAiProviderTarget()`，把 `provider` 传给 Panel。
- Panel：`estimateGenjutsuCreditsForProvider({ provider, durationSeconds: 19.948005, resolution, aspectRatio: '4:3' })`。
- 服务端扣费仍以 task 绑定的 provider 报价为准（`customerPriceBasisUsd ?? providerCostUsd`）。
- 不改其他产品的硬编码预估，不改积分包。

---

## 2. 产品锁

`assertA2oLiteAiInputs` 在 generate 必跑。attempt / upload-url 对 A2O 提前拒绝非法 mode / resolution。generate 以 **任务 options** 为准，不只信请求体。

| 字段               | 值                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| product            | `a2o-lite-ai`                                                                                                     |
| mode               | `objects-swap`                                                                                                    |
| aspectRatio        | `4:3`                                                                                                             |
| resolution         | `480p` \| `720p`（默认 UI `480p`）                                                                                |
| 图                 | 恰好 2 张 `image/*`                                                                                               |
| useDefaultTemplate | `true`                                                                                                            |
| prompt             | 精确等于当前正式 Prompt，或（将来）`LEGACY_A2O_LITE_PROMPTS` 里的已发布全文。禁止 includes/startsWith，禁止自定义 |

生命周期：attempt 写入的 mode / product / provider / model，upload-url 与 generate 不得按 env 重算覆盖。

---

## 3. Prompt

产品常量只用逻辑引用。发色与开场远近只标识 **原片** 角色，不约束替换后外观。通用替换/运镜由 `buildSeedanceWorkflowPrompt` 负责，产品文案不复制那些段落。

```text
In the original source video, identify two distinct dancers:

Dancer A: the dancer with warmer auburn or reddish-brown hair in the original video, generally nearer the camera in the opening shots.
Replace Dancer A with Reference 1.

Dancer B: the dancer with darker black or dark-brown hair in the original video, generally farther from the camera in the opening shots.
Replace Dancer B with Reference 2.

These labels refer to the two original dancers before replacement. Keep each original dancer's role consistently assigned across solo close-ups, two-person shots, position changes, and full-body dance shots.

Do not exchange the two assignments or apply one reference to both dancers.
```

最终 Higgsfield objects-swap 串应同时包含：任务指令里的 `Reference 1` / `Reference 2`，以及系统行 `Reference 1 = @Image1`、`Reference 2 = @Image2`（`referenceMappingLine`）。不要在 A2O 模块里替换 token。

单测：对 `buildSeedanceWorkflowPrompt({ mode: 'objects-swap', userPrompt: A2O_PROMPT, imageCount: 2 })` 断言上述映射；再对 WaveSpeed / Volcengine 的 **现有** token 入参各断言一次映射行（证明逻辑引用可移植），**不**因此把这些渠道加入 A2O allowlist。既有 Crazy Frog / Smalltown prompt 快照测试不得因本次改动失败——本次不改 `buildSeedanceWorkflowPrompt` 行为，除非单测证明 `Reference N` 在 objects-swap 任务指令里没有对应映射行（当前代码已有该行，预期不需要改共享函数）。

---

## 4. 模板与 R2

- 公开：`public/videos/a2o-lite-ai-tpl.mp4`，海报 `a2o-lite-ai-tpl-poster.jpg`
- 时长常量：`14.941016`（`a2o-lite-ai-twins-tpl-15s.mp4`）；画幅 `4:3`（960×720）
- R2：`genjutsu/templates/a2o-lite-ai-v1.mp4`（`A2O_LITE_AI_TEMPLATE_VIDEO_KEY` 可覆盖）
- `seal-inputs`：`product === a2o-lite-ai` 时用 A2O key，**写在 Zombie 回落之前**
- `sealGenjutsuTemplateR2Inputs`：该 key 走 `ensureA2oLiteAiTemplateInR2`，与另外两个产品并列
- Workers：缺对象则失败，不 seed、不换其他产品 key
- 上线前：上传该 key，核对 `video/mp4`、大小、时长、可读；公开文件与 R2 为同一版本

---

## 5. UI / i18n

- 复制精简 `A2oLiteAiGeneratorPanel`（Smalltown 为底）。不抽共享状态机，不改首页 `GeneratorPanel`。
- 文案只进 `messages/en.json`、`ja.json`、`ko.json`。日韩为真实翻译。隐藏 Prompt 不进 i18n。用户可见文案不写供应商名。
- canonical / hreflang / sitemap / `llms.txt` 覆盖 en/ja/ko。基础 title、description、H1、FAQ。
- Credit Gate、支付后续跑、刷新恢复沿用 Smalltown 客户端模式。

---

## 6. 文件与顺序

1. `src/modules/a2o-lite-ai/constants.ts` — prompt、aspect、resolutions、duration、默认 provider id
2. `src/modules/a2o-lite-ai/provider.ts` — `resolveA2oLiteAiProviderTarget()`（完整 pair + 上表错误）
3. `src/modules/a2o-lite-ai/assert.ts`
4. `src/modules/genjutsu/types.ts`、`workflow.ts` — product id allowlist（`isGenjutsuProductId` 仍只表示「产品页」，**不**表示 A2O 可用任意 Seedance）
5. `src/modules/genjutsu/storage.ts`、`src/config/index.ts`、`.env.example`
6. `attempt.ts`、`upload-url.ts`、`seal-inputs.ts`、`generate.ts` — 只加 A2O 分支
7. 资产、`A2oLiteAiGeneratorPanel.tsx`、`src/routes/a2o-lite-ai.tsx`（loader 传 provider）
8. messages、SiteHeader、`motion-templates.ts`、sitemap、`llms.txt`
9. 测试见下

不做：`/api/a2o-lite-ai/*`、Billing/Storage 重构、全局定价、Provider Registry、Preview、其他热点页改动。

---

## 7. 测试

**Provider**

- 未配置 → `{ seedance-higgsfield, bytedance/seedance-2.5/video-edit }`
- `GENJUTSU_PRODUCT_PROVIDER=seedance-higgsfield` → 同上
- `seedance` / `higgsfield` / `seedance-wavespeed` / 乱字符串 → 明确错误，且 model 不是 `higgsfield/genjutsu/object-swap/v1.0`
- attempt、upload-url、generate 使用同一 pair
- 任务已绑定后改 env，generate 仍用旧 pair
- 同一 env 下首页与 Crazy Frog/Smalltown 的 `resolveProductProviderTarget` 结果与改动前一致

**Prompt**

- 正式 Prompt 含 `Reference 1` 与 `Reference 2`，不含渠道 token
- objects-swap 最终串含映射行；Higgsfield 为 `@Image1`/`@Image2`
- 用 WaveSpeed/Volcengine 的 references 入参时映射行换成对应 token（共享函数回归，非 A2O 路由）
- 篡改 Prompt 被 assert 拒绝；`LEGACY` 为空时只有当前串通过
- 不改既有产品 prompt 测试期望

**链路**

- 两图、固定模板 seal、扣费、结果进 R2、刷新恢复
- 错 mode/aspect/resolution/图数拒绝
- 模板 key 不是 Zombie / Crazy Frog / Smalltown
- 余额不足 Credit Gate；支付后续跑；明确失败退款；提交结果不确定时保持现有冻结
- `pnpm build` 与相关单测通过

**上线人工：** 两张不同人物图跑完整约 20 秒，检查单人特写与双人舞不串身份；对照 Higgsfield 账单与积分。确认模版、BGM、肖像授权后再对外开放。

---

## 8. 剩余风险与是否可开发

可进入开发。剩余风险：

- 身份稳定性取决于 Seedance 2.5 video-edit 对 ~20s 双人片的实际效果，只能靠上线前真人样片，不能靠单测保证。
- 复制 Panel 会重复上传/恢复代码；首版接受，不在本页抽取。
- 若生产 `GENJUTSU_PRODUCT_PROVIDER` 已设为非 `seedance-higgsfield`，A2O 会报配置错误而不是跟着 Crazy Frog 走。这是故意的；上线前确认该 env，或接受 A2O 在该配置下不可用，直到该渠道通过双人测试并加入 allowlist。
