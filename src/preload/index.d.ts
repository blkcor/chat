import { ElectronAPI } from '@electron-toolkit/preload'
import { SendMessage, StreamCallback } from '../types/message'

interface ChatAPI {
  sendQuestion: (data: SendMessage) => void
  streamMessage: (callback: StreamCallback) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    chatAPI: ChatAPI
  }
}
