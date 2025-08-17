<template>
  <div class="typewriter-text" v-html="formattedText" @click="handleClick"></div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { renderMarkdown, copyCodeToClipboard } from '@renderer/utils/markdown'

const props = defineProps<{
  text: string
  speed?: number // 打字速度，毫秒
  isComplete?: boolean // 是否已经完成流式传输
}>()

const emit = defineEmits<{
  'typing-complete': []
}>()

const displayedLength = ref(0)
const isTypingFinished = ref(false)
let animationId: number | null = null
let lastUpdateTime = 0
let hasEmittedComplete = false

// 暴露打字完成状态给父组件
defineExpose({
  isTypingFinished
})

const formattedText = computed(() => {
  const text = props.text.slice(0, displayedLength.value)
  // 渲染markdown
  return renderMarkdown(text)
})

const animate = (currentTime: number) => {
  if (currentTime - lastUpdateTime >= (props.speed || 30)) {
    if (displayedLength.value < props.text.length) {
      displayedLength.value++
      lastUpdateTime = currentTime
    } else if (props.isComplete && !hasEmittedComplete) {
      // 打字完成且流式传输也完成了
      hasEmittedComplete = true
      isTypingFinished.value = true
      emit('typing-complete')
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
      return
    }
  }

  // 只有在还没打完或者还没完成传输时才继续动画
  if (displayedLength.value < props.text.length) {
    animationId = requestAnimationFrame(animate)
  } else if (props.isComplete && !hasEmittedComplete) {
    // 打字完成且传输完成，发出完成事件
    hasEmittedComplete = true
    isTypingFinished.value = true
    emit('typing-complete')
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }
}

const startAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  lastUpdateTime = 0
  animationId = requestAnimationFrame(animate)
}

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

// 监听文本变化
watch(() => props.text, (newText, oldText) => {
  if (newText.length > displayedLength.value) {
    // 文本增加了，继续动画
    if (!animationId) {
      startAnimation()
    }
  } else if (newText !== oldText && newText.length < (oldText?.length || 0)) {
    // 文本减少了，重置
    displayedLength.value = 0
    hasEmittedComplete = false
    isTypingFinished.value = false
    startAnimation()
  }
}, { immediate: true })

// 监听完成状态
watch(() => props.isComplete, (isComplete) => {
  if (isComplete && displayedLength.value >= props.text.length && !hasEmittedComplete) {
    hasEmittedComplete = true
    isTypingFinished.value = true
    emit('typing-complete')
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  } else if (isComplete && displayedLength.value < props.text.length && !animationId) {
    // 如果还没打完但已经完成传输，继续打字直到完成
    startAnimation()
  }
})



onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.typewriter-text {
  display: block;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
}
</style>

<style>
/* 确保TypewriterText中的代码块样式正确应用 */
.typewriter-text .code-block-wrapper {
  margin: 1rem 0;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  max-width: 100%;
  width: 100%;
}

.typewriter-text .hljs-code-block {
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

.typewriter-text .code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.typewriter-text .copy-code-btn {
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

.typewriter-text .copy-code-btn:hover {
  background: var(--bg-accent);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.typewriter-text .copy-code-btn.copied {
  background: var(--color-success);
  color: white;
  border-color: var(--color-success);
}

/* 响应式代码块 */
@media (max-width: 768px) {
  .typewriter-text .code-block-wrapper {
    margin: 0.75rem -1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .typewriter-text .hljs-code-block {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }

  .typewriter-text .code-block-header {
    padding: 0.4rem 1rem;
  }
}
</style>
