<template>
  <div class="flex p-6 gap-4 mb-6 rounded-2xl transition-all duration-300 relative border max-w-full min-w-0" :class="[
    isUserMessage
      ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 flex-row-reverse text-right border-blue-200/50 dark:border-blue-700/30'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    , 'hover:shadow-lg hover:-translate-y-0.5 shadow-sm'
  ]">
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 border-2 border-white dark:border-gray-900 transition-all duration-300"
      :class="[
        isUserMessage
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
          : 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/20'
      ]">
      <span v-if="isUserMessage">U</span>
      <span v-else>A</span>
    </div>

    <div class="flex-grow min-w-0 max-w-full">
      <div class="flex justify-between items-center mb-3 text-xs text-gray-600 dark:text-gray-400"
        :class="{ 'flex-row-reverse': isUserMessage }">
        <span class="font-semibold text-blue-600 dark:text-blue-400 text-xs">
          {{ isUserMessage ? 'You' : model }}
        </span>
        <span class="text-xs opacity-70 font-normal">
          {{ formatTime(timestamp) }}
        </span>
      </div>

      <div
        class="text-gray-900 dark:text-gray-100 leading-relaxed text-[15px] font-normal tracking-wide max-w-full overflow-wrap-anywhere">
        <div v-if="isLoading && !content" class="flex items-center gap-1.5 py-3">
          <span v-for="i in 3" :key="i"
            class="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/30 animate-bounce"
            :style="{ animationDelay: `${(i - 1) * 0.16}s`, animationDuration: '1.4s' }"></span>
        </div>

        <div v-else-if="content"
          class="message-content-wrapper prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-blockquote:border-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300"
          :class="{
            'content-appear': isContentReady && status === MessageStatus.STREAMING,
            'no-animation': !isActiveStreaming
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
  isMeStreaming?: boolean;
  messageId?: string;
}>();

// 计算是否为加载状态
const isLoading = computed(() => props.status === MessageStatus.STREAMING)

// 内容准备状态 - 用于触发过渡动画
const isContentReady = ref(true) // 默认为true，历史消息直接显示

// 判断是否为正在进行的新流式消息
const isActiveStreaming = computed(() => {
  return props.status === MessageStatus.STREAMING && props.isMeStreaming
})

// 标记是否已经初始化过动画
const hasInitialized = ref(false)

// 监听内容和状态变化
watch([() => props.content, () => props.status, () => props.isStreaming],
  ([newContent, newStatus, isStreaming], [oldContent, oldStatus, wasStreaming]) => {
    // 用户消息总是直接显示
    if (props.isUserMessage) {
      isContentReady.value = true
      hasInitialized.value = true
      return
    }

    // 历史消息（已完成的消息）总是直接显示
    if (newStatus === MessageStatus.FINISHED && newContent) {
      isContentReady.value = true
      hasInitialized.value = true
      return
    }

    // 只有在第一次开始流式传输时才触发动画
    if (newStatus === MessageStatus.STREAMING && isStreaming && !hasInitialized.value) {
      // 重置状态，准备动画
      isContentReady.value = false
      hasInitialized.value = true
      nextTick(() => {
        setTimeout(() => {
          isContentReady.value = true
        }, 50)
      })
      return
    }

    // 如果已经初始化过，流式消息内容更新时不重新触发动画
    if (newStatus === MessageStatus.STREAMING && hasInitialized.value) {
      isContentReady.value = true
      return
    }

    // 其他情况直接显示
    if (newContent) {
      isContentReady.value = true
      hasInitialized.value = true
    }
  },
  { immediate: true }
)
</script>

<style scoped>
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
}

/* 历史消息无动画 */
.message-content-wrapper.no-animation {
  opacity: 1 !important;
  transform: translateY(0) scale(1) !important;
  max-height: none !important;
  transition: none !important;
  overflow: visible !important;
}

.message-content-wrapper.no-animation.content-appear {
  transition: none !important;
}

/* 内容出现时的微妙缩放效果 */
.message-content-wrapper.content-appear :deep(.markdown-content) {
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
  .message-content-wrapper {
    font-size: 0.9rem;
  }
}
</style>
