export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SendMessage {
  content: string
  providerName: string
  model: string
  messageId: string
  conversationHistory?: ChatMessage[] // 添加对话历史
}

export interface StreamableData {
  data: {
    is_end: boolean
    result: string
  }
  messageId: string
}

export type StreamCallback = (data: StreamableData) => void
