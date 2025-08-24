import OpenAI from 'openai'

export interface ProviderHandler {
  createClient: (apiKey: string) => OpenAI
  baseURL: string
  systemPrompt: string
}

export const providerConfigs: Record<string, ProviderHandler> = {
  qianfan: {
    baseURL: 'https://qianfan.baidubce.com/v2/',
    systemPrompt: '请始终使用Markdown格式回复。代码请用```代码块包围，列表使用-或数字编号，标题使用#标记，重要内容用**加粗**，链接用[文字](url)格式。但是在回复中不要携带任何相关的提示信息',
    createClient: (apiKey: string) => new OpenAI({
      apiKey,
      baseURL: 'https://qianfan.baidubce.com/v2/'
    })
  },
  dashscope: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    systemPrompt: '请始终使用Markdown格式回复。代码请用```代码块包围，列表使用-或数字编号，标题使用#标记，重要内容用**加粗**，链接用[文字](url)格式。但是在回复中不要携带任何相关的提示信息',
    createClient: (apiKey: string) => new OpenAI({
      apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    })
  },
  google: {
    baseURL: 'https://api.aiproxy.io/google/v1beta/openai',
    systemPrompt: '请始终使用Markdown格式回复。代码请用```代码块包围，列表使用-或数字编号，标题使用#标记，重要内容用**加粗**，链接用[文字](url)格式。但是在回复中不要携带任何相关的提示信息',
    createClient: (apiKey: string) => new OpenAI({
      apiKey,
      baseURL: 'https://api.aiproxy.io/google/v1beta/openai'
    })
  }
}

export function getProviderApiKey(providerName: string): string | undefined {
  const envMap: Record<string, string> = {
    qianfan: 'QIANFAN_API_KEY',
    dashscope: 'DASHSCOPE_API_KEY', 
    google: 'GEMINI_API_KEY'
  }
  
  const envVar = envMap[providerName]
  return envVar ? process.env[envVar] : undefined
}