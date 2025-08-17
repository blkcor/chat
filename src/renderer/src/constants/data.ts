import { Provider } from '../types/provider'
import { v4 } from 'uuid'
import { now, subtractTime } from '../utils/dateUtils'

export const providers: Array<Provider> = [
  // {
  //   id: v4(),
  //   name: 'openAI',
  //   title: 'OpenAI',
  //   desc: 'OpenAI是一个人工智能研究实验室，致力于推动数字智能的边界。',
  //   avatar: 'https://openai.com/favicon.ico',
  //   createdAt: subtractTime(now(), 30, 'day'),
  //   updatedAt: subtractTime(now(), 1, 'day'),
  //   models: ['GPT-4o', 'GPT-4', 'GPT-3.5-turbo']
  // },
  // {
  //   id: v4(),
  //   name: 'anthropic',
  //   title: 'Claude',
  //   desc: 'Anthropic开发的Claude是一个安全、有用且无害的AI助手。',
  //   avatar: 'https://www.anthropic.com/favicon.ico',
  //   createdAt: subtractTime(now(), 25, 'day'),
  //   updatedAt: subtractTime(now(), 2, 'hour'),
  //   models: ['Claude-3.5-Sonnet', 'Claude-3-Opus', 'Claude-3-Haiku']
  // },
  // {
  //   id: v4(),
  //   name: 'google',
  //   title: 'Gemini',
  //   desc: 'Google最新的多模态AI模型，支持文本、图像和代码理解。',
  //   avatar: 'https://www.google.com/favicon.ico',
  //   createdAt: subtractTime(now(), 20, 'day'),
  //   updatedAt: subtractTime(now(), 3, 'hour'),
  //   models: ['Gemini-Pro', 'Gemini-Ultra', 'Gemini-Nano']
  // },
  {
    id: v4(),
    name: 'qianfan',
    title: '百度千帆',
    desc: '百度全知识增强的大语言模型，中文理解能力强。',
    avatar: 'https://www.baidu.com/favicon.ico',
    createdAt: subtractTime(now(), 15, 'day'),
    updatedAt: subtractTime(now(), 1, 'hour'),
    models: ['ERNIE-Speed-128K', 'ERNIE-Speed-8K', 'ERNIE-Lite-8K-0308', 'ERNIE-Tiny-8K']
  },
  {
    id: v4(),
    name: 'dashscope',
    title: '阿里灵积',
    desc: '阿里云推出的超大规模语言模型，具备多轮对话能力。',
    avatar: 'https://www.alibabacloud.com/favicon.ico',
    createdAt: subtractTime(now(), 10, 'day'),
    updatedAt: subtractTime(now(), 30, 'minute'),
    models: ['Qwen-Max', 'Qwen-Plus', 'Qwen-Turbo']
  }
]
