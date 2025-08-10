<template>
  <div>
    <ul class="list-none p-0 m-0 flex flex-col gap-2">
      <li
        v-for="item in items"
        :key="item.id"
        class="list-item"
        :class="{ 'selected': selectedConversationId === item.id }"
        @click="selectConversation(item.id)"
      >
        <div class="flex justify-between items-center mb-1">
          <span class="text-[0.65rem] text-muted">
            {{ formatDate(item.updatedAt) }}
          </span>
          <span
            class="text-[0.65rem] py-0.5 px-1 rounded-sm"
            :class="selectedConversationId === item.id ? 'accent-bg' : 'bg-secondary text-muted'"
          >
            {{ item.selectedModel }}
          </span>
        </div>

        <h3 class="text-[0.9rem] font-medium mx-0 mt-1 mb-0.5"
            :class="selectedConversationId === item.id ? 'text-accent' : 'text-primary'">
          {{ item.title }}
        </h3>

        <div class="flex items-center mt-1">
          <div
            class="w-2 h-2 rounded-full mr-1.5 transition-colors"
            :class="selectedConversationId === item.id ? 'bg-primary' : 'bg-muted'"
            :style="selectedConversationId === item.id ? { backgroundColor: 'var(--color-primary)' } : { backgroundColor: 'var(--text-muted)' }"
          ></div>
          <p class="text-[0.75rem] m-0 truncate"
             :class="selectedConversationId === item.id ? 'text-accent' : 'text-secondary'">
            Last update {{ getTimeAgo(item.updatedAt) }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Conversation } from '../types/conversation'

defineProps<{
  items: Conversation[]
}>()

const selectedConversationId = ref<number | null>(1); // Default select the first one

const selectConversation = (id: number) => {
  selectedConversationId.value = id;
  // In a real app, you would emit an event here to load the chat
  // emit('conversationSelected', id)
}

// 格式化日期为 YYYY-MM-DD 格式
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// 计算时间差（多久之前）
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`;
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  } else if (diffInSeconds < 31536000) {
    return `${Math.floor(diffInSeconds / 2592000)}月前`;
  } else {
    return `${Math.floor(diffInSeconds / 31536000)}年前`;
  }
}
</script>

<style scoped>
.list-item {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

/* 可以在这里添加组件特定的样式覆盖 */
</style>
