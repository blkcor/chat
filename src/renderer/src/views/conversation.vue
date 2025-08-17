<template>
  <div class="flex flex-col h-full">
    <!-- 标题部分 -->
    <div class="p-4 border-b border-theme bg-secondary">
      <h1 class="text-xl font-medium text-primary">{{ currentConversation?.title }}</h1>
    </div>

    <!-- 消息列表部分 - 使用flex-grow使其填充可用空间，底部增加足够的padding防止被输入框遮挡 -->
    <div class="flex-grow overflow-y-auto p-6 pb-32">
      <div class="max-w-3xl mx-auto w-full">
        <div class="flex flex-col gap-4">
          <ChatMessageCard v-for="message in messageList" :key="message.id" :content="message.content"
            :timestamp="message.createdAt" :is-user-message="message.type === MessageType.QUESTION"
            :model="currentConversation?.selectedModel" />
        </div>
      </div>
    </div>

    <!-- 输入框部分 - 固定在底部 -->
    <div class="chat-input-container">
      <div class="max-w-3xl mx-auto w-full px-6">
        <div class="card p-3 flex items-center shadow-lg message-input-card">
          <input type="text" placeholder="输入消息..."
            class="flex-grow bg-transparent border-none outline-none text-primary message-input" />
          <button class="btn-primary ml-2 py-1 px-4 flex items-center gap-1">
            <span>发送</span>
            <span class="icon-[ri--send-plane-line] w-5 h-5"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatMessageCard from '../components/ChatMessageCard.vue'
import { onMounted, ref } from 'vue';
import { db } from '@renderer/stores/db';
import { useRoute, useRouter } from 'vue-router';
import { Conversation } from '@renderer/types/conversation';
import { Message, MessageType } from '@renderer/types/message';

const route = useRoute()
const convertsationId = route.params.id as string
const currentConversation = ref<Conversation>()
const messageList = ref<Message[]>([])
const router = useRouter()


onMounted(async () => {
  const convertsation = await db.conversations.get({
    id: convertsationId
  })
  if (!convertsation) {
    alert('会话不存在')
    router.push('/chat')
  } else {
    currentConversation.value = convertsation
    const messages = await db.messages.where('conversationId').equals(convertsationId).toArray()
    messageList.value = messages
  }
})
</script>

<style scoped>
/* 聊天输入框容器样式 */
.chat-input-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  z-index: 10;
}

.message-input-card {
  transition: all var(--transition-normal);
  border-color: var(--border-color);
}

.message-input-card:focus-within {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 1px var(--color-primary-hover),
    var(--shadow-lg);
}

.message-input {
  caret-color: var(--color-primary);
  font-size: 0.95rem;
  transition: all var(--transition-normal);
}
</style>
