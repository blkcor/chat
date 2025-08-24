import { Provider } from '../types/provider'
import { generateProviderId } from '../utils/idUtils'
import { now, subtractTime } from '../utils/dateUtils'
import geminiIcon from '../assets/images/gemini.svg'
import qianfanIcon from '../assets/images/qianfan.svg'
import alibabaIcon from '../assets/images/alibaba.svg'

const defaultSystemPrompt =
  '请始终使用Markdown格式回复。代码请用```代码块包围，列表使用-或数字编号，标题使用#标记，重要内容用**加粗**，链接用[文字](url)格式。但是在回复中不要携带任何相关的提示信息'

export const providers: Array<Provider> = [
  {
    id: generateProviderId(),
    name: 'google',
    title: 'Gemini',
    desc: 'Google最新的多模态AI模型，支持文本、图像和代码理解。',
    avatar: geminiIcon,
    createdAt: subtractTime(now(), 20, 'day'),
    updatedAt: subtractTime(now(), 3, 'hour'),
    models: [
      {
        name: 'gemini-2.5-flash',
        capabilities: {
          text: true,
          image: true,
          audio: false,
          video: true,
          document: false
        }
      }
    ],
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
    models: [
      {
        name: 'ernie-speed-128k',
        capabilities: {
          text: true,
          image: false,
          audio: false,
          video: false,
          document: false
        }
      }
    ],
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
    models: [
      {
        name: 'qwen-turbo',
        capabilities: {
          text: true,
          image: false,
          audio: false,
          video: false,
          document: false
        }
      },
      {
        name: 'qwen-long',
        capabilities: {
          text: true,
          image: false,
          audio: false,
          video: false,
          document: true
        }
      },
      {
        name: 'qwen-vl-plus',
        capabilities: {
          text: true,
          image: true,
          audio: false,
          video: false,
          document: false
        }
      },
      {
        name: 'qwen-image',
        capabilities: {
          text: true,
          image: true,
          audio: false,
          video: false,
          document: false
        }
      }
    ],
    config: {
      apiKeyEnv: 'DASHSCOPE_API_KEY',
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      systemPrompt: defaultSystemPrompt
    }
  }
]
