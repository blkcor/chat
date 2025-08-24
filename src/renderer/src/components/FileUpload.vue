<template>
  <!-- 文件预览区域 - 显示在输入框上方 -->
  <div v-if="uploadedFiles.length > 0" class="file-preview-area">
    <div class="file-preview-list">
      <div 
        v-for="file in uploadedFiles" 
        :key="file.id"
        class="file-preview-item"
      >
        <!-- 文件类型图标 -->
        <div class="file-icon">
          <!-- 图片文件 -->
          <span v-if="file.type === 'image'" class="icon-[ri--image-line] w-3.5 h-3.5 text-blue-500"></span>
          <!-- PDF文件 -->
          <span v-else-if="file.type === 'pdf'" class="icon-[ri--file-pdf-line] w-3.5 h-3.5 text-red-500"></span>
          <!-- Word文档 -->
          <span v-else-if="file.type === 'word'" class="icon-[ri--file-word-line] w-3.5 h-3.5 text-blue-600"></span>
          <!-- Markdown文件 -->
          <span v-else-if="file.type === 'markdown'" class="icon-[ri--markdown-line] w-3.5 h-3.5 text-gray-600"></span>
          <!-- 文本文件 -->
          <span v-else-if="file.type === 'text'" class="icon-[ri--file-text-line] w-3.5 h-3.5 text-green-600"></span>
          <!-- 音频文件 -->
          <span v-else-if="file.type === 'audio'" class="icon-[ri--music-line] w-3.5 h-3.5 text-purple-500"></span>
          <!-- 视频文件 -->
          <span v-else-if="file.type === 'video'" class="icon-[ri--video-line] w-3.5 h-3.5 text-pink-500"></span>
          <!-- 默认文件 -->
          <span v-else class="icon-[ri--file-line] w-3.5 h-3.5 text-gray-500"></span>
        </div>
        
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>

        <button 
          @click="removeFile(file.id)"
          class="remove-btn"
          title="移除文件"
        >
          <span class="icon-[ri--close-line] w-3 h-3"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- 文件上传按钮 -->
  <div class="file-upload-container">
    <button 
      @click="handleUploadClick" 
      class="upload-btn" 
      :class="{ 'has-files': uploadedFiles.length > 0 }"
      :title="uploadedFiles.length > 0 ? `已选择 ${uploadedFiles.length} 个文件` : '添加文件'"
    >
      <span class="icon-[ri--attachment-2] w-4 h-4"></span>
      <span v-if="uploadedFiles.length > 0" class="file-count">{{ uploadedFiles.length }}</span>
    </button>

    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput"
      type="file" 
      multiple
      :accept="acceptedTypes"
      @change="handleFileSelect"
      class="hidden-file-input"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { generateId } from '@renderer/utils/idUtils'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content?: string // 文件内容（文本文件）
  file: File // 原始文件对象
}

const fileInput = ref<HTMLInputElement>()
const uploadedFiles = ref<UploadedFile[]>([])

// 支持的文件类型
const supportedTypes = {
  // 图片
  'image/jpeg': 'image',
  'image/png': 'image', 
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  // 文档
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  // 文本
  'text/plain': 'text',
  'text/markdown': 'markdown',
  'text/csv': 'text',
  'application/json': 'text',
  // 音频
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/mp4': 'audio',
  // 视频
  'video/mp4': 'video',
  'video/mpeg': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video'
}

const acceptedTypes = computed(() => {
  return Object.keys(supportedTypes).join(',')
})

// 事件定义
const emit = defineEmits<{
  filesChanged: [files: UploadedFile[]]
}>()

const handleUploadClick = () => {
  fileInput.value?.click()
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
  
  // 通知父组件文件变化
  emit('filesChanged', uploadedFiles.value)
}

const removeFile = (fileId: string) => {
  uploadedFiles.value = uploadedFiles.value.filter(file => file.id !== fileId)
  emit('filesChanged', uploadedFiles.value)
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 暴露方法给父组件
const clearFiles = () => {
  uploadedFiles.value = []
  emit('filesChanged', uploadedFiles.value)
}

defineExpose({
  clearFiles,
  uploadedFiles: uploadedFiles
})
</script>

<style scoped>
.file-upload-container {
  position: relative;
}

.upload-btn {
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
  position: relative;
}

.upload-btn:hover {
  background: var(--bg-accent);
  color: var(--color-primary);
}

.upload-btn.has-files {
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

.hidden-file-input {
  display: none;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .uploaded-files-list {
    max-height: 150px;
    left: -1rem;
    right: -1rem;
  }
  
  .file-name {
    font-size: 0.75rem;
  }
  
  .file-size {
    font-size: 0.65rem;
  }
}
</style>