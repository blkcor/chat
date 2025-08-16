<template>
  <aside class="w-[var(--sidebar-width)] flex-shrink-0 border-r border-theme bg-tertiary flex flex-col justify-between">
    <div class="p-4 overflow-y-auto">
      <ConversationList :items="conversations" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Conversation } from '@renderer/types/conversation';
import ConversationList from './ConversationList.vue';

defineProps<{
  conversations: Conversation[]
}>()
</script>
