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
        <h3 class="text-[0.9rem] font-medium mx-0 mt-1 mb-0"
            :class="selectedConversationId === item.id ? 'text-accent' : 'text-primary'">
          {{ item.title }}
        </h3>
        <p class="text-[0.75rem] m-0"
           :class="selectedConversationId === item.id ? 'text-accent' : 'text-secondary'">
          Model: {{ item.selectedModel }}
        </p>
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
</script>

<style scoped>
.list-item {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

/* 可以在这里添加组件特定的样式覆盖 */
</style>
