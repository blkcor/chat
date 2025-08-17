<template>
  <div class="chat-message" :class="{ 'user-message': isUserMessage, 'loading-message': isLoading }">
    <div class="avatar" :class="{ 'user-avatar': isUserMessage, 'loading-avatar': isLoading }">
      <span v-if="isUserMessage">U</span>
      <span v-else-if="isLoading" class="loading-spinner">
        <span class="icon-[eos-icons--loading] w-5 h-5 animate-spin"></span>
      </span>
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
        <div v-else>
          <slot>{{ content }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatTime } from '../utils/dateUtils';
import { MessageStatus } from '../types/message';

defineProps<{
  content: string;
  timestamp: string;
  model?: string;
  isUserMessage: boolean;
  status?: MessageStatus;
}>();

// 计算是否为加载状态
const isLoading = computed(() => status === MessageStatus.LOADING || status === MessageStatus.STREAMING);
</script>

<style scoped>
.chat-message {
  display: flex;
  padding: 1.25rem;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-radius: var(--border-radius-lg);
  background-color: var(--bg-secondary);
  transition: var(--transition-normal);
  position: relative;
  border-left: 3px solid var(--color-secondary);
  box-shadow: var(--shadow-sm);
}

.chat-message:hover {
  box-shadow: var(--shadow-md);
}

.user-message {
  background-color: var(--bg-accent);
  flex-direction: row-reverse;
  text-align: right;
  border-left: none;
  border-right: 3px solid var(--color-primary);
}


.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--border-radius-full);
  background-color: var(--color-secondary);
  color: var(--text-on-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  border: 2px solid var(--bg-primary);
  box-shadow: 0 0 0 1px var(--border-color);
}

.user-avatar {
  background-color: var(--color-primary);
  color: var(--text-on-primary);
  box-shadow: 0 0 0 1px var(--color-primary-hover);
}

.message-content {
  flex-grow: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.user-message .message-header {
  flex-direction: row-reverse;
}

.message-author {
  font-weight: 600;
}

.message-body {
  color: var(--text-primary);
  line-height: 1.5;
}

/* Loading 状态样式 */
.loading-message {
  border-left-color: var(--color-warning);
  background-color: var(--bg-tertiary);
}

.loading-avatar {
  background-color: var(--color-warning);
  color: var(--text-on-primary);
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: var(--color-secondary);
  animation: loading-pulse 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-pulse {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
