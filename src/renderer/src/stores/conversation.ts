import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from './db'
import { Conversation } from '@renderer/types/conversation'
import { Message, MessageStatus, MessageType } from '@renderer/types/message'
import { generateMessageId } from '@renderer/utils/idUtils'
import { formatDateTimeWithMs, nowWithMs } from '@renderer/utils/dateUtils'

export const useConversationStore = defineStore('conversation', () => {
  // 状态
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messageList = ref<Message[]>([])
  const messageStatus = ref<MessageStatus>(MessageStatus.FINISHED)
  const streamingMessageId = ref<string | null>(null)

  // 计算属性
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

  const isStreaming = computed(() => streamingMessageId.value !== null)

  // Actions
  const loadConversations = async () => {
    try {
      const conversationList = await db.conversations.toArray()
      conversations.value = conversationList
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = await db.conversations.get({ id: conversationId })
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      currentConversation.value = conversation

      // 加载消息
      const messages = await db.messages.where('conversationId').equals(conversationId).toArray()

      // 手动排序以确保精确性
      messageList.value = messages.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime()
        const timeB = new Date(b.createdAt).getTime()

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
    } catch (error) {
      console.error('Failed to load conversation:', error)
      throw error
    }
  }

  const createMessage = async (content: string, conversationId: string): Promise<Message> => {
    const questionTime = formatDateTimeWithMs(nowWithMs())
    const questionMessage: Message = {
      id: generateMessageId(),
      conversationId,
      content,
      createdAt: questionTime,
      updatedAt: questionTime,
      type: MessageType.QUESTION
    }

    await db.messages.add(questionMessage)
    messageList.value.push(questionMessage)

    return questionMessage
  }

  const createStreamingMessage = async (conversationId: string): Promise<Message> => {
    // 等待一毫秒确保时间戳不同
    await new Promise((resolve) => setTimeout(resolve, 1))

    const answerTime = formatDateTimeWithMs(nowWithMs())
    const streamingMessage: Message = {
      id: generateMessageId(),
      conversationId,
      content: '',
      createdAt: answerTime,
      updatedAt: answerTime,
      type: MessageType.ANSWER,
      status: MessageStatus.LOADING
    }

    await db.messages.add(streamingMessage)
    messageList.value.push(streamingMessage)

    // 设置当前流式消息ID
    streamingMessageId.value = streamingMessage.id
    messageStatus.value = MessageStatus.STREAMING

    return streamingMessage
  }

  const updateStreamingMessage = async (messageId: string, content: string, isEnd: boolean) => {
    const messageIndex = messageList.value.findIndex((msg) => msg.id === messageId)
    if (messageIndex === -1) return

    const message = messageList.value[messageIndex]

    // 更新消息内容
    message.content += content
    message.updatedAt = formatDateTimeWithMs(nowWithMs())

    // 根据是否结束更新状态
    if (isEnd) {
      message.status = MessageStatus.FINISHED
      messageStatus.value = MessageStatus.FINISHED
      // 注意：不要立即清除 streamingMessageId，等待打字机效果完成
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
  }

  const onTypingComplete = (messageId: string) => {
    // 如果完成的是当前流式消息，清除流式状态
    if (streamingMessageId.value === messageId) {
      streamingMessageId.value = null
    }
  }

  const clearConversation = async (conversationId: string) => {
    await db.messages.where('conversationId').equals(conversationId).delete()
    if (currentConversation.value?.id === conversationId) {
      messageList.value = []
    }
  }

  const clearCurrentConversation = () => {
    currentConversation.value = null
    messageList.value = []
    messageStatus.value = MessageStatus.FINISHED
    streamingMessageId.value = null
  }

  return {
    // State
    conversations,
    currentConversation,
    messageList,
    messageStatus,
    streamingMessageId,

    // Computed
    sortedMessages,
    isStreaming,

    // Actions
    loadConversations,
    loadConversation,
    createMessage,
    createStreamingMessage,
    updateStreamingMessage,
    onTypingComplete,
    clearConversation,
    clearCurrentConversation
  }
})
