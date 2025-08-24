import { Provider } from '../types/provider'
import { generateProviderId } from '../utils/idUtils'
import { now, subtractTime } from '../utils/dateUtils'
import geminiIcon from '../assets/images/gemini.svg'
import qianfanIcon from '../assets/images/qianfan.svg'
import alibabaIcon from '../assets/images/alibaba.svg'

const defaultSystemPrompt = '请始终使用Markdown格式回复。代码请用```代码块包围，列表使用-或数字编号，标题使用#标记，重要内容用**加粗**，链接用[文字](url)格式。但是在回复中不要携带任何相关的提示信息'

export const providers: Array<Provider> = [
  // {
  //   id: v4(),
  //   name: 'openAI',
  //   title: 'OpenAI',
  //   desc: 'OpenAI是一个人工智能研究实验室，致力于推动数字智能的边界。',
  //   avatar: 'https://openai.com/favicon.ico',
  //   createdAt: subtractTime(now(), 30, 'day'),
  //   updatedAt: subtractTime(now(), 1, 'day'),
  //   models: ['GPT-4o', 'GPT-4', 'GPT-3.5-turbo'],
  //   capabilities: {
  //     text: true,
  //     image: true,
  //     audio: false,
  //     video: false,
  //     document: false
  //   },
  //   config: {
  //     apiKeyEnv: 'OPENAI_API_KEY',
  //     baseURL: 'https://api.openai.com/v1',
  //     systemPrompt: defaultSystemPrompt
  //   }
  // },
  // {
  //   id: v4(),
  //   name: 'anthropic',
  //   title: 'Claude',
  //   desc: 'Anthropic开发的Claude是一个安全、有用且无害的AI助手。',
  //   avatar: 'https://www.anthropic.com/favicon.ico',
  //   createdAt: subtractTime(now(), 25, 'day'),
  //   updatedAt: subtractTime(now(), 2, 'hour'),
  //   models: ['Claude-3.5-Sonnet', 'Claude-3-Opus', 'Claude-3-Haiku'],
  //   capabilities: {
  //     text: true,
  //     image: true,
  //     audio: false,
  //     video: false,
  //     document: true
  //   },
  //   config: {
  //     apiKeyEnv: 'ANTHROPIC_API_KEY',
  //     baseURL: 'https://api.anthropic.com',
  //     systemPrompt: defaultSystemPrompt
  //   }
  // },
  {
    id: generateProviderId(),
    name: 'google',
    title: 'Gemini',
    desc: 'Google最新的多模态AI模型，支持文本、图像和代码理解。',
    avatar: geminiIcon,
    createdAt: subtractTime(now(), 20, 'day'),
    updatedAt: subtractTime(now(), 3, 'hour'),
    models: ['gemini-2.5-flash'],
    capabilities: {
      text: true,
      image: true,
      audio: false,
      video: true,
      document: false
    },
    config: {
      apiKeyEnv: 'GEMINI_API_KEY',
      baseURL: 'https://api.aiproxy.io/google/v1beta/openai',
      systemPrompt: defaultSystemPrompt
    }
  },
  {
    id: generateProviderId(),
    name: 'qianfan',
    title: '百度千帆',
    desc: '百度全知识增强的大语言模型，中文理解能力强。',
    avatar: qianfanIcon,
    createdAt: subtractTime(now(), 15, 'day'),
    updatedAt: subtractTime(now(), 1, 'hour'),
    models: ['ernie-speed-128k'],
    capabilities: {
      text: true,
      image: false,
      audio: false,
      video: false,
      document: false
    },
    config: {
      apiKeyEnv: 'QIANFAN_API_KEY',
      baseURL: 'https://qianfan.baidubce.com/v2/',
      systemPrompt: defaultSystemPrompt
    }
  },
  {
    id: generateProviderId(),
    name: 'dashscope',
    title: '阿里灵积',
    desc: '阿里云推出的超大规模语言模型，具备多轮对话能力。',
    avatar: alibabaIcon,
    createdAt: subtractTime(now(), 10, 'day'),
    updatedAt: subtractTime(now(), 30, 'minute'),
    models: ['qwen-turbo', 'qwen-long', 'qwen-vl-plus', 'qwen-image'],
    capabilities: {
      text: true,
      image: true,
      audio: false,
      video: false,
      document: true
    },
    config: {
      apiKeyEnv: 'DASHSCOPE_API_KEY',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      systemPrompt: defaultSystemPrompt
    }
  }
]
