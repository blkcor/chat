import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { SendMessage, StreamableData, StreamCallback } from '../types/message'
import { ipcRenderer } from 'electron/renderer'
// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('chatAPI', {
      sendQuestion: (data: SendMessage) => ipcRenderer.send('send-question', data),
      streamMessage: (callback: StreamCallback) =>
        ipcRenderer.on('stream-message', (_event, data: StreamableData) => callback(data))
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.chatAPI = {
    sendQuestion: (data: SendMessage) => ipcRenderer.send('send-question', data),
    streamMessage: (callback: StreamCallback) =>
      ipcRenderer.on('stream-message', (_event, data: StreamableData) => callback(data))
  }
}
