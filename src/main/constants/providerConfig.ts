import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

export interface ProviderHandler {
  createClient: (apiKey: string) => OpenAI
  baseURL: string
  systemPrompt: string
}

// 文件上传到LLM并获取file ID
export async function uploadFileToLLM(client: OpenAI, fileBuffer: Buffer, fileName: string): Promise<string> {
  // 将buffer写入临时文件
  const tempFilePath = path.join(tmpdir(), `upload_${Date.now()}_${fileName}`)
  fs.writeFileSync(tempFilePath, fileBuffer)
  
  try {
    // 上传文件到LLM
    const fileObject = await client.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: "file-extract" as any // 暂时使用any绕过类型检查，这是DashScope特有的purpose
    })
    
    return fileObject.id
  } finally {
    // 清理临时文件
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
    }
  }
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