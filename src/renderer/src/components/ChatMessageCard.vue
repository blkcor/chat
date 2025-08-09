<template>
  <div class="chat-message" :class="{ 'user-message': isUserMessage }">
    <div class="avatar" :class="{ 'user-avatar': isUserMessage }">
      <span v-if="isUserMessage">U</span>
      <span v-else>A</span>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-author">{{ isUserMessage ? 'You' : model }}</span>
        <span class="message-time">{{ formatTime(timestamp) }}</span>
      </div>
      <div class="message-body">
        <slot>{{ content }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string;
  timestamp: string;
  model?: string;
  isUserMessage: boolean;
}>();

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
</script>

<style scoped>
.chat-message {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  margin-bottom: 1rem;
  border-radius: var(--border-radius-md);
  background-color: var(--bg-secondary);
  transition: var(--transition-normal);
  position: relative;
  border-left: 2px solid transparent;
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--color-secondary);
}

.chat-message:hover {
  box-shadow: var(--shadow-md);
}

.user-message {
  background-color: var(--bg-accent);
  flex-direction: row-reverse;
  text-align: right;
  border-left: none;
  border-right: 4px solid var(--color-primary);
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
</style>
