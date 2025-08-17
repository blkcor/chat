import { Provider } from '../types/provider'
import { v4 } from 'uuid'
import { now, subtractTime } from '../utils/dateUtils'

export const providers: Array<Provider> = [
  {
    id: v4(),
    name: 'OpenAI',
    title: '你不知道opneai?',
    desc: 'OpenAI是一个人工智能研究实验室，致力于推动数字智能的边界。',
    avatar: 'https://openai.com/favicon.ico',
    createdAt: subtractTime(now(), 30, 'day'),
    updatedAt: subtractTime(now(), 1, 'day'),
    models: ['GPT-4o', 'GPT-4', 'GPT-3.5-turbo']
  },
  {
    id: v4(),
    name: 'Anthropic',
    title: 'Claude AI助手',
    desc: 'Anthropic开发的Claude是一个安全、有用且无害的AI助手。',
    avatar: 'https://www.anthropic.com/favicon.ico',
    createdAt: subtractTime(now(), 25, 'day'),
    updatedAt: subtractTime(now(), 2, 'hour'),
    models: ['Claude-3.5-Sonnet', 'Claude-3-Opus', 'Claude-3-Haiku']
  },
  {
    id: v4(),
    name: 'Google',
    title: 'Gemini AI',
    desc: 'Google最新的多模态AI模型，支持文本、图像和代码理解。',
    avatar: 'https://www.google.com/favicon.ico',
    createdAt: subtractTime(now(), 20, 'day'),
    updatedAt: subtractTime(now(), 3, 'hour'),
    models: ['Gemini-Pro', 'Gemini-Ultra', 'Gemini-Nano']
  },
  {
    id: v4(),
    name: '百度',
    title: '文心一言',
    desc: '百度全知识增强的大语言模型，中文理解能力强。',
    avatar: 'https://www.baidu.com/favicon.ico',
    createdAt: subtractTime(now(), 15, 'day'),
    updatedAt: subtractTime(now(), 1, 'hour'),
    models: ['ERNIE-Bot-4.0', 'ERNIE-Bot-turbo', 'ERNIE-Bot']
  },
  {
    id: v4(),
    name: '阿里巴巴',
    title: '通义千问',
    desc: '阿里云推出的超大规模语言模型，具备多轮对话能力。',
    avatar: 'https://www.alibabacloud.com/favicon.ico',
    createdAt: subtractTime(now(), 10, 'day'),
    updatedAt: subtractTime(now(), 30, 'minute'),
    models: ['Qwen-Max', 'Qwen-Plus', 'Qwen-Turbo']
  },
  {
    id: v4(),
    name: '智谱AI',
    title: 'ChatGLM',
    desc: '清华大学技术成果转化的对话语言模型。',
    avatar: 'https://www.zhipuai.cn/favicon.ico',
    createdAt: subtractTime(now(), 5, 'day'),
    updatedAt: subtractTime(now(), 15, 'minute'),
    models: ['ChatGLM-6B', 'ChatGLM2-6B', 'ChatGLM3-6B']
  }
]

export const conversations = [
  {
    id: v4(),
    title: '如何使用GPT-4进行代码生成',
    selectedModel: 'GPT-4o',
    createdAt: subtractTime(now(), 2, 'hour'),
    updatedAt: subtractTime(now(), 30, 'minute'),
    providerId: providers[0].id
  },
  {
    id: v4(),
    title: 'Claude帮我写一个React组件',
    selectedModel: 'Claude-3.5-Sonnet',
    createdAt: subtractTime(now(), 1, 'day'),
    updatedAt: subtractTime(now(), 1, 'hour'),
    providerId: providers[1].id
  },
  {
    id: v4(),
    title: 'Gemini多模态图像分析',
    selectedModel: 'Gemini-Pro',
    createdAt: subtractTime(now(), 2, 'day'),
    updatedAt: subtractTime(now(), 2, 'hour'),
    providerId: providers[2].id
  },
  {
    id: v4(),
    title: '文心一言中文诗词创作',
    selectedModel: 'ERNIE-Bot-4.0',
    createdAt: subtractTime(now(), 3, 'day'),
    updatedAt: subtractTime(now(), 1, 'day'),
    providerId: providers[3].id
  },
  {
    id: v4(),
    title: '通义千问数据分析报告',
    selectedModel: 'Qwen-Max',
    createdAt: subtractTime(now(), 5, 'day'),
    updatedAt: subtractTime(now(), 3, 'day'),
    providerId: providers[4].id
  },
  {
    id: v4(),
    title: 'ChatGLM学术论文摘要',
    selectedModel: 'ChatGLM3-6B',
    createdAt: subtractTime(now(), 1, 'day'),
    updatedAt: subtractTime(now(), 4, 'hour'),
    providerId: providers[5].id
  },
  {
    id: v4(),
    title: 'GPT-3.5 API集成问题',
    selectedModel: 'GPT-3.5-turbo',
    createdAt: subtractTime(now(), 7, 'day'),
    updatedAt: subtractTime(now(), 6, 'day'),
    providerId: providers[0].id
  },
  {
    id: v4(),
    title: 'Claude代码重构建议',
    selectedModel: 'Claude-3-Opus',
    createdAt: subtractTime(now(), 3, 'day'),
    updatedAt: subtractTime(now(), 2, 'day'),
    providerId: providers[1].id
  },
  {
    id: v4(),
    title: '百度文心翻译文档',
    selectedModel: 'ERNIE-Bot-turbo',
    createdAt: subtractTime(now(), 4, 'day'),
    updatedAt: subtractTime(now(), 4, 'day'),
    providerId: providers[3].id
  },
  {
    id: v4(),
    title: '阿里通义产品需求分析',
    selectedModel: 'Qwen-Plus',
    createdAt: subtractTime(now(), 6, 'day'),
    updatedAt: subtractTime(now(), 5, 'day'),
    providerId: providers[4].id
  }
]
