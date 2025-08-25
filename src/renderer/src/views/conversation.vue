<template>
  <div class="flex flex-col h-full bg-primary">
    <!-- 对话标题栏 - 丰富的信息展示和操作区域 -->
    <div class="conversation-header">
      <div class="conversation-header-content">
        <!-- 左侧：对话信息 -->
        <div class="conversation-info">
          <div class="conversation-main-info">
            <h1 class="conversation-title">{{ conversationStore.currentConversation?.title }}</h1>
            <div class="conversation-meta">
              <div class="model-badge">
                <span class="icon-[ri--cpu-line] w-3.5 h-3.5"></span>
                <span>{{ conversationStore.currentConversation?.selectedModel }}</span>
              </div>
              <div class="message-count">
                <span class="icon-[ri--message-3-line] w-3.5 h-3.5"></span>
                <span>{{ conversationStore.messageList.length }} 条消息</span>
              </div>
              <div class="last-active" v-if="conversationStore.currentConversation?.updatedAt">
                <span class="icon-[ri--time-line] w-3.5 h-3.5"></span>
                <span>{{ getTimeAgo(conversationStore.currentConversation.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="conversation-actions">
          <button class="action-btn" @click="clearConversation" title="清空对话">
            <span class="icon-[ri--delete-bin-line] w-4 h-4"></span>
          </button>
          <button class="action-btn" @click="exportConversation" title="导出对话">
            <span class="icon-[ri--download-line] w-4 h-4"></span>
          </button>
          <button class="action-btn" @click="shareConversation" title="分享对话">
            <span class="icon-[ri--share-line] w-4 h-4"></span>
          </button>
          <div class="action-divider"></div>
          <button class="action-btn" @click="toggleSettings" title="对话设置">
            <span class="icon-[ri--settings-3-line] w-4 h-4"></span>
          </button>
        </div>
      </div>

    </div>

    <!-- 消息列表部分 - 优化间距和最大宽度 -->
    <div ref="messagesContainer" class="flex-grow overflow-y-auto px-4 py-6 pb-36">
      <div class="max-w-4xl mx-auto w-full min-w-0">
        <div class="flex flex-col gap-6">
          <ChatMessageCard v-for="message in conversationStore.sortedMessages" :key="message.id"
            :content="message.content" :timestamp="message.createdAt"
            :is-user-message="message.type === MessageType.QUESTION"
            :model="conversationStore.currentConversation?.selectedModel" :status="message.status"
            :is-me-streaming="conversationStore.streamingMessageId === message.id" :message-id="message.id"
            :rendered-content="message.renderedContent" :files="message.files" />
        </div>
      </div>
    </div>

    <!-- 预设prompt面板 -->
    <div v-if="showPromptPanel" class="prompt-panel-overlay" @click="showPromptPanel = false">
      <div class="prompt-panel" @click.stop>
        <div class="prompt-panel-header">
          <h3 class="prompt-panel-title">选择预设Prompt</h3>
          <button @click="showPromptPanel = false" class="close-btn">
            <span class="icon-[ri--close-line] w-5 h-5"></span>
          </button>
        </div>

        <!-- 分类选择 -->
        <div class="prompt-categories">
          <button v-for="category in promptCategories" :key="category.id" @click="selectedCategory = category.id"
            :class="['category-btn', { active: selectedCategory === category.id }]">
            <!-- 编程开发 -->
            <span v-if="category.id === 'coding'" class="icon-[ri--code-line] w-4 h-4"></span>
            <!-- 写作助手 -->
            <span v-else-if="category.id === 'writing'" class="icon-[ri--quill-pen-line] w-4 h-4"></span>
            <!-- 分析总结 -->
            <span v-else-if="category.id === 'analysis'" class="icon-[ri--bar-chart-line] w-4 h-4"></span>
            <!-- 创意设计 -->
            <span v-else-if="category.id === 'creative'" class="icon-[ri--palette-line] w-4 h-4"></span>
            <!-- 学习教育 -->
            <span v-else-if="category.id === 'learning'" class="icon-[ri--book-open-line] w-4 h-4"></span>
            <!-- 商务办公 -->
            <span v-else-if="category.id === 'business'" class="icon-[ri--briefcase-line] w-4 h-4"></span>
            <!-- 默认 -->
            <span v-else class="icon-[ri--folder-line] w-4 h-4"></span>
            <span>{{ category.name }}</span>
          </button>
        </div>

        <!-- prompt列表 -->
        <div class="prompt-list">
          <div v-for="prompt in getPromptsByCategory(selectedCategory)" :key="prompt.id" @click="selectPrompt(prompt)"
            class="prompt-item">
            <div class="prompt-item-header">
              <!-- TODO: dynamic render with config file rather then using if else, blame to me🤮 ...-->
              <!-- 代码审查 -->
              <span v-if="prompt.id === 'code-review'" class="icon-[ri--search-eye-line] w-4 h-4"></span>
              <!-- 调试助手 -->
              <span v-else-if="prompt.id === 'debug-help'" class="icon-[ri--bug-line] w-4 h-4"></span>
              <!-- API设计 -->
              <span v-else-if="prompt.id === 'api-design'" class="icon-[icon-park-solid--api] w-4 h-4"></span>
              <!-- 文章写作 -->
              <span v-else-if="prompt.id === 'article-writing'" class="icon-[ri--article-line] w-4 h-4"></span>
              <!-- 邮件模板 -->
              <span v-else-if="prompt.id === 'email-template'" class="icon-[ri--mail-line] w-4 h-4"></span>
              <!-- 数据分析 -->
              <span v-else-if="prompt.id === 'data-analysis'" class="icon-[ri--line-chart-line] w-4 h-4"></span>
              <!-- 文档总结 -->
              <span v-else-if="prompt.id === 'document-summary'" class="icon-[ri--file-text-line] w-4 h-4"></span>
              <!-- 创意头脑风暴 -->
              <span v-else-if="prompt.id === 'creative-brainstorm'" class="icon-[ri--lightbulb-line] w-4 h-4"></span>
              <!-- 概念解释 -->
              <span v-else-if="prompt.id === 'explain-concept'" class="icon-[ri--question-answer-line] w-4 h-4"></span>
              <!-- 会议议程 -->
              <span v-else-if="prompt.id === 'meeting-agenda'" class="icon-[ri--calendar-check-line] w-4 h-4"></span>
              <!-- 默认 -->
              <span v-else class="icon-[ri--file-line] w-4 h-4"></span>
              <h4 class="prompt-title">{{ prompt.title }}</h4>
            </div>
            <p class="prompt-description">{{ prompt.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input-container">
      <div class="max-w-4xl mx-auto w-full px-6">
        <!-- 文件预览区域 -->
        <div v-if="uploadedFiles.length > 0" class="file-preview-area">
          <div class="file-preview-list">
            <div v-for="file in uploadedFiles" :key="file.id" class="file-preview-item">
              <!-- 文件类型图标 -->
              <div class="file-icon">
                <span v-if="file.type === 'image'" class="icon-[ri--image-line] w-3.5 h-3.5 text-blue-500"></span>
                <span v-else-if="file.type === 'pdf'" class="icon-[ri--file-pdf-line] w-3.5 h-3.5 text-red-500"></span>
                <span v-else-if="file.type === 'word'"
                  class="icon-[ri--file-word-line] w-3.5 h-3.5 text-blue-600"></span>
                <span v-else-if="file.type === 'markdown'"
                  class="icon-[ri--markdown-line] w-3.5 h-3.5 text-gray-600"></span>
                <span v-else-if="file.type === 'text'"
                  class="icon-[ri--file-text-line] w-3.5 h-3.5 text-green-600"></span>
                <span v-else-if="file.type === 'audio'"
                  class="icon-[ri--music-line] w-3.5 h-3.5 text-purple-500"></span>
                <span v-else-if="file.type === 'video'" class="icon-[ri--video-line] w-3.5 h-3.5 text-pink-500"></span>
                <span v-else class="icon-[ri--file-line] w-3.5 h-3.5 text-gray-500"></span>
              </div>

              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>

              <button @click="removeFile(file.id)" class="remove-btn" title="移除文件">
                <span class="icon-[ri--close-line] w-3 h-3"></span>
              </button>
            </div>
          </div>
        </div>

        <div class="message-input-wrapper">
          <div class="message-input-card">
            <!-- 预设prompt按钮 -->
            <button @click="togglePromptPanel" class="prompt-btn" title="选择预设Prompt">
              <span class="icon-[ri--magic-line] w-4 h-4"></span>
            </button>

            <!-- 文件上传按钮 -->
            <button @click="handleFileUploadClick" class="prompt-btn" :class="{ 'has-files': uploadedFiles.length > 0 }"
              :disabled="!hasAnyFileSupport"
              :title="!hasAnyFileSupport ? '当前模型不支持文件上传' : (uploadedFiles.length > 0 ? `已选择 ${uploadedFiles.length} 个文件` : '添加文件')">
              <span class="icon-[ri--attachment-2] w-4 h-4"></span>
              <span v-if="uploadedFiles.length > 0" class="file-count">{{ uploadedFiles.length }}</span>
            </button>

            <!-- 隐藏的文件输入 -->
            <input ref="fileInputRef" type="file" multiple :accept="acceptedTypes" @change="handleFileSelect"
              style="display: none" />

            <textarea placeholder="输入消息..." @keydown="handleKeyDown" @compositionstart="handleCompositionStart"
              @compositionend="handleCompositionEnd" v-model="messageContent" class="message-input" rows="1"
              ref="messageInputRef"></textarea>

            <button @click="handleSend" class="send-button"
              :disabled="!messageContent.trim() && conversationStore.messageStatus !== MessageStatus.STREAMING">
              <span
                :class="conversationStore.messageStatus !== MessageStatus.STREAMING ? 'icon-[ri--send-plane-line]' : 'icon-[ic--twotone-motion-photos-pause]'"
                class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatMessageCard from '../components/ChatMessageCard.vue'
import { nextTick, onMounted, ref, watch, computed } from 'vue';
import { db } from '@renderer/stores/db';
import { useRoute, useRouter } from 'vue-router';
import { MessageStatus, MessageType } from '@renderer/types/message';
import { nowWithMs, getTimeAgo } from '@renderer/utils/dateUtils';
import { StreamableData } from '@type/message';
import { useConversationStore } from '@renderer/stores';
import { promptTemplates, promptCategories, type PromptTemplate } from '@renderer/constants/prompts';
import { providers } from '@renderer/constants/data';

const route = useRoute()
const convertsationId = route.params.id as string
const messageContent = ref<string>('')
const router = useRouter()
const messagesContainer = ref<HTMLElement>()
const messageInputRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()

// 文件类型接口
interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content?: string
  file: File
}

// 文件上传相关状态
const uploadedFiles = ref<UploadedFile[]>([])

// 支持的文件类型
const supportedTypes = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'text/plain': 'text',
  'text/markdown': 'markdown',
  'text/csv': 'text',
  'application/json': 'text',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/mp4': 'audio',
  'video/mp4': 'video',
  'video/mpeg': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video'
}

const acceptedTypes = computed(() => {
  // 获取当前provider信息
  const currentProvider = conversationStore.currentConversation?.providerId
  if (!currentProvider) return Object.keys(supportedTypes).join(',')

  // 从providers数据中找到当前provider
  const provider = providers.find(p => p.id === currentProvider)
  const currentModel = conversationStore.currentConversation?.selectedModel

  if (!provider || !currentModel) return Object.keys(supportedTypes).join(',')

  // 找到当前模型的配置
  const modelConfig = provider.models.find(m => m.name === currentModel)
  if (!modelConfig) return Object.keys(supportedTypes).join(',')

  const allowedTypes = Object.values(supportedTypes).filter((fileType) => {
    // 根据模型的capabilities过滤支持的文件类型
    switch (fileType) {
      case 'image':
        return modelConfig.capabilities.image
      case 'audio':
        return modelConfig.capabilities.audio
      case 'video':
        return modelConfig.capabilities.video
      case 'pdf':
      case 'word':
        return modelConfig.capabilities.document
      case 'text':
      case 'markdown':
        return modelConfig.capabilities.text // 文本文件通常都支持
      default:
        return true
    }
  })

  return allowedTypes.map(([mimeType]) => mimeType).join(',')
})


// 检查当前provider是否支持任何类型的文件上传
const hasAnyFileSupport = computed(() => {
  const currentProvider = conversationStore.currentConversation?.providerId
  const currentModel = conversationStore.currentConversation?.selectedModel
  if (!currentProvider || !currentModel) return false
  const provider = conversationStore.providers.find(p => p.id === currentProvider)
  if (!provider) return false

  // 找到当前模型的配置
  const modelConfig = provider.models.find(m => {
    console.log(m.name === currentModel)
    return m.name === currentModel
  })

  console.log(modelConfig)
  if (!modelConfig) return false

  // 检查当前模型是否支持任何类型的文件
  const capabilities = modelConfig.capabilities
  return capabilities.image || capabilities.audio || capabilities.video ||
    capabilities.document
})

// 预prompt相关状态
const showPromptPanel = ref(false)
const selectedCategory = ref('coding')

// 使用 Pinia store
const conversationStore = useConversationStore()

// 滚动到底部
const scrollToBottom = async (smooth = false) => {
  await nextTick()
  if (messagesContainer.value) {
    if (smooth) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    } else {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
}

// 对话操作方法
const clearConversation = async () => {
  if (confirm('确定要清空这个对话吗？此操作不可撤销。')) {
    await conversationStore.clearConversation(convertsationId)
  }
}

const exportConversation = () => {
  const conversationData = {
    title: conversationStore.currentConversation?.title,
    model: conversationStore.currentConversation?.selectedModel,
    messages: conversationStore.sortedMessages.map(msg => ({
      type: msg.type === MessageType.QUESTION ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.createdAt
    })),
    exportTime: nowWithMs()
  }

  const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${conversationStore.currentConversation?.title || '对话'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const shareConversation = () => {
  // 这里可以实现分享功能，比如复制链接或生成分享码
  navigator.clipboard.writeText(window.location.href)
  alert('对话链接已复制到剪贴板')
}

const toggleSettings = () => {
  // 这里可以打开对话设置面板
  console.log('打开对话设置')
}

// 预设prompt相关方法
const togglePromptPanel = () => {
  showPromptPanel.value = !showPromptPanel.value
}

const selectPrompt = (prompt: PromptTemplate) => {
  messageContent.value = prompt.content
  showPromptPanel.value = false
}

const getPromptsByCategory = (category: string) => {
  return promptTemplates.filter(template => template.category === category)
}

// 文件上传处理函数
const handleFileUploadClick = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)

  for (const file of files) {
    // 检查文件类型
    const fileType = supportedTypes[file.type as keyof typeof supportedTypes]
    if (!fileType) {
      alert(`不支持的文件类型: ${file.type}`)
      continue
    }

    // 检查文件大小 (10MB限制)
    if (file.size > 10 * 1024 * 1024) {
      alert(`文件过大: ${file.name} (最大支持10MB)`)
      continue
    }

    // 创建文件对象
    const uploadedFile: UploadedFile = {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: fileType,
      file
    }

    // 如果是文本文件，读取内容
    if (fileType === 'text' || fileType === 'markdown') {
      try {
        const content = await readTextFile(file)
        uploadedFile.content = content
      } catch (error) {
        console.error('读取文件内容失败:', error)
        alert(`读取文件失败: ${file.name}`)
        continue
      }
    }

    uploadedFiles.value.push(uploadedFile)
  }

  // 清空input值，允许重复选择同一文件
  target.value = ''
}

const removeFile = (fileId: string) => {
  uploadedFiles.value = uploadedFiles.value.filter(file => file.id !== fileId)
}

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = (e) => {
      reject(e)
    }
    reader.readAsText(file)
  })
}

// 文件处理相关函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 生成文件内容描述，用于发送给AI
const generateFileContentPrompt = (): string => {
  if (uploadedFiles.value.length === 0) return ''

  let filePrompt = '\n\n以下是用户上传的文件内容：\n'

  uploadedFiles.value.forEach((file, index) => {
    filePrompt += `\n--- 文件 ${index + 1}: ${file.name} (${file.type}) ---\n`

    if (file.content) {
      // 文本文件直接包含内容
      filePrompt += file.content
    } else {
      // 非文本文件显示基本信息
      filePrompt += `[这是一个${file.type}文件，大小：${formatFileSize(file.size)}]`
    }
    filePrompt += '\n'
  })

  return filePrompt
}

const generateId = () => {
  return Math.random().toString(36).substring(2, 11)
}


// 自动调整textarea高度
const adjustTextareaHeight = () => {
  if (messageInputRef.value) {
    messageInputRef.value.style.height = 'auto'
    messageInputRef.value.style.height = Math.min(messageInputRef.value.scrollHeight, 120) + 'px'
  }
}

// 监听输入内容变化，自动调整高度
watch(messageContent, () => {
  nextTick(() => {
    adjustTextareaHeight()
  })
})

const handleCompositionStart = (event: CompositionEvent) => {
  if (event.target) {
    (event.target as HTMLTextAreaElement).dataset.composing = 'true'
  }
}

const handleCompositionEnd = (event: CompositionEvent) => {
  if (event.target) {
    (event.target as HTMLTextAreaElement).dataset.composing = 'false'
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  // 检查是否按下Enter键
  if (event.key === 'Enter') {
    // 如果是中文输入法组合输入状态，不发送消息
    if (event.isComposing || (event.target as HTMLTextAreaElement).dataset.composing === 'true') {
      return
    }

    // 如果是Shift+Enter，插入换行而不发送
    if (event.shiftKey) {
      return
    }

    // 阻止默认的换行行为并发送消息
    event.preventDefault()
    handleSend()
  }
}

const handleSend = async () => {
  if (messageContent.value.trim() === '') return

  // 组合消息内容：用户输入 + 文件内容
  const userMessage = messageContent.value
  const fileContent = generateFileContentPrompt()
  const fullContent = userMessage + fileContent

  messageContent.value = ''

  // 重置textarea高度
  nextTick(() => {
    adjustTextareaHeight()
  })

  try {
    // 准备要保存到消息中的文件信息
    const messageFiles = uploadedFiles.value.map(file => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type
    }))

    // 创建用户消息 - 只显示用户输入的部分，包含文件信息
    await conversationStore.createMessage(userMessage, convertsationId, messageFiles)

    // 滚动到底部显示新消息
    scrollToBottom()

    // 创建流式回复消息
    const streamingMessage = await conversationStore.createStreamingMessage(convertsationId)

    // 再次滚动到底部显示loading消息
    scrollToBottom()

    // 获取provider信息
    const providerInfo = await db.providers.where({ id: conversationStore.currentConversation?.providerId }).first()
    if (!providerInfo) {
      alert('无效的provider')
      return
    }

    // 准备对话历史 - 转换为大模型需要的格式
    const conversationHistory = conversationStore.sortedMessages
      .filter(msg => msg.content.trim() !== '' && msg.status === MessageStatus.FINISHED) // 过滤空消息和未完成的消息
      .slice(-10) // 只取最近10条消息避免token过多
      .map(msg => ({
        role: msg.type === MessageType.QUESTION ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))

    console.log('Sending conversation history:', conversationHistory)

    // 准备文件数据（仅支持文档解析的文件）
    const filesForLLM: { id: string, name: string, type: string, size: number, buffer: ArrayBuffer }[] = []
    for (const file of uploadedFiles.value) {
      if (['pdf', 'word'].includes(file.type)) {
        try {
          const arrayBuffer = await file.file.arrayBuffer()
          filesForLLM.push({
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            buffer: arrayBuffer
          })
        } catch (error) {
          console.error('读取文件失败:', error)
          alert(`读取文件失败: ${file.name}`)
        }
      }
    }

    // 发送消息到主进程 - 使用完整内容（包含文件内容）
    const sendData = {
      content: fullContent,
      providerName: providerInfo?.name || '',
      model: conversationStore.currentConversation?.selectedModel || '',
      messageId: streamingMessage.id,
      conversationHistory, // 包含对话历史
      files: filesForLLM // 需要LLM解析的文件
    }

    console.log('Sending question to main process:', sendData)
    window.chatAPI.sendQuestion(sendData)

    // 清空已上传的文件
    uploadedFiles.value = []
  } catch (error) {
    console.error('Failed to send message:', error)
    alert('发送消息失败')
  }
}


onMounted(async () => {
  if (messageInputRef.value) {
    messageInputRef.value.focus()
  }
  try {
    // 加载对话
    await conversationStore.loadConversation(convertsationId)

    // 加载完消息后滚动到底部
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load conversation:', error)
    alert('会话不存在')
    router.push('/')
  }

  // 监听流式消息
  window.chatAPI.streamMessage((data: StreamableData) => {
    console.log('Renderer received stream data:', data)

    try {
      // 同步更新消息内容 - 现在是同步的，不会阻塞
      conversationStore.updateStreamingMessage(
        data.messageId,
        data.data.result || '',
        data.data.is_end
      )

      // 如果是流式消息，滚动到底部以跟随内容
      if (conversationStore.messageStatus === MessageStatus.STREAMING) {
        // 使用requestAnimationFrame确保滚动不阻塞渲染
        requestAnimationFrame(() => {
          scrollToBottom(false)
        })
      }
    } catch (error) {
      console.error('Error updating streaming message:', error)
    }
  })
})

watch(() => route.params.id, async (newId) => {
  if (newId && typeof newId === 'string') {
    try {
      await conversationStore.loadConversation(newId)
      // 切换对话后滚动到底部
      scrollToBottom()
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }
})

// 监听消息列表变化，自动滚动到底部
watch(() => conversationStore.messageList.length, () => {
  scrollToBottom()
}, { flush: 'post' })


</script>

<style scoped>
/* 对话标题栏样式 */
.conversation-header {
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 50;
}

.conversation-header-content {
  width: 100%;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

/* 对话信息区域 */
.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-main-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conversation-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.025em;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.conversation-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.model-badge,
.message-count,
.last-active {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.model-badge {
  background: var(--bg-accent);
  color: var(--color-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(79, 127, 222, 0.2);
}

/* 操作按钮区域 */
.conversation-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.action-btn:hover {
  background: var(--bg-accent);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0) scale(0.95);
}

.action-divider {
  width: 1px;
  height: 1.5rem;
  background: var(--border-color);
  margin: 0 0.25rem;
}

/* 状态指示器 */
.conversation-status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  height: 2px;
  overflow: hidden;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: var(--bg-accent);
  border-radius: 0 0 0.5rem 0.5rem;
  position: absolute;
  top: -2.5rem;
  right: 1.5rem;
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(79, 127, 222, 0.15);
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 0.25rem;
  height: 0.25rem;
  background: var(--color-primary);
  border-radius: 50%;
  animation: typing-pulse 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0s;
}

@keyframes typing-pulse {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .conversation-header-content {
    padding: 1rem;
    gap: 1rem;
  }

  .conversation-title {
    font-size: 1rem;
  }

  .conversation-meta {
    gap: 0.75rem;
  }

  .model-badge,
  .message-count,
  .last-active {
    font-size: 0.7rem;
  }

  .action-btn {
    width: 2rem;
    height: 2rem;
  }

  .last-active {
    display: none;
  }
}

/* 聊天输入框容器样式 - 现代化设计 */
.chat-input-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 70%, transparent 100%);
  padding: 1.5rem 0 2rem 0;
  backdrop-filter: blur(8px);
  z-index: 10;
}

/* 文件预览区域样式 - 类似ChatGPT */
.file-preview-area {
  margin-bottom: 0.75rem;
}

.file-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.file-preview-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  transition: all 0.15s ease;
  max-width: 200px;
}

.file-preview-item:hover {
  background: var(--bg-accent);
  border-color: var(--color-primary);
}

.file-preview-item .file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-preview-item .file-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}

.file-preview-item .file-name {
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.file-preview-item .file-size {
  color: var(--text-secondary);
  font-size: 0.6875rem;
  line-height: 1;
}

.file-preview-item .remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  opacity: 0.7;
}

.file-preview-item .remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  opacity: 1;
}

/* 文件上传按钮样式 */
.prompt-btn.has-files {
  background: var(--bg-accent);
  color: var(--color-primary);
}

.file-count {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  font-size: 0.6rem;
  font-weight: 600;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1rem;
}

.message-input-wrapper {
  position: relative;
}

.message-input-card {
  display: flex;
  align-items: center;
  background-color: var(--bg-secondary);
  border: 1.5px solid var(--border-color);
  border-radius: 1.5rem;
  padding: 0.75rem 1rem;
  transition: all var(--transition-normal);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.02);
}

.message-input-card:focus-within {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 3px rgba(79, 127, 222, 0.1),
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.message-input {
  flex-grow: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.5;
  caret-color: var(--color-primary);
  transition: all var(--transition-normal);
  padding: 0.25rem 0;
}

.message-input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--color-primary);
  color: var(--text-on-primary);
  border: none;
  border-radius: 50%;
  margin-left: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 8px rgba(79, 127, 222, 0.3);
}

.send-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 12px rgba(79, 127, 222, 0.4);
}

.send-button:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.send-button:disabled {
  background-color: var(--color-secondary);
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

/* 预设prompt按钮 */
.prompt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-right: 0.5rem;
}

.prompt-btn:hover:not(:disabled) {
  background: var(--bg-accent);
  color: var(--color-primary);
}

.prompt-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  color: var(--text-muted);
}

.prompt-btn:disabled:hover {
  background: transparent;
  color: var(--text-muted);
}

/* 将input改为textarea */
.message-input {
  flex-grow: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.5;
  caret-color: var(--color-primary);
  transition: all var(--transition-normal);
  padding: 0.25rem 0;
  resize: none;
  min-height: 1.5rem;
  max-height: 120px;
  overflow-y: auto;
  font-family: inherit;
}

/* 预设prompt面板样式 */
.prompt-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.prompt-panel {
  background: var(--bg-primary);
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.prompt-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.prompt-panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.close-btn:hover {
  background: var(--bg-accent);
  color: var(--text-primary);
}

/* 分类选择 */
.prompt-categories {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
}

.category-btn:hover {
  background: var(--bg-accent);
  color: var(--text-primary);
}

.category-btn.active {
  background: var(--color-primary);
  color: var(--text-on-primary);
  border-color: var(--color-primary);
}

/* prompt列表 */
.prompt-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.prompt-item {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--bg-secondary);
}

.prompt-item:hover {
  border-color: var(--color-primary);
  background: var(--bg-accent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 127, 222, 0.1);
}

.prompt-item:last-child {
  margin-bottom: 0;
}

.prompt-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.prompt-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.prompt-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prompt-panel-overlay {
    padding: 1rem;
  }

  .prompt-panel {
    max-height: 90vh;
  }

  .prompt-categories {
    padding: 0.75rem 1rem;
  }

  .category-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .prompt-list {
    padding: 0.75rem;
  }

  .prompt-item {
    padding: 0.75rem;
  }
}

.status-text {
  color: var(--text-primary)
}
</style>
