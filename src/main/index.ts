import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { SendMessage, StreamableData } from '../types/message'
import dotenv from 'dotenv'
import { providerConfigs, getProviderApiKey, uploadFileToLLM } from './constants/providerConfig'

dotenv.config()

// 检查模型是否支持文档解析
function supportsDocumentParsing(model: string): boolean {
  // 目前只有qwen-long支持文档解析
  return model === 'qwen-long'
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200, // 统一使用合适的默认宽度
    height: 800, // 增加一些高度以获得更好的体验
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: is.dev ? false : true // 开发模式下禁用web安全以便调试
    }
  })

  ipcMain.on('send-question', async (_event, data: SendMessage) => {
    const { content, providerName, model, messageId, conversationHistory = [], files = [] } = data

    // Get provider configuration
    const providerConfig = providerConfigs[providerName]
    if (!providerConfig) {
      console.error(`Unsupported provider: ${providerName}`)
      mainWindow.webContents.send('stream-message', {
        data: { is_end: true, result: `Unsupported provider: ${providerName}` },
        messageId
      })
      return
    }

    // Get API key
    const apiKey = getProviderApiKey(providerName)
    if (!apiKey) {
      console.error(`API key not found for provider: ${providerName}`)
      mainWindow.webContents.send('stream-message', {
        data: { is_end: true, result: `API key not configured for ${providerName}` },
        messageId
      })
      return
    }

    try {
      // Create OpenAI client using provider configuration
      const openai = providerConfig.createClient(apiKey)

      console.log(`Using ${providerName} with model: ${model}`)

      // 准备消息列表
      let messages: any[] = [
        {
          role: 'system',
          content: providerConfig.systemPrompt
        },
        ...conversationHistory
      ]

      // 处理文档解析功能（仅对支持的模型）
      if (files.length > 0 && supportsDocumentParsing(model)) {
        
        console.log(`Processing ${files.length} files for document parsing`)
        
        // 上传文件并获取file IDs
        const fileIds: string[] = []
        for (const file of files) {
          try {
            const fileBuffer = Buffer.from(file.buffer)
            const fileId = await uploadFileToLLM(openai, fileBuffer, file.name)
            fileIds.push(fileId)
            console.log(`Uploaded file: ${file.name} -> ${fileId}`)
          } catch (error) {
            console.error(`Failed to upload file ${file.name}:`, error)
            mainWindow.webContents.send('stream-message', {
              data: { is_end: true, result: `Failed to upload file: ${file.name}` },
              messageId
            })
            return
          }
        }

        // 修改系统消息以包含文件ID
        if (fileIds.length > 0) {
          const fileIdContent = fileIds.map(id => `fileid://${id}`).join('\n')
          messages[0] = {
            role: 'system',
            content: fileIdContent
          }
        }
      }

      // 添加用户消息
      messages.push({
        role: 'user',
        content
      })

      console.log('Messages to send:', messages.map(m => ({ role: m.role, content: m.content.substring(0, 100) + '...' })))

      const completion = await openai.chat.completions.create({
        model,
        messages,
        stream: true
      })

      for await (const chunk of completion) {
        const { choices } = chunk
        const { delta, finish_reason } = choices[0]
        const { content } = delta
        console.log('get content, ', content)
        const streamData: StreamableData = {
          data: {
            is_end: finish_reason ? true : false,
            result: content || ''
          },
          messageId
        }
        mainWindow.webContents.send('stream-message', streamData)
      }
    } catch (error) {
      console.error(`${providerName} completion error:`, error)
      // Send error end signal
      mainWindow.webContents.send('stream-message', {
        data: {
          is_end: true,
          result: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        messageId
      })
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // 开发者工具不再自动打开，可通过快捷键手动打开
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)

    // 添加自定义快捷键
    if (is.dev) {
      // F12 切换开发者工具
      window.webContents.on('before-input-event', (_event, input) => {
        if (input.key === 'F12') {
          if (window.webContents.isDevToolsOpened()) {
            window.webContents.closeDevTools()
          } else {
            window.webContents.openDevTools({ mode: 'right' })
          }
        }
        // Ctrl+Shift+I 也可以切换开发者工具
        if (input.control && input.shift && input.key === 'I') {
          if (window.webContents.isDevToolsOpened()) {
            window.webContents.closeDevTools()
          } else {
            window.webContents.openDevTools({ mode: 'bottom' })
          }
        }
      })
    }
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
