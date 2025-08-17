import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { SendMessage, StreamableData } from '../types/message'
import { ChatCompletion } from '@baiducloud/qianfan'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: is.dev ? 1400 : 900, // 开发模式下增加宽度以容纳开发者工具
    height: 670,
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
    const { content, providerName, model, messageId } = data
    if (providerName === 'qianfan') {
      const client = new ChatCompletion()
      const stream = await client.chat(
        {
          messages: [
            {
              role: 'user',
              content
            }
          ],
          stream: true
        },
        model
      )
      for await (const chunk of stream as AsyncIterableIterator<any>) {
        const { is_end, result } = chunk
        const content: StreamableData = {
          data: {
            is_end,
            result
          },
          messageId
        }
        mainWindow.webContents.send('stream-message', content)
      }
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    // 在开发模式下自动打开开发者工具，并设置为在同一窗口显示
    if (is.dev) {
      mainWindow.webContents.openDevTools({ mode: 'bottom' })
    }
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
      window.webContents.on('before-input-event', (event, input) => {
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
