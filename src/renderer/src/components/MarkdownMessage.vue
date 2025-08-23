<template>
  <div class="text-[var(--text-primary)] prose prose-sm max-w-none dark:prose-invert " @click="handleClick"
    v-html="localRenderedContent"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { renderMarkdown, copyCodeToClipboard } from '@renderer/utils/markdown'
import { MessageStatus } from '@renderer/types/message'

const props = defineProps<{
  content: string
  renderedContent?: string
  status?: MessageStatus
}>()

const localRenderedContent = ref('')

const renderContent = async () => {
  if (props.content) {
    try {
      // 如果有缓存的渲染内容且消息已完成，直接使用缓存
      if (props.renderedContent && props.status === MessageStatus.FINISHED) {
        localRenderedContent.value = props.renderedContent
        return
      }

      // 对于流式消息或没有缓存的消息，使用 web worker 渲染
      localRenderedContent.value = await renderMarkdown(props.content)
    } catch (error) {
      console.error('Markdown rendering error:', error)
      localRenderedContent.value = props.content
    }
  } else {
    localRenderedContent.value = ''
  }
}

// 监听内容和状态变化
watch([() => props.content, () => props.renderedContent, () => props.status], renderContent, { immediate: true })

// 处理点击事件，特别是复制按钮
const handleClick = async (event: Event) => {
  const target = event.target as HTMLElement

  // 检查是否点击了复制按钮
  if (target.classList.contains('copy-code-btn') || target.closest('.copy-code-btn')) {
    event.preventDefault()

    const button = target.classList.contains('copy-code-btn')
      ? target
      : (target.closest('.copy-code-btn') as HTMLElement)
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

/* Shiki 主题支持 */
.shiki-wrapper {
  overflow-x: auto;
}

.shiki-wrapper pre {
  margin: 0 !important;
  padding: 1rem !important;
  background: transparent !important;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  max-width: 100%;
}

/* 确保 Shiki 主题正确切换 */
html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}

html:not(.dark) .shiki,
html:not(.dark) .shiki span {
  color: var(--shiki-light) !important;
  background-color: var(--shiki-light-bg) !important;
}

/* 自定义滚动条 */
.shiki-wrapper::-webkit-scrollbar {
  height: 8px;
}

.shiki-wrapper::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.shiki-wrapper::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.shiki-wrapper::-webkit-scrollbar-thumb:hover {
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

  .shiki-wrapper pre {
    padding: 0.75rem 1rem !important;
    font-size: 0.8rem !important;
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

.markdown-content .shiki-wrapper code {
  word-break: normal;
  white-space: pre;
}
</style>
