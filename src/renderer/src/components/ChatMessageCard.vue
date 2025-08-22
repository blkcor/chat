<template>
  <div class="flex p-6 gap-4 mb-6 rounded-2xl transition-all duration-300 relative border max-w-full min-w-0" :class="[
    isUserMessage
      ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 flex-row-reverse text-right border-blue-200/50 dark:border-blue-700/30'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    , 'hover:shadow-lg shadow-sm'
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

        <div v-else
          class="message-content-wrapper prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-blockquote:border-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300">
          <MarkdownMessage :content="content" :rendered-content="renderedContent" :status="status" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
  renderedContent?: string;
}>();

// 计算是否为加载状态
const isLoading = computed(() => props.status === MessageStatus.STREAMING)

</script>

<style scoped>
/* 消息内容样式 - 移除所有动画效果 */
.message-content-wrapper {
  opacity: 1;
  transform: none;
  transition: none;
  max-height: none;
  overflow: visible;
}

/* 移除不需要的动画相关样式 */

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content-wrapper {
    font-size: 0.9rem;
  }
}
</style>
