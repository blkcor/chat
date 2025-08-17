<template>
  <div class="flex flex-col h-full bg-primary">
    <!-- 对话标题栏 - 丰富的信息展示和操作区域 -->
    <div class="conversation-header">
      <div class="conversation-header-content">
        <!-- 左侧：对话信息 -->
        <div class="conversation-info">
          <div class="conversation-main-info">
            <h1 class="conversation-title">{{ currentConversation?.title }}</h1>
            <div class="conversation-meta">
              <div class="model-badge">
                <span class="icon-[ri--cpu-line] w-3.5 h-3.5"></span>
                <span>{{ currentConversation?.selectedModel }}</span>
              </div>
              <div class="message-count">
                <span class="icon-[ri--message-3-line] w-3.5 h-3.5"></span>
                <span>{{ conversationStore.messageList.length }} 条消息</span>
              </div>
              <div class="last-active" v-if="currentConversation?.updatedAt">
                <span class="icon-[ri--time-line] w-3.5 h-3.5"></span>
                <span>{{ getTimeAgo(currentConversation.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="conversation-actions">
          <button class="action-btn" @click="clearConversation" title="清空对话">
            <span class="icon-[ri--delete-bin-line] w-4 h-4"></span>
          </button>
          <button class="action-btn" @click="exportConversation" title="导出对话">
            <span class="icon-[ri--download-line] w-4 h-4"></span>
          </button>
          <button class="action-btn" @click="shareConversation" title="分享对话">
            <span class="icon-[ri--share-line] w-4 h-4"></span>
          </button>
          <div class="action-divider"></div>
          <button class="action-btn" @click="toggleSettings" title="对话设置">
            <span class="icon-[ri--settings-3-line] w-4 h-4"></span>
          </button>
        </div>
      </div>

      <!-- 状态指示器 -->
      <div class="conversation-status" v-if="conversationStore.messageStatus === MessageStatus.STREAMING">
        <div class="status-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="status-text">AI 正在思考中...</span>
        </div>
      </div>
    </div>

    <!-- 消息列表部分 - 优化间距和最大宽度 -->
    <div ref="messagesContainer" class="flex-grow overflow-y-auto px-4 py-6 pb-36">
      <div class="max-w-4xl mx-auto w-full">
        <div class="flex flex-col gap-6">
          <ChatMessageCard v-for="message in conversationStore.sortedMessages" :key="message.id"
            :content="message.content" :timestamp="message.createdAt"
            :is-user-message="message.type === MessageType.QUESTION"
            :model="conversationStore.currentConversation?.selectedModel" :status="message.status"
            :is-streaming="conversationStore.streamingMessageId === message.id" :message-id="message.id"
            @typing-complete="conversationStore.onTypingComplete" />
        </div>
      </div>
    </div>

    <!-- 输入框部分 - 优化设计和间距 -->
    <div class="chat-input-container">
      <div class="max-w-4xl mx-auto w-full px-6">
        <div class="message-input-wrapper">
          <div class="message-input-card">
            <input type="text" placeholder="输入消息..." @keyup.enter="handleSend" v-model="messageContent"
              class="message-input" />
            <button @click="handleSend" class="send-button"
              :disabled="!messageContent.trim() && conversationStore.messageStatus !== MessageStatus.STREAMING">
              <span
                :class="conversationStore.messageStatus !== MessageStatus.STREAMING ? 'icon-[ri--send-plane-line]' : 'icon-[ic--twotone-motion-photos-pause]'"
                class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatMessageCard from '../components/ChatMessageCard.vue'
import { nextTick, onMounted, ref, watch } from 'vue';
import { db } from '@renderer/stores/db';
import { useRoute, useRouter } from 'vue-router';
import { MessageStatus, MessageType } from '@renderer/types/message';
import { nowWithMs, getTimeAgo } from '@renderer/utils/dateUtils';
import { StreamableData } from '@type/message';
import { useConversationStore } from '@renderer/stores';

const route = useRoute()
const convertsationId = route.params.id as string
const messageContent = ref<string>('')
const router = useRouter()
const messagesContainer = ref<HTMLElement>()

// 使用 Pinia store
const conversationStore = useConversationStore()

// 使用 store 中的计算属性
const { sortedMessages, currentConversation, messageList, messageStatus, streamingMessageId } = conversationStore

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 对话操作方法
const clearConversation = async () => {
  if (confirm('确定要清空这个对话吗？此操作不可撤销。')) {
    await conversationStore.clearConversation(convertsationId)
  }
}

const exportConversation = () => {
  const conversationData = {
    title: conversationStore.currentConversation?.title,
    model: conversationStore.currentConversation?.selectedModel,
    messages: conversationStore.sortedMessages.map(msg => ({
      type: msg.type === MessageType.QUESTION ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.createdAt
    })),
    exportTime: nowWithMs()
  }

  const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${conversationStore.currentConversation?.title || '对话'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const shareConversation = () => {
  // 这里可以实现分享功能，比如复制链接或生成分享码
  navigator.clipboard.writeText(window.location.href)
  alert('对话链接已复制到剪贴板')
}

const toggleSettings = () => {
  // 这里可以打开对话设置面板
  console.log('打开对话设置')
}

const handleSend = async () => {
  if (messageContent.value.trim() === '') return

  const content = messageContent.value
  messageContent.value = ''

  try {
    // 创建用户消息
    const questionMessage = await conversationStore.createMessage(content, convertsationId)

    // 滚动到底部显示新消息
    scrollToBottom()

    // 创建流式回复消息
    const streamingMessage = await conversationStore.createStreamingMessage(convertsationId)

    // 再次滚动到底部显示loading消息
    scrollToBottom()

    // 获取provider信息
    const providerInfo = await db.providers.where({ id: conversationStore.currentConversation?.providerId }).first()
    if (!providerInfo) {
      alert('无效的provider')
      return
    }

    // 发送消息到主进程
    window.chatAPI.sendQuestion({
      content: questionMessage.content,
      providerName: providerInfo?.name || '',
      model: conversationStore.currentConversation?.selectedModel || '',
      messageId: streamingMessage.id
    })
  } catch (error) {
    console.error('Failed to send message:', error)
    alert('发送消息失败')
  }
}


onMounted(async () => {
  try {
    // 加载对话
    await conversationStore.loadConversation(convertsationId)

    // 加载完消息后滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load conversation:', error)
    alert('会话不存在')
    router.push('/')
  }

  // 监听流式消息
  window.chatAPI.streamMessage(async (data: StreamableData) => {
    await conversationStore.updateStreamingMessage(
      data.messageId,
      data.data.result,
      data.data.is_end
    )

    // 如果是流式消息，滚动到底部
    if (conversationStore.messageStatus === MessageStatus.STREAMING) {
      scrollToBottom()
    }
  })
})

watch(() => route.params.id, async (newId) => {
  if (newId && typeof newId === 'string') {
    try {
      await conversationStore.loadConversation(newId)
      // 切换对话后滚动到底部
      scrollToBottom()
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }
})

// 监听消息列表变化，自动滚动到底部
watch(() => conversationStore.messageList.length, () => {
  scrollToBottom()
}, { flush: 'post' })


</script>

<style scoped>
/* 对话标题栏样式 */
.conversation-header {
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 50;
}

.conversation-header-content {
  width: 100%;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

/* 对话信息区域 */
.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-main-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conversation-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.025em;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.conversation-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.model-badge,
.message-count,
.last-active {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.model-badge {
  background: var(--bg-accent);
  color: var(--color-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(79, 127, 222, 0.2);
}

/* 操作按钮区域 */
.conversation-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.action-btn:hover {
  background: var(--bg-accent);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0) scale(0.95);
}

.action-divider {
  width: 1px;
  height: 1.5rem;
  background: var(--border-color);
  margin: 0 0.25rem;
}

/* 状态指示器 */
.conversation-status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  height: 2px;
  overflow: hidden;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: var(--bg-accent);
  border-radius: 0 0 0.5rem 0.5rem;
  position: absolute;
  top: -2.5rem;
  right: 1.5rem;
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(79, 127, 222, 0.15);
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 0.25rem;
  height: 0.25rem;
  background: var(--color-primary);
  border-radius: 50%;
  animation: typing-pulse 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0s;
}

@keyframes typing-pulse {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .conversation-header-content {
    padding: 1rem;
    gap: 1rem;
  }

  .conversation-title {
    font-size: 1rem;
  }

  .conversation-meta {
    gap: 0.75rem;
  }

  .model-badge,
  .message-count,
  .last-active {
    font-size: 0.7rem;
  }

  .action-btn {
    width: 2rem;
    height: 2rem;
  }

  .last-active {
    display: none;
  }
}

/* 聊天输入框容器样式 - 现代化设计 */
.chat-input-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 70%, transparent 100%);
  padding: 1.5rem 0 2rem 0;
  backdrop-filter: blur(8px);
  z-index: 10;
}

.message-input-wrapper {
  position: relative;
}

.message-input-card {
  display: flex;
  align-items: center;
  background-color: var(--bg-secondary);
  border: 1.5px solid var(--border-color);
  border-radius: 1.5rem;
  padding: 0.75rem 1rem;
  transition: all var(--transition-normal);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.02);
}

.message-input-card:focus-within {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 3px rgba(79, 127, 222, 0.1),
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.message-input {
  flex-grow: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.5;
  caret-color: var(--color-primary);
  transition: all var(--transition-normal);
  padding: 0.25rem 0;
}

.message-input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--color-primary);
  color: var(--text-on-primary);
  border: none;
  border-radius: 50%;
  margin-left: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 8px rgba(79, 127, 222, 0.3);
}

.send-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(79, 127, 222, 0.4);
}

.send-button:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.send-button:disabled {
  background-color: var(--color-secondary);
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}
</style>
