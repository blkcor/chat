export interface SendMessage {
  content: string
  providerName: string
  model: string
  messageId: string
}

export interface StreamableData {
  data: {
    is_end: boolean
    result: string
  }
  messageId: string
}

export type StreamCallback = (data: StreamableData) => void
