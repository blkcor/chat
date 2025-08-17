<template>
  <aside class="w-[var(--sidebar-width)] flex-shrink-0 border-r border-theme bg-tertiary flex flex-col justify-between">
    <div class="p-4 overflow-y-auto">
      <ConversationList :items="conversations" :active="conversationId" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Conversation } from '@renderer/types/conversation';
import ConversationList from './ConversationList.vue';
import { useRoute } from 'vue-router'
import { watch, ref } from 'vue';
import { Tab } from '@renderer/constants/tab';

const route = useRoute()
const conversationId = ref<string>()

watch(() => route.fullPath, (newPath) => {
  if (newPath.includes(Tab.CONVERSATION)) {
    const id = newPath.split('/').pop() || ''
    if (id) {
      conversationId.value = id
    }
  } else {
    conversationId.value = undefined
  }
})

defineProps<{
  conversations: Conversation[]
}>()
</script>
