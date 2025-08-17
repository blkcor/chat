<template>
  <div class="flex flex-col h-full bg-primary">
    <!-- 标题部分 - 优化间距和字体 -->
    <div class="px-6 py-4 border-b border-theme bg-secondary backdrop-blur-sm">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-lg font-semibold text-primary tracking-tight">{{ currentConversation?.title }}</h1>
        <p class="text-xs text-secondary mt-1 opacity-75">{{ currentConversation?.selectedModel }}</p>
      </div>
    </div>

    <!-- 消息列表部分 - 优化间距和最大宽度 -->
    <div ref="messagesContainer" class="flex-grow overflow-y-auto px-4 py-6 pb-36">
      <div class="max-w-4xl mx-auto w-full">
        <div class="flex flex-col gap-6">
          <ChatMessageCard v-for="message in sortedMessages" :key="message.id" :content="message.content"
            :timestamp="message.createdAt" :is-user-message="message.type === MessageType.QUESTION"
            :model="currentConversation?.selectedModel" :status="message.status" />
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
              :disabled="!messageContent.trim() && messageStatus !== MessageStatus.STREAMING">
              <span
                :class="messageStatus !== MessageStatus.STREAMING ? 'icon-[ri--send-plane-line]' : 'icon-[ic--twotone-motion-photos-pause]'"
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
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { db } from '@renderer/stores/db';
import { useRoute, useRouter } from 'vue-router';
import { Conversation } from '@renderer/types/conversation';
import { Message, MessageStatus, MessageType } from '@renderer/types/message';
import { v4 } from 'uuid'
import { formatDateTimeWithMs, nowWithMs } from '@renderer/utils/dateUtils';
import { StreamableData } from '@type/message';

const route = useRoute()
const convertsationId = route.params.id as string
const currentConversation = ref<Conversation>()
const messageList = ref<Message[]>([])
const messageContent = ref<string>('')
const router = useRouter()
const messagesContainer = ref<HTMLElement>()
const messageStatus = ref<MessageStatus>(MessageStatus.LOADING)

// 计算属性：确保消息按时间排序，使用更精确的排序逻辑
const sortedMessages = computed(() => {
  return [...messageList.value].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime()
    const timeB = new Date(b.createdAt).getTime()

    // 如果时间戳相同，使用消息类型排序（问题在前，答案在后）
    if (timeA === timeB) {
      if (a.type === MessageType.QUESTION && b.type === MessageType.ANSWER) {
        return -1
      }
      if (a.type === MessageType.ANSWER && b.type === MessageType.QUESTION) {
        return 1
      }
      // 如果类型也相同，使用ID排序确保稳定性
      return a.id.localeCompare(b.id)
    }

    return timeA - timeB
  })
})

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleSend = async () => {
  if (messageContent.value.trim() === '') return

  messageStatus.value = MessageStatus.STREAMING

  // 生成精确的时间戳，确保问题和答案有不同的时间
  const questionTime = formatDateTimeWithMs(nowWithMs())
  const questionMessage: Message = {
    id: v4(),
    conversationId: convertsationId,
    content: messageContent.value,
    createdAt: questionTime,
    updatedAt: questionTime,
    type: MessageType.QUESTION
  }

  // 通知主线程
  const providerInfo = await db.providers.where({ id: currentConversation.value?.providerId }).first()
  if (!providerInfo) {
    alert('无效的provider')
    return
  }

  db.messages.add(questionMessage)
  messageList.value.push(questionMessage)
  messageContent.value = ''

  // 滚动到底部显示新消息
  scrollToBottom()

  // 等待一毫秒确保时间戳不同
  await new Promise(resolve => setTimeout(resolve, 1))

  // 创建answer消息，确保时间戳晚于问题消息
  const answerTime = formatDateTimeWithMs(nowWithMs())
  const streamingMessage: Message = {
    id: v4(),
    conversationId: convertsationId,
    content: '',
    createdAt: answerTime,
    updatedAt: answerTime,
    type: MessageType.ANSWER,
    status: MessageStatus.LOADING
  }
  db.messages.add(streamingMessage)
  messageList.value.push(streamingMessage)

  // 再次滚动到底部显示loading消息
  scrollToBottom()

  window.chatAPI.sendQuestion({
    content: questionMessage.content,
    providerName: providerInfo?.name || '',
    model: currentConversation.value?.selectedModel || '',
    messageId: streamingMessage.id
  })

}


onMounted(async () => {
  const convertsation = await db.conversations.get({
    id: convertsationId
  })
  if (!convertsation) {
    alert('会话不存在')
    router.push('/')
  } else {
    currentConversation.value = convertsation
    // 使用复合排序：先按时间，再按类型（问题在前）
    const messages = await db.messages
      .where('conversationId')
      .equals(convertsationId)
      .toArray()

    // 手动排序以确保精确性
    messageList.value = messages.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()

      // 如果时间戳相同，问题排在答案前面
      if (timeA === timeB) {
        if (a.type === MessageType.QUESTION && b.type === MessageType.ANSWER) {
          return -1
        }
        if (a.type === MessageType.ANSWER && b.type === MessageType.QUESTION) {
          return 1
        }
        return a.id.localeCompare(b.id)
      }

      return timeA - timeB
    })

    // 加载完消息后滚动到底部
    scrollToBottom()
  }

  window.chatAPI.streamMessage(async (data: StreamableData) => {
    // 找到对应的消息并更新内容
    const messageIndex = messageList.value.findIndex(msg => msg.id === data.messageId)
    if (messageIndex !== -1) {
      const message = messageList.value[messageIndex]

      // 更新消息内容
      message.content += data.data.result
      message.updatedAt = formatDateTimeWithMs(nowWithMs())

      // 根据是否结束更新状态
      if (data.data.is_end) {
        message.status = MessageStatus.FINISHED
        messageStatus.value = MessageStatus.FINISHED
      } else {
        message.status = MessageStatus.STREAMING
      }

      // 更新数据库
      await db.messages.update(message.id, {
        content: message.content,
        updatedAt: message.updatedAt,
        status: message.status
      })

      // 触发响应式更新
      messageList.value[messageIndex] = { ...message }

      // 如果是流式消息，滚动到底部
      if (message.status === MessageStatus.STREAMING) {
        scrollToBottom()
      }
    }
  })
})

watch(() => route.params.id, async (newId) => {
  const messages = await db.messages
    .where('conversationId')
    .equals(newId)
    .toArray()

  // 手动排序以确保精确性
  messageList.value = messages.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime()
    const timeB = new Date(b.createdAt).getTime()

    // 如果时间戳相同，问题排在答案前面
    if (timeA === timeB) {
      if (a.type === MessageType.QUESTION && b.type === MessageType.ANSWER) {
        return -1
      }
      if (a.type === MessageType.ANSWER && b.type === MessageType.QUESTION) {
        return 1
      }
      return a.id.localeCompare(b.id)
    }

    return timeA - timeB
  })

  // 切换对话后滚动到底部
  scrollToBottom()
})

// 监听消息列表变化，自动滚动到底部
watch(() => messageList.value.length, () => {
  scrollToBottom()
}, { flush: 'post' })


</script>

<style scoped>
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
