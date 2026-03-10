import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 渲染进程 -> 主进程
  sendEvent: (channel, data) => ipcRenderer.send(channel, data),

  // 主进程 -> 渲染进程 (单向)
  receive: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },

  // 双向通信（请求/响应模式）
  invoke: (channel, data) => ipcRenderer.invoke(channel, data)
})


