export enum MessageType {
  QUESTION,
  ANSWER
}

export enum MessageStatus {
  LOADING,
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
}
