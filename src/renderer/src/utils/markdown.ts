import MarkdownIt from 'markdown-it'
import Shiki from '@shikijs/markdown-it'
import type { Token } from 'markdown-it'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 先添加 Shiki 插件
md.use(
  await Shiki({
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark'
    },
    defaultColor: false
  })
)

// 在 Shiki 插件添加后，保存原始渲染器引用
const originalFenceRenderer = md.renderer.rules.fence

// 自定义围栏代码块渲染规则
md.renderer.rules.fence = function (
  tokens: Token[],
  idx: number,
  options: MarkdownIt.Options,
  env: any,
  self: MarkdownIt.Renderer
) {
  const token = tokens[idx]
  const lang = token.info.trim() || 'text'
  const code = token.content

  // 使用 Shiki 渲染代码
  const highlighted = originalFenceRenderer
    ? originalFenceRenderer(tokens, idx, options, env, self)
    : `<pre><code class="language-${lang}">${md.utils.escapeHtml(code)}</code></pre>`

  return `
    <div class="code-block-wrapper" data-code="${md.utils.escapeHtml(code)}">
      <div class="code-block-header">
        <span class="code-lang">${lang}</span>
        <button class="copy-code-btn" title="复制代码">
          <span class="icon-[ri--file-copy-line] w-4 h-4"></span>
        </button>
      </div>
      <div class="shiki-wrapper">${highlighted}</div>
    </div>
  `
}

// 渲染 Markdown 内容
export const renderMarkdown = (content: string): string => {
  return md.render(content)
}

// 复制代码函数
export const copyCodeToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('复制失败:', err)
    return false
  }
}
