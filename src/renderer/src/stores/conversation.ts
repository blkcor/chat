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
        return 1
      }

      return timeA - timeB
    })
  })

  const isStreaming = computed(() => streamingMessageId.value !== null)

  // Actions
  const loadConversations = async () => {
    try {
      const conversationList = await db.conversations.toArray()
      conversationList.sort((c1, c2) => {
        return c1.createdAt < c2.createdAt ? 1 : -1
      })
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

  const createConversation = async (conversation: Conversation) => {
    conversations.value.push(conversation)
    return await db.conversations.add(conversation)
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

    // 如果这是对话的第一条消息，更新对话标题
    await updateConversationTitleIfFirst(conversationId, content)

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
    console.log(`Updating message ${messageId} content:`, message.content)
    message.updatedAt = formatDateTimeWithMs(nowWithMs())

    // 根据是否结束更新状态
    if (isEnd) {
      message.status = MessageStatus.FINISHED
      messageStatus.value = MessageStatus.FINISHED
      // 流式传输结束，但保持streamingMessageId直到打字机效果完成
    } else {
      message.status = MessageStatus.STREAMING
      messageStatus.value = MessageStatus.STREAMING
    }

    // 更新数据库
    await db.messages.update(message.id, {
      content: message.content,
      updatedAt: message.updatedAt,
      status: message.status
    })
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

  // 如果是对话的第一条消息，更新对话标题
  const updateConversationTitleIfFirst = async (conversationId: string, content: string) => {
    try {
      // 检查这个对话是否只有一条消息（刚创建的这条）
      const messageCount = await db.messages.where('conversationId').equals(conversationId).count()
      console.log(`Conversation ${conversationId} has ${messageCount} messages`)

      if (messageCount === 1) {
        // 生成新标题：取消息内容的前30个字符，去掉换行符
        const newTitle =
          content
            .replace(/\n/g, ' ') // 替换换行符为空格
            .replace(/\s+/g, ' ') // 合并多个空格为一个
            .trim() // 去掉首尾空格
            .substring(0, 30) + // 取前30个字符
          (content.length > 30 ? '...' : '') // 如果超过30字符，添加省略号

        console.log(`Updating conversation title to: "${newTitle}"`)

        // 更新数据库中的对话标题
        await db.conversations.update(conversationId, {
          title: newTitle,
          updatedAt: formatDateTimeWithMs(nowWithMs())
        })

        // 更新当前对话状态
        if (currentConversation.value?.id === conversationId) {
          currentConversation.value.title = newTitle
          currentConversation.value.updatedAt = formatDateTimeWithMs(nowWithMs())
        }

        // 更新对话列表中的对话
        const conversationIndex = conversations.value.findIndex(
          (conv) => conv.id === conversationId
        )
        if (conversationIndex !== -1) {
          conversations.value[conversationIndex].title = newTitle
          conversations.value[conversationIndex].updatedAt = formatDateTimeWithMs(nowWithMs())
        }

        console.log('Conversation title updated successfully')
      }
    } catch (error) {
      console.error('Failed to update conversation title:', error)
    }
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
    createConversation,
    createMessage,
    createStreamingMessage,
    updateStreamingMessage,
    onTypingComplete,
    clearConversation,
    clearCurrentConversation,
    updateConversationTitleIfFirst
  }
})
