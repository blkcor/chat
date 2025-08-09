<template>
  <div>
    <ul class="list-none p-0 m-0 flex flex-col gap-2">
      <li
        v-for="item in items"
        :key="item.id"
        class="px-3 py-4 rounded-2 cursor-pointer transition-colors duration-200 ease-in-out border-[1px] border-[var(--border-color)] bg-[var(--bg-color)] hover:bg-[var(--item-hover-bg)]"
        :class="{ 'bg-[var(--item-selected-bg)] border-[var(--item-selected-border)]': selectedConversationId === item.id }"
        @click="selectConversation(item.id)"
      >
        <h3 :class="['text-[0.9rem] font-medium mx-0 mt-1 mb-0 text-[var(--font-color)]', { 'text-[var(--font-color-accent)]': selectedConversationId === item.id }]">{{ item.title }}</h3>
        <p :class="['text-[0.75rem] m-0', { 'text-[var(--font-color-accent)]': selectedConversationId === item.id }]">Model: {{ item.selectedModel }}</p>
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

</style>
