export interface MediaCapabilities {
  text: boolean
  image: boolean
  audio: boolean
  video: boolean
  document: boolean // PDF, Word, MD, etc.
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
  models: string[]
  capabilities: MediaCapabilities
  config: ProviderConfig
}
