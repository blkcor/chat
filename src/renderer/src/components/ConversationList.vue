<template>
  <div class="conversation-list-container">
    <ul class="conversation-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="conversation-item"
        :class="{ 'selected': selectedConversationId === item.id }"
        @click="selectConversation(item.id)"
      >
        <h3 class="item-title">{{ item.title }}</h3>
        <p class="item-details">Model: {{ item.selectedModel }}</p>
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
.conversation-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conversation-item {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.conversation-item:hover {
  background-color: var(--item-hover-bg);
}

.conversation-item.selected {
  background-color: var(--item-selected-bg);
  border-color: var(--item-selected-border);
}

.item-title {
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: var(--font-color);
}

.item-details {
  font-size: 0.75rem;
  color: var(--font-color-secondary);
  margin: 0;
}

.conversation-item.selected .item-title,
.conversation-item.selected .item-details {
  color: var(--font-color-accent);
}
</style>