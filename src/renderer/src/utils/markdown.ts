import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value
        return `<pre class="hljs-code-block" data-lang="${lang}"><code class="hljs language-${lang}">${highlighted}</code></pre>`
      } catch (err) {
        console.log(err)
      }
    }

    return `<pre class="hljs-code-block"><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// 自定义代码块渲染规则，添加复制按钮
md.renderer.rules.code_block = function (tokens: any, idx: any) {
  const token = tokens[idx]
  const content = token.content
  const lang = token.info || ''

  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(content, { language: lang }).value
      return `
        <div class="code-block-wrapper" data-code="${md.utils.escapeHtml(content)}">
          <div class="code-block-header">
            <span class="code-lang">${lang}</span>
            <button class="copy-code-btn" title="复制代码">
              <span class="icon-[ri--file-copy-line] w-4 h-4"></span>
            </button>
          </div>
          <pre class="hljs-code-block" data-lang="${lang}"><code class="hljs language-${lang}">${highlighted}</code></pre>
        </div>
      `
    } catch {
      // ignore
    }
  }

  return `
    <div class="code-block-wrapper" data-code="${md.utils.escapeHtml(content)}">
      <div class="code-block-header">
        <span class="code-lang">text</span>
        <button class="copy-code-btn" title="复制代码">
          <span class="icon-[ri--file-copy-line] w-4 h-4"></span>
        </button>
      </div>
      <pre class="hljs-code-block"><code class="hljs">${md.utils.escapeHtml(content)}</code></pre>
    </div>
  `
}

// 自定义围栏代码块渲染规则
md.renderer.rules.fence = function (tokens: any, idx: any) {
  const token = tokens[idx]
  const content = token.content
  const lang = token.info.trim() || 'text'

  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(content, { language: lang }).value
      return `
        <div class="code-block-wrapper" data-code="${md.utils.escapeHtml(content)}">
          <div class="code-block-header">
            <span class="code-lang">${lang}</span>
            <button class="copy-code-btn" title="复制代码">
              <span class="icon-[ri--file-copy-line] w-4 h-4"></span>
            </button>
          </div>
          <pre class="hljs-code-block" data-lang="${lang}"><code class="hljs language-${lang}">${highlighted}</code></pre>
        </div>
      `
    } catch {
      // ignore
    }
  }

  return `
    <div class="code-block-wrapper" data-code="${md.utils.escapeHtml(content)}">
      <div class="code-block-header">
        <span class="code-lang">${lang}</span>
        <button class="copy-code-btn" title="复制代码">
          <span class="icon-[ri--file-copy-line] w-4 h-4"></span>
        </button>
      </div>
      <pre class="hljs-code-block"><code class="hljs">${md.utils.escapeHtml(content)}</code></pre>
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
