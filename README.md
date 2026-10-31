# astro-openmoji

在 Astro 构建 Markdown 时，把源码中的原生 Unicode Emoji 转换为本地 [OpenMoji](https://openmoji.org/) SVG。

- Markdown 源文件保持不变
- 不使用客户端 JavaScript
- 不依赖 CDN，可离线部署
- 支持 ZWJ、肤色、旗帜及变体选择符等完整 Emoji 序列
- `astro dev` 按需提供 SVG，`astro build` 只复制实际使用的资源

## 安装

```bash
npm install astro-openmoji
```

本包面向 Astro 7 和 Node.js 22.12 或更高版本。

## 配置

```ts
// astro.config.ts
import { defineConfig } from "astro/config";
import openmoji from "astro-openmoji";

export default defineConfig({
  integrations: [openmoji()],
});
```

之后正常在 Markdown 中输入原生 Emoji：

```md
今天学 CMake 学得有些 😵‍💫，但总算跑通了 🚀
```

构建后的 HTML 类似：

```html
<p>
  今天学 CMake 学得有些
  <img class="openmoji" src="/openmoji/1F635-200D-1F4AB.svg" alt="😵‍💫" style="width:1em;height:1em;vertical-align:-0.125em;display:inline-block">
  ，但总算跑通了
  <img class="openmoji" src="/openmoji/1F680.svg" alt="🚀" style="width:1em;height:1em;vertical-align:-0.125em;display:inline-block">
</p>
```

`alt` 始终保留原 Emoji。内联样式只负责把一 em 大小的图片与文字基线自然对齐。

## 配置项

```ts
openmoji({
  style: "color",
  assetDir: "openmoji",
  className: "openmoji",
});
```

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `style` | `"color" \| "black"` | `"color"` | 使用 OpenMoji 彩色或黑色 SVG |
| `assetDir` | `string` | `"openmoji"` | 输出目录和公共 URL 路径，可使用 `emoji/assets` 这样的相对路径 |
| `className` | `string` | `"openmoji"` | 生成的 `<img>` 使用的单个 CSS 类名 |

Astro 的 `base` 会自动加入图片 URL。例如 `base: "/blog"` 时，图片地址为 `/blog/openmoji/1F680.svg`，资源仍输出到 `dist/openmoji/`。

## 转换范围

插件只处理 HAST 普通文本节点，因此段落、标题、列表、引用和链接文字中的 Emoji 会被替换。以下内容不会被替换：

- 行内代码和代码块中的文本
- 原始 HTML 属性
- URL 属性
- frontmatter
- OpenMoji 中不存在的 Emoji；这类字符会原样保留

匹配使用 `emoji-regex`，不会把 ZWJ、肤色或旗帜序列拆成单个字符。插件先查找完整码点文件；如果不存在，再去除 `FE0E` / `FE0F` 变体选择符重试。例如 `❤️` 会使用 `2764.svg`。

## 开发与生产构建

在 `astro dev` 中，integration 通过 Vite 开发服务器中间件从已安装的 `openmoji/<style>/svg/` 按需返回 `/openmoji/*.svg`，无需复制到 `public/`。

在 `astro build` 中，Rehype 转换会记录本次构建实际引用的文件；构建完成后仅将这些 SVG 复制到 `dist/<assetDir>/`。Markdown、`public/` 和其他工作区文件均不会被修改。

Astro 7 默认使用 Sätteri，而 Rehype 插件只能运行在 Unified 流水线中。因此 integration 会自动选择官方 `@astrojs/markdown-remark` Unified processor；如果项目已经配置 Unified，则会保留现有选项并追加本插件。显式使用 Sätteri 插件的项目需要先确认改用 Unified 后功能仍符合预期。

## 单独使用 Rehype 插件

高级用户可以直接注册底层插件：

```ts
import { rehypeOpenmoji } from "astro-openmoji/rehype";

// unified().use(rehypeOpenmoji, { style: "black", base: "/blog" })
```

直接使用时支持与 integration 相同的三个选项，另可通过 `base` 设置 URL 前缀。单独使用 Rehype 插件只转换 HAST，不负责开发服务器或生产资源复制。

## 本项目开发

```bash
npm install
npm test
npm run build
npm pack --dry-run
```

测试包含独立 Rehype 转换、真实 `astro build` fixture、`base: "/blog"`、最小资源输出，以及真实 `astro dev` SVG 请求。

## 通过 GitHub Actions 发布到 npm

仓库包含两个发布工作流：

- `Bootstrap publish to npm`：仅用于第一次创建 npm 包，需要一个临时 `NPM_TOKEN`。
- `Publish to npm`：之后在 GitHub Release 发布时运行，使用 npm Trusted Publishing（OIDC），不保存 npm Token。

### 第一次发布

1. 确保 GitHub 仓库 `xjn2005/astro-openmoji` 是公开仓库，并将当前项目推送到 `main`。
2. 在 npm 创建一个短有效期、具备公开包发布权限的 Granular Access Token。若 npm 账户启用了发布 2FA，请按 npm 页面提示允许该自动化 Token 绕过发布 2FA。
3. 打开 GitHub 仓库的 **Settings → Secrets and variables → Actions**，新增 Repository secret：`NPM_TOKEN`。
4. 打开 **Actions → Bootstrap publish to npm → Run workflow**。它会依次执行安装、测试、构建、打包预检，并发布 `0.1.0`；不要重复运行同一版本。
5. 在 npm 确认 `astro-openmoji` 已创建且包含 provenance 信息。

首次工作流使用 `--provenance`，因此 GitHub 仓库必须公开。Token 不要写入文件、提交记录或工作流源码。

### 切换到 Trusted Publishing

首次发布成功后，在 npm 的 `astro-openmoji` 包设置中添加 GitHub Actions Trusted Publisher，填写：

| 字段 | 值 |
| --- | --- |
| Organization or user | `xjn2005` |
| Repository | `astro-openmoji` |
| Workflow filename | `publish.yml` |
| Environment | 留空 |

保存后：

1. 删除 GitHub Repository secret `NPM_TOKEN`。
2. 禁用或删除 `.github/workflows/bootstrap-publish.yml`，避免误触首次发布流程。
3. 在 Trusted Publisher 创建后的两天内完成一次正式 OIDC 发布验证；验证成功后，可在 npm 包设置中进一步禁止 Token 发布并要求 2FA。

长期工作流只授予 `contents: read` 和 `id-token: write`，不会读取 npm Token。Trusted Publishing 会自动生成 npm provenance。

### 发布后续版本

1. 更新 `package.json` 和 `package-lock.json` 中的版本，例如运行 `npm version patch --no-git-tag-version`。
2. 运行 `npm test`、`npm run build` 和 `npm pack --dry-run`，然后提交并推送版本改动。
3. 为该提交创建匹配的标签，例如版本为 `0.1.1` 时使用 `v0.1.1`。
4. 在 GitHub 创建并发布使用该标签的 Release。

`Publish to npm` 会检出 Release 标签，并在发布前验证标签严格等于 `v${package.json.version}`。两者不一致时工作流会失败，不会发布。

## 许可证与署名

`astro-openmoji` 插件代码使用 [MIT License](./LICENSE)。OpenMoji 图形资产由 OpenMoji 项目提供，使用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)；详情见 [ATTRIBUTION.md](./ATTRIBUTION.md)。

建议在网站页脚或关于页面中显示：

```text
Emoji by OpenMoji — CC BY-SA 4.0
```
