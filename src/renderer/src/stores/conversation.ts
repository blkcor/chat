import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from './db'
import { Conversation } from '@renderer/types/conversation'
import { Message, MessageStatus, MessageType } from '@renderer/types/message'
import { generateMessageId } from '@renderer/utils/idUtils'
import { formatDateTimeWithMs, nowWithMs } from '@renderer/utils/dateUtils'
import { renderMarkdown } from '@renderer/utils/markdown'

export const useConversationStore = defineStore('conversation', () => {
  // 状态
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messageList = ref<Message[]>([])
  const messageStatus = ref<MessageStatus>(MessageStatus.FINISHED)
  const streamingMessageId = ref<string | null>(null)

  // Buffer配置 - 更细腻的渲染控制
  const BUFFER_SIZE = 50 // 减小buffer，更频繁更新
  const RENDER_INTERVAL = 300 // 缩短间隔，更流畅

  // 存储定时器引用
  const renderTimers = new Map<string, NodeJS.Timeout>()

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
    conversations.value.sort((c1, c2) => {
      return c1.createdAt < c2.createdAt ? 1 : -1
    })
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
      status: MessageStatus.STREAMING
    }

    await db.messages.add(streamingMessage)
    messageList.value.push(streamingMessage)

    // 设置当前流式消息ID
    streamingMessageId.value = streamingMessage.id
    messageStatus.value = MessageStatus.STREAMING

    return streamingMessage
  }

  const updateStreamingMessage = (messageId: string, content: string, isEnd: boolean) => {
    const messageIndex = messageList.value.findIndex((msg) => msg.id === messageId)
    if (messageIndex === -1) return

    const message = messageList.value[messageIndex]

    // 初始化缓存内容
    if (!message.pendingContent) {
      message.pendingContent = ''
    }
    message.pendingContent += content

    console.log(`Accumulating message ${messageId} content length:`, message.pendingContent.length)
    message.updatedAt = formatDateTimeWithMs(nowWithMs())

    // 渐进式打字机渲染
    const typewriterRender = () => {
      if (!message.pendingContent) return

      const targetLength = message.pendingContent.length
      const currentLength = message.content.length

      if (currentLength < targetLength) {
        // 每次渲染一定数量的字符，模拟自然打字
        const charsToAdd = Math.min(Math.ceil((targetLength - currentLength) / 3), 20)
        const newLength = currentLength + charsToAdd
        message.content = message.pendingContent.substring(0, newLength)

        // 如果还有更多内容，继续渲染
        if (newLength < targetLength && !isEnd) {
          setTimeout(typewriterRender, 60 + Math.random() * 40) // 随机化间隔，更自然
        }
      }
    }

    if (isEnd) {
      // 结束时清除定时器并渲染所有内容
      const timer = renderTimers.get(messageId)
      if (timer) {
        clearTimeout(timer)
        renderTimers.delete(messageId)
      }

      // 确保所有内容都被渲染
      if (message.pendingContent) {
        message.content = message.pendingContent
        delete message.pendingContent
      }
      message.status = MessageStatus.FINISHED
      messageStatus.value = MessageStatus.FINISHED

      console.log(`Message ${messageId} finished, final content length:`, message.content.length)

      // 当消息完成时，异步渲染并缓存markdown内容
      cacheRenderedContent(message)
    } else {
      message.status = MessageStatus.STREAMING
      messageStatus.value = MessageStatus.STREAMING

      // 检查是否应该开始渐进渲染
      const bufferLength = message.pendingContent?.length || 0
      const currentLength = message.content.length

      if (bufferLength - currentLength >= BUFFER_SIZE) {
        // 清除之前的定时器
        const existingTimer = renderTimers.get(messageId)
        if (existingTimer) {
          clearTimeout(existingTimer)
        }

        // 开始渐进渲染
        typewriterRender()
      }

      // 设置兜底定时器，确保内容不会被遗漏
      const existingTimer = renderTimers.get(messageId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      const timer = setTimeout(() => {
        typewriterRender()
        renderTimers.delete(messageId)
      }, RENDER_INTERVAL)

      renderTimers.set(messageId, timer)
    }

    // 异步更新数据库，不阻塞UI - 使用微任务队列
    Promise.resolve().then(() => {
      db.messages
        .update(message.id, {
          content: message.content,
          updatedAt: message.updatedAt,
          status: message.status,
          renderedContent: message.renderedContent
        })
        .catch((error) => {
          console.error('Failed to update message in DB:', error)
        })
    })
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

    // 清除所有定时器
    renderTimers.forEach((timer) => clearTimeout(timer))
    renderTimers.clear()
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

  // 缓存渲染后的markdown内容
  const cacheRenderedContent = async (message: Message) => {
    try {
      if (message.content && !message.renderedContent) {
        const renderedContent = await renderMarkdown(message.content)
        message.renderedContent = renderedContent

        // 更新数据库
        await db.messages.update(message.id, {
          renderedContent
        })

        console.log(`Cached rendered content for message ${message.id}`)
      }
    } catch (error) {
      console.error('Failed to cache rendered content:', error)
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
    clearConversation,
    clearCurrentConversation,
    updateConversationTitleIfFirst
  }
})
