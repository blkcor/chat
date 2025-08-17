<template>
  <div class="flex flex-col h-full">
    <!-- 标题部分 -->
    <div class="p-4 border-b border-theme bg-secondary">
      <h1 class="text-xl font-medium text-primary">{{ currentConversation?.title }}</h1>
    </div>

    <!-- 消息列表部分 - 使用flex-grow使其填充可用空间，底部增加足够的padding防止被输入框遮挡 -->
    <div ref="messagesContainer" class="flex-grow overflow-y-auto p-6 pb-32">
      <div class="max-w-3xl mx-auto w-full">
        <div class="flex flex-col gap-4">
          <ChatMessageCard v-for="message in sortedMessages" :key="message.id" :content="message.content"
            :timestamp="message.createdAt" :is-user-message="message.type === MessageType.QUESTION"
            :model="currentConversation?.selectedModel" :status="message.status" />
        </div>
      </div>
    </div>

    <!-- 输入框部分 - 固定在底部 -->
    <div class="chat-input-container">
      <div class="max-w-3xl mx-auto w-full px-6">
        <div class="card p-3 flex items-center shadow-lg message-input-card">
          <input type="text" placeholder="输入消息..." @keyup.enter="handleSend" v-model="messageContent"
            class="flex-grow bg-transparent border-none outline-none text-primary message-input" />
          <button @click="handleSend" class="btn-primary ml-2 py-1 px-4 flex items-center gap-1">
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

  // 创建答案消息，确保时间戳晚于问题消息
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
