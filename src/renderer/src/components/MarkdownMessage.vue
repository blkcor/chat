<template>
  <div
    class="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-blockquote:border-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-em:text-gray-600 dark:prose-em:text-gray-400"
    v-html="renderedContent" @click="handleClick"></div>
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
/* Typography插件会处理大部分文本样式，这里只保留必要的自定义样式 */
</style>

<style>
/* 保留代码块和表格的自定义样式，因为这些需要特殊处理 */
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
</style>
