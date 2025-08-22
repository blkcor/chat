interface WorkerMessage {
  id: string
  content: string
}

interface WorkerResponse {
  id: string
  success: boolean
  result?: string
  error?: string
}

let worker: Worker | null = null
let requestId = 0
const pendingRequests = new Map<
  string,
  { resolve: (value: string) => void; reject: (error: Error) => void }
>()

const getWorker = () => {
  if (!worker) {
    worker = new Worker(new URL('../workers/markdown-worker.ts', import.meta.url), {
      type: 'module'
    })

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, success, result, error } = event.data
      const request = pendingRequests.get(id)

      if (request) {
        pendingRequests.delete(id)
        if (success && result) {
          request.resolve(result)
        } else {
          request.reject(new Error(error || 'Markdown rendering failed'))
        }
      }
    }

    worker.onerror = (error) => {
      console.error('Worker error:', error)
      for (const [id, request] of pendingRequests) {
        request.reject(new Error('Worker error occurred'))
        pendingRequests.delete(id)
      }
    }
  }
  return worker
}

export const renderMarkdown = (content: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const id = `request-${++requestId}`
    pendingRequests.set(id, { resolve, reject })

    const worker = getWorker()
    worker.postMessage({ id, content } as WorkerMessage)
  })
}

// 复制代码函数
export const copyCodeToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('复制失败:', err)
    return false
  }
}
