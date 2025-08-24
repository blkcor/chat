<template>
  <div class="flex p-6 gap-4 mb-6 rounded-2xl transition-all duration-300 relative border max-w-full min-w-0" :class="[
    isUserMessage
      ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 flex-row-reverse text-right border-[var(--color-primary)]'
      : 'bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-800/10 border-gray-200/50 dark:border-gray-700/30'
    , 'hover:shadow-lg shadow-sm'
  ]">
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 transition-all duration-300"
      :class="[
        !isUserMessage
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
          : 'bg-[var(--color-primary)] shadow-lg shadow-gray-500/20'
      ]">
      <span v-if="isUserMessage">U</span>
      <span v-else>A</span>
    </div>

    <div class="flex-grow min-w-0 max-w-full">
      <div class="flex justify-between items-center mb-3 text-xs" :class="{ 'flex-row-reverse': isUserMessage }">
        <span class="font-semibold text-xs">
          {{ isUserMessage ? 'You' : model }}
        </span>
        <span class="text-xs opacity-70 font-normal">
          {{ formatTime(timestamp) }}
        </span>
      </div>

      <div class="leading-relaxed font-normal tracking-wide max-w-full overflow-wrap-anywhere">
        <!-- 文件显示区域 -->
        <div v-if="files && files.length > 0" class="mb-3">
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="file in files" 
              :key="file.id"
              class="file-attachment"
              :class="{ 'user-file': isUserMessage }"
            >
              <!-- 文件类型图标 -->
              <div class="file-icon">
                <span v-if="file.type === 'image'" class="icon-[ri--image-line] w-3 h-3"></span>
                <span v-else-if="file.type === 'pdf'" class="icon-[ri--file-pdf-line] w-3 h-3"></span>
                <span v-else-if="file.type === 'word'" class="icon-[ri--file-word-line] w-3 h-3"></span>
                <span v-else-if="file.type === 'markdown'" class="icon-[ri--markdown-line] w-3 h-3"></span>
                <span v-else-if="file.type === 'text'" class="icon-[ri--file-text-line] w-3 h-3"></span>
                <span v-else-if="file.type === 'audio'" class="icon-[ri--music-line] w-3 h-3"></span>
                <span v-else-if="file.type === 'video'" class="icon-[ri--video-line] w-3 h-3"></span>
                <span v-else class="icon-[ri--file-line] w-3 h-3"></span>
              </div>
              
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoading && !content" class="flex items-center gap-1.5 py-3">
          <span v-for="i in 3" :key="i"
            class="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/30 animate-bounce"
            :style="{ animationDelay: `${(i - 1) * 0.16}s`, animationDuration: '1.4s' }"></span>
        </div>

        <div v-else class="message-content-wrapper prose prose-sm max-w-none dark:prose-invert">
          <MarkdownMessage :content="content" :rendered-content="renderedContent" :status="status"
            :is-user-message="isUserMessage" />
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
  files?: Array<{ id: string; name: string; size: number; type: string }>; // 添加文件props
}>();

// 计算是否为加载状态
const isLoading = computed(() => props.status === MessageStatus.STREAMING)

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

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

/* 文件附件样式 */
.file-attachment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  transition: all 0.15s ease;
  max-width: 200px;
}

.file-attachment:hover {
  background: var(--bg-accent);
  border-color: var(--color-primary);
}

.file-attachment.user-file {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}

.file-attachment.user-file:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.file-attachment .file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.file-attachment .file-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}

.file-attachment .file-name {
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.file-attachment .file-size {
  color: var(--text-secondary);
  font-size: 0.6875rem;
  line-height: 1;
}

/* 移除不需要的动画相关样式 */

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content-wrapper {
    font-size: 0.9rem;
  }
  
  .file-attachment {
    max-width: 150px;
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }
}
</style>
