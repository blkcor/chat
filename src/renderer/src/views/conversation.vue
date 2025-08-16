<template>
  <div class="flex flex-col h-full">
    <!-- 标题部分 -->
    <div class="p-4 border-b border-theme bg-secondary">
      <h1 class="text-xl font-medium text-primary">{{ mockConversaion.title }}</h1>
    </div>

    <!-- 消息列表部分 - 使用flex-grow使其填充可用空间，底部增加足够的padding防止被输入框遮挡 -->
    <div class="flex-grow overflow-y-auto p-6 pb-32">
      <div class="max-w-3xl mx-auto w-full">
        <div class="flex flex-col gap-4">
          <ChatMessageCard
            content="你好，我能帮你什么忙吗？"
            timestamp="2025-08-09T12:00:00"
            :is-user-message="false"
            model="AI助手"
          />

          <ChatMessageCard
            content="我想了解一下如何使用暗色模式和浅色模式。"
            timestamp="2025-08-09T12:01:00"
            :is-user-message="true"
          />

          <ChatMessageCard
            content="您现在正在使用的应用已经支持了暗色和浅色模式切换。您可以通过点击左下角的切换按钮来更改主题。此外，系统还会自动检测您的系统偏好设置，并相应地应用主题。"
            timestamp="2025-08-09T12:02:00"
            :is-user-message="false"
            model="AI助手"
          />
        </div>
      </div>
    </div>

    <!-- 输入框部分 - 固定在底部 -->
    <div class="chat-input-container">
      <div class="max-w-3xl mx-auto w-full px-6">
        <div class="card p-3 flex items-center shadow-lg message-input-card">
          <input
            type="text"
            placeholder="输入消息..."
            class="flex-grow bg-transparent border-none outline-none text-primary message-input"
          />
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
import { Conversation } from '@renderer/types/conversation'
import ChatMessageCard from '../components/ChatMessageCard.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

console.log(route.fullPath)

// fetch conversation info from api

const mockConversaion = {
  id: 'adadsadasda',
  title: 'Conversation 1',
  selectedModel: 'Model A',
  createdAt: '2023-01-01',
  updatedAt: '2023-01-02',
  providerId: 'dasdasdasd'
}

defineProps<{
  conversation: Conversation
}>()
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
