export interface MediaCapabilities {
  text: boolean
  image: boolean
  audio: boolean
  video: boolean
  document: boolean // PDF, Word, MD, etc.
}

// 模型配置，包含该模型的能力
export interface ModelConfig {
  name: string
  capabilities: MediaCapabilities
}

export interface ProviderConfig {
  apiKeyEnv: string // Environment variable name for API key
  baseURL: string
  systemPrompt?: string
}

export interface Provider {
  id: string
  name: string
  title: string
  desc: string
  avatar: string
  createdAt: string
  updatedAt: string
  models: ModelConfig[] // 改为ModelConfig数组，每个模型有自己的capabilities
  config: ProviderConfig
}
