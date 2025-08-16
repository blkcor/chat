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
  content: string
  type: MessageType
  status?: MessageStatus
  conversationId: string
  createdAt: Date
  updatedAt: Date
}
