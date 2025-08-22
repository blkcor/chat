export enum MessageType {
  QUESTION,
  ANSWER
}

export enum MessageStatus {
  STREAMING,
  FINISHED
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
}
