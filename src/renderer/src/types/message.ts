export enum MessageType {
  QUESTION,
  ANSWER
}

export enum MessageStatus {
  STREAMING,
  FINISHED
}

// 消息中的文件信息（用于显示）
export interface MessageFile {
  id: string
  name: string
  size: number
  type: string // image, pdf, word, text, etc.
}

export interface Message {
  id: string
  content: string
  type: MessageType
  status?: MessageStatus
  conversationId: string
  createdAt: string
  updatedAt: string
  pendingContent?: string
  renderedContent?: string
  files?: MessageFile[] // 添加文件信息
}
