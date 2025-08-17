import { Provider } from '../types/provider'
import { v4 } from 'uuid'

export const providers: Array<Provider> = [
  {
    id: v4(),
    name: 'OpenAI',
    title: '你不知道opneai?',
    desc: 'OpenAI是一个人工智能研究实验室，致力于推动数字智能的边界。',
    avatar: 'https://openai.com/favicon.ico',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02',
    models: ['GPT-4o', 'GPT-4', 'GPT-3.5-turbo']
  },
  {
    id: v4(),
    name: 'Anthropic',
    title: 'Claude AI助手',
    desc: 'Anthropic开发的Claude是一个安全、有用且无害的AI助手。',
    avatar: 'https://www.anthropic.com/favicon.ico',
    createdAt: '2023-02-01',
    updatedAt: '2023-02-15',
    models: ['Claude-3.5-Sonnet', 'Claude-3-Opus', 'Claude-3-Haiku']
  },
  {
    id: v4(),
    name: 'Google',
    title: 'Gemini AI',
    desc: 'Google最新的多模态AI模型，支持文本、图像和代码理解。',
    avatar: 'https://www.google.com/favicon.ico',
    createdAt: '2023-03-01',
    updatedAt: '2023-03-20',
    models: ['Gemini-Pro', 'Gemini-Ultra', 'Gemini-Nano']
  },
  {
    id: v4(),
    name: '百度',
    title: '文心一言',
    desc: '百度全知识增强的大语言模型，中文理解能力强。',
    avatar: 'https://www.baidu.com/favicon.ico',
    createdAt: '2023-04-01',
    updatedAt: '2023-04-10',
    models: ['ERNIE-Bot-4.0', 'ERNIE-Bot-turbo', 'ERNIE-Bot']
  },
  {
    id: v4(),
    name: '阿里巴巴',
    title: '通义千问',
    desc: '阿里云推出的超大规模语言模型，具备多轮对话能力。',
    avatar: 'https://www.alibabacloud.com/favicon.ico',
    createdAt: '2023-05-01',
    updatedAt: '2023-05-15',
    models: ['Qwen-Max', 'Qwen-Plus', 'Qwen-Turbo']
  },
  {
    id: v4(),
    name: '智谱AI',
    title: 'ChatGLM',
    desc: '清华大学技术成果转化的对话语言模型。',
    avatar: 'https://www.zhipuai.cn/favicon.ico',
    createdAt: '2023-06-01',
    updatedAt: '2023-06-12',
    models: ['ChatGLM-6B', 'ChatGLM2-6B', 'ChatGLM3-6B']
  }
]

export const conversations = [
  {
    id: v4(),
    title: '如何使用GPT-4进行代码生成',
    selectedModel: 'GPT-4o',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    providerId: providers[0].id
  },
  {
    id: v4(),
    title: 'Claude帮我写一个React组件',
    selectedModel: 'Claude-3.5-Sonnet',
    createdAt: '2023-12-02',
    updatedAt: '2023-12-02',
    providerId: providers[1].id
  },
  {
    id: v4(),
    title: 'Gemini多模态图像分析',
    selectedModel: 'Gemini-Pro',
    createdAt: '2023-12-03',
    updatedAt: '2023-12-03',
    providerId: providers[2].id
  },
  {
    id: v4(),
    title: '文心一言中文诗词创作',
    selectedModel: 'ERNIE-Bot-4.0',
    createdAt: '2023-12-04',
    updatedAt: '2023-12-04',
    providerId: providers[3].id
  },
  {
    id: v4(),
    title: '通义千问数据分析报告',
    selectedModel: 'Qwen-Max',
    createdAt: '2023-12-05',
    updatedAt: '2023-12-05',
    providerId: providers[4].id
  },
  {
    id: v4(),
    title: 'ChatGLM学术论文摘要',
    selectedModel: 'ChatGLM3-6B',
    createdAt: '2023-12-06',
    updatedAt: '2023-12-06',
    providerId: providers[5].id
  },
  {
    id: v4(),
    title: 'GPT-3.5 API集成问题',
    selectedModel: 'GPT-3.5-turbo',
    createdAt: '2023-12-07',
    updatedAt: '2023-12-08',
    providerId: providers[0].id
  },
  {
    id: v4(),
    title: 'Claude代码重构建议',
    selectedModel: 'Claude-3-Opus',
    createdAt: '2023-12-08',
    updatedAt: '2023-12-09',
    providerId: providers[1].id
  },
  {
    id: v4(),
    title: '百度文心翻译文档',
    selectedModel: 'ERNIE-Bot-turbo',
    createdAt: '2023-12-09',
    updatedAt: '2023-12-09',
    providerId: providers[3].id
  },
  {
    id: v4(),
    title: '阿里通义产品需求分析',
    selectedModel: 'Qwen-Plus',
    createdAt: '2023-12-10',
    updatedAt: '2023-12-11',
    providerId: providers[4].id
  }
]
