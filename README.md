# astro-openmoji

[![npm version](https://img.shields.io/npm/v/astro-openmoji.svg)](https://www.npmjs.com/package/astro-openmoji)
[![Publish to npm](https://github.com/xjn2005/astro-openmoji/actions/workflows/publish.yml/badge.svg)](https://github.com/xjn2005/astro-openmoji/actions/workflows/publish.yml)

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
  <img class="openmoji" src="/openmoji/1F635-200D-1F4AB.svg" alt="😵‍💫" style="width:var(--openmoji-size,1.25em);height:var(--openmoji-size,1.25em);vertical-align:var(--openmoji-vertical-align,-0.22em);display:inline-block">
  ，但总算跑通了
  <img class="openmoji" src="/openmoji/1F680.svg" alt="🚀" style="width:var(--openmoji-size,1.25em);height:var(--openmoji-size,1.25em);vertical-align:var(--openmoji-vertical-align,-0.22em);display:inline-block">
</p>
```

`alt` 始终保留原 Emoji。内联样式默认以 `1.25em` 渲染图片并对齐文字基线；尺寸仍跟随当前字体缩放，不会引入客户端 JavaScript。

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

### 尺寸与对齐

OpenMoji 图形在 SVG 画布内通常带有留白，因此插件默认使用 `1.25em`，让可见图形更接近原生 Emoji 的视觉高度。可以通过 CSS 自定义属性调整生成图片，不需要使用 `!important`：

```css
.openmoji {
  --openmoji-size: 1.1em;
  --openmoji-vertical-align: -0.15em;
}
```

| CSS 自定义属性 | 默认值 | 说明 |
| --- | --- | --- |
| `--openmoji-size` | `1.25em` | 同时控制生成图片的宽度和高度 |
| `--openmoji-vertical-align` | `-0.22em` | 控制图片相对文字基线的垂直位置 |

如果需要恢复旧版外观，可设置 `--openmoji-size: 1em` 和 `--openmoji-vertical-align: -0.125em`。使用自定义 `className` 时，将这些变量设置在对应类名上即可。

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

## 许可证与署名

`astro-openmoji` 插件代码使用 [MIT License](./LICENSE)。OpenMoji 图形资产由 OpenMoji 项目提供，使用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)；详情见 [ATTRIBUTION.md](./ATTRIBUTION.md)。

建议在网站页脚或关于页面中显示：

```text
Emoji by OpenMoji — CC BY-SA 4.0
```
