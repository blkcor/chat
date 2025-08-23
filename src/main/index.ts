import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { SendMessage, StreamableData } from '../types/message'
import { ChatCompletion } from '@baiducloud/qianfan'

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
    const { content, providerName, model, messageId, conversationHistory = [] } = data

    if (providerName === 'qianfan') {
      try {
        const client = new ChatCompletion()

        const stream = await client.chat(
          {
            messages: [
              // 系统提示词：确保所有回复都使用Markdown格式
              {
                role: 'assistant',
                content:
                  '请始终使用Markdown格式回复。代码请用```代码块包围，列表使用-或数字编号，标题使用#标记，重要内容用**加粗**，链接用[文字](url)格式。但是在回复中不要携带任何相关的提示信息'
              },
              ...conversationHistory, // 包含历史对话
              {
                role: 'user',
                content
              }
            ],
            stream: true
          },
          model
        )

        const processStream = async () => {
          try {
            for await (const chunk of stream as AsyncIterableIterator<any>) {
              const { is_end, result } = chunk

              // 确保 result 不为 undefined
              const streamData: StreamableData = {
                data: {
                  is_end,
                  result: result || ''
                },
                messageId
              }

              // 立即发送数据，不等待
              mainWindow.webContents.send('stream-message', streamData)

              // 如果是结束标志，跳出循环
              if (is_end) {
                break
              }

              // 让出控制权，避免阻塞 - 使用更短的延迟
              await new Promise((resolve) => setTimeout(resolve, 1))
            }
          } catch (streamError) {
            console.error('Stream processing error:', streamError)
            // 发送错误结束信号
            mainWindow.webContents.send('stream-message', {
              data: {
                is_end: true,
                result: ''
              },
              messageId
            })
          }
        }

        // 异步处理流，不阻塞主进程
        processStream()
      } catch (error) {
        console.error('Chat completion error:', error)
        // 发送错误结束信号
        mainWindow.webContents.send('stream-message', {
          data: {
            is_end: true,
            result: ''
          },
          messageId
        })
      }
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
