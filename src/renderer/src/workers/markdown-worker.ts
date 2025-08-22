import MarkdownIt from 'markdown-it'
import Shiki from '@shikijs/markdown-it'
import type { Token } from 'markdown-it'

let mdInstance: MarkdownIt | null = null

const initializeMarkdown = async () => {
  if (mdInstance) return mdInstance

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  })

  md.use(
    await Shiki({
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark'
      },
      defaultColor: false
    })
  )

  const originalFenceRenderer = md.renderer.rules.fence

  md.renderer.rules.fence = function (
    tokens: Token[],
    idx: number,
    options: MarkdownIt.Options,
    env: Record<string, unknown>,
    self: MarkdownIt.Renderer
  ) {
    const token = tokens[idx]
    const lang = token.info.trim() || 'text'
    const code = token.content

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

  mdInstance = md
  return md
}

interface WorkerMessage {
  id: string
  content: string
}

interface WorkerResponse {
  id: string
  success: boolean
  result?: string
  error?: string
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, content } = event.data

  try {
    const md = await initializeMarkdown()
    const rendered = md.render(content)

    self.postMessage({
      id,
      success: true,
      result: rendered
    } as WorkerResponse)
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as WorkerResponse)
  }
}
