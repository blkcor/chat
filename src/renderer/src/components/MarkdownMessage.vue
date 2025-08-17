<template>
  <div class="markdown-content" v-html="renderedContent" @click="handleClick"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown, copyCodeToClipboard } from '@renderer/utils/markdown'

const props = defineProps<{
  content: string
}>()

const renderedContent = computed(() => {
  return renderMarkdown(props.content)
})

// 处理点击事件，特别是复制按钮
const handleClick = async (event: Event) => {
  const target = event.target as HTMLElement

  // 检查是否点击了复制按钮
  if (target.classList.contains('copy-code-btn') || target.closest('.copy-code-btn')) {
    event.preventDefault()

    const button = target.classList.contains('copy-code-btn') ? target : target.closest('.copy-code-btn') as HTMLElement
    const codeWrapper = button.closest('.code-block-wrapper') as HTMLElement

    if (codeWrapper) {
      // 从data-code属性获取原始代码
      const code = codeWrapper.getAttribute('data-code')
      if (code) {
        const success = await copyCodeToClipboard(code)

        if (success) {
          // 显示复制成功反馈
          const originalIcon = button.innerHTML
          button.innerHTML = '<span class="icon-[ri--check-line] w-4 h-4"></span>'
          button.classList.add('copied')

          setTimeout(() => {
            button.innerHTML = originalIcon
            button.classList.remove('copied')
          }, 2000)
        }
      }
    }
  }
}
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  color: var(--text-primary);
}

/* 全局样式，不使用 scoped */
</style>

<style>
/* Markdown 内容样式 */
.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 1.5rem 0 1rem 0;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
}

.markdown-content h1 {
  font-size: 1.5rem;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.markdown-content h2 {
  font-size: 1.3rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3rem;
}

.markdown-content h3 {
  font-size: 1.1rem;
}

.markdown-content p {
  margin: 1rem 0;
  line-height: 1.6;
}

.markdown-content ul,
.markdown-content ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-content li {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.markdown-content blockquote {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  border-left: 4px solid var(--color-primary);
  background: var(--bg-accent);
  border-radius: 0 0.5rem 0.5rem 0;
}

.markdown-content blockquote p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.markdown-content th,
.markdown-content td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.markdown-content th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-content tr:hover {
  background: var(--bg-accent);
}

.markdown-content a {
  color: var(--color-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all var(--transition-normal);
}

.markdown-content a:hover {
  border-bottom-color: var(--color-primary);
}

.markdown-content strong {
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-content em {
  font-style: italic;
  color: var(--text-secondary);
}

.markdown-content code {
  background: var(--bg-secondary);
  color: var(--color-primary);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85em;
  border: 1px solid var(--border-color);
}

/* 代码块样式 */
.code-block-wrapper {
  margin: 1rem 0;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  max-width: 100%;
  width: 100%;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.code-lang {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.copy-code-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.copy-code-btn:hover {
  background: var(--bg-accent);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.copy-code-btn.copied {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

.hljs-code-block {
  margin: 0;
  padding: 1rem;
  background: var(--bg-primary);
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  max-width: 100%;
  white-space: pre;
  word-wrap: normal;
  word-break: normal;
}

.hljs-code-block code {
  background: transparent;
  border: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* 自定义滚动条 */
.hljs-code-block::-webkit-scrollbar {
  height: 8px;
}

.hljs-code-block::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.hljs-code-block::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.hljs-code-block::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

/* 响应式代码块 */
@media (max-width: 768px) {
  .code-block-wrapper {
    margin: 0.75rem -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .hljs-code-block {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }

  .code-block-header {
    padding: 0.4rem 1rem;
  }

  .code-lang {
    font-size: 0.7rem;
  }

  .copy-code-btn {
    padding: 0.2rem;
  }
}

/* 确保代码块在消息卡片中不会溢出 */
.markdown-content {
  max-width: 100%;
  overflow-wrap: break-word;
}

.markdown-content pre {
  max-width: 100%;
  overflow-x: auto;
}

.markdown-content code {
  word-break: break-all;
  white-space: pre-wrap;
}

.markdown-content .hljs-code-block code {
  word-break: normal;
  white-space: pre;
}

/* 深色模式下的代码高亮调整 */
.dark .hljs-code-block {
  background: #1e1e1e;
}

.dark .code-block-wrapper {
  background: #2d2d2d;
}

.dark .code-block-header {
  background: #3d3d3d;
}
</style>
