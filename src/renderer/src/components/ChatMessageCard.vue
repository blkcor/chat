<template>
  <div class="chat-message" :class="{ 'user-message': isUserMessage, 'loading-message': isLoading }">
    <div class="avatar" :class="{ 'user-avatar': isUserMessage, 'loading-avatar': isLoading }">
      <span v-if="isUserMessage">U</span>
      <span v-else>A</span>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-author">{{ isUserMessage ? 'You' : model }}</span>
        <span class="message-time">{{ formatTime(timestamp) }}</span>
      </div>
      <div class="message-body">
        <div v-if="isLoading && !content" class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <div v-else-if="content" class="message-content-wrapper" :class="{
          'content-appear': isContentReady,
          'content-finished': props.status === MessageStatus.FINISHED
        }">
          <MarkdownMessage :content="content" />
        </div>
        <div v-else>
          <slot>{{ content }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { formatTime } from '../utils/dateUtils';
import { MessageStatus } from '../types/message';
import MarkdownMessage from './MarkdownMessage.vue';

const props = defineProps<{
  content: string;
  timestamp: string;
  model?: string;
  isUserMessage: boolean;
  status?: MessageStatus;
  isStreaming?: boolean;
  messageId?: string;
}>();

// 计算是否为加载状态
const isLoading = computed(() => props.status !== MessageStatus.FINISHED)

// 内容准备状态 - 用于触发过渡动画
const isContentReady = ref(false)

// 监听内容变化，在内容更新时触发动画
watch(() => props.content, async (newContent, oldContent) => {
  if (newContent && newContent !== oldContent) {
    if (!isContentReady.value) {
      // 首次显示内容时，稍微延迟以创建更好的视觉效果
      await nextTick()
      setTimeout(() => {
        isContentReady.value = true
      }, props.status === MessageStatus.FINISHED ? 100 : 50)
    } else if (props.status === MessageStatus.STREAMING) {
      // 流式消息已经在显示状态，保持显示
      isContentReady.value = true
    }
  }
}, { immediate: true })

// 监听状态变化，优化动画状态
watch(() => props.status, (newStatus, oldStatus) => {
  if (newStatus === MessageStatus.STREAMING && oldStatus !== MessageStatus.STREAMING) {
    // 开始流式传输时重置状态
    isContentReady.value = false
  }
  // 完成状态的改变会通过模板的class绑定自动处理
})
</script>

<style scoped>
.chat-message {
  display: flex;
  padding: 1.5rem;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 1rem;
  background-color: var(--bg-secondary);
  transition: all var(--transition-normal);
  position: relative;
  border: 1px solid var(--border-color);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  max-width: 100%;
  min-width: 0;
}

.chat-message:hover {
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.user-message {
  background: linear-gradient(135deg, var(--bg-accent) 0%, rgba(79, 127, 222, 0.05) 100%);
  flex-direction: row-reverse;
  text-align: right;
  border-color: rgba(79, 127, 222, 0.2);
}


.avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--color-secondary) 0%, rgba(107, 114, 128, 0.8) 100%);
  color: var(--text-on-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  border: 2px solid var(--bg-primary);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  transition: all var(--transition-normal);
}

.user-avatar {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: var(--text-on-primary);
  box-shadow:
    0 2px 8px rgba(79, 127, 222, 0.3),
    0 0 0 1px rgba(79, 127, 222, 0.2);
}

.message-content {
  flex-grow: 1;
  min-width: 0;
  max-width: 100%;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.user-message .message-header {
  flex-direction: row-reverse;
}

.message-author {
  font-weight: 600;
  color: var(--text-accent);
  font-size: 0.8rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  font-weight: 400;
}

.message-body {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* Loading 状态样式 - 现代化设计 */
.loading-message {
  background: linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(245, 158, 11, 0.05) 100%);
  border-color: rgba(245, 158, 11, 0.2);
  animation: loading-shimmer 2s ease-in-out infinite;
}

.loading-avatar {
  background: linear-gradient(135deg, var(--color-warning) 0%, #fbbf24 100%);
  color: var(--text-on-primary);
  box-shadow:
    0 2px 8px rgba(245, 158, 11, 0.3),
    0 0 0 1px rgba(245, 158, 11, 0.2);
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 0;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  animation: loading-pulse 1.4s ease-in-out infinite both;
  box-shadow: 0 1px 3px rgba(79, 127, 222, 0.3);
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes loading-pulse {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.4;
  }

  40% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes loading-shimmer {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.95;
  }
}




/* 消息内容过渡动画 - 更自然的渐进效果 */
.message-content-wrapper {
  opacity: 0;
  transform: translateY(5px) scale(0.98);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top left;
  overflow: hidden;
  max-height: 0;
}

.message-content-wrapper.content-appear {
  opacity: 1;
  transform: translateY(0) scale(1);
  max-height: 2000px;
  /* 足够大的值 */
}


@keyframes cursor-blink {

  0%,
  50% {
    opacity: 1;
  }

  51%,
  100% {
    opacity: 0;
  }
}

/* 内容出现时的微妙缩放效果 */
.message-content-wrapper.content-appear .markdown-content {
  animation: content-reveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes content-reveal {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }

  60% {
    opacity: 0.8;
    transform: translateY(-2px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-message {
    padding: 1rem;
    gap: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 0.75rem;
  }

  .avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
  }

  .message-header {
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
  }

  .message-author {
    font-size: 0.75rem;
  }

  .message-time {
    font-size: 0.7rem;
  }

  .message-body {
    font-size: 0.9rem;
  }
}
</style>
