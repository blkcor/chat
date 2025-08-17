import { createPinia } from 'pinia'

export const pinia = createPinia()

// 导出所有 stores
export { useThemeStore } from './theme'
export { useConversationStore } from './conversation'
export { useAppStore } from './app'
