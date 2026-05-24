try {
  const { contextBridge, ipcRenderer } = require('electron')

  console.log('[Preload] Starting to expose electronAPI...')

  // 确保 electronAPI 被正确暴露
  const electronAPI = {
    // 渲染进程 -> 主进程
    sendEvent: (channel, data) => {
      console.log('[Preload] sendEvent:', channel, data)
      ipcRenderer.send(channel, data)
    },

    // 主进程 -> 渲染进程 (单向)
    receive: (channel, callback) => {
      console.log('[Preload] Registering receiver for:', channel)
      ipcRenderer.on(channel, (event, ...args) => {
        console.log('[Preload] Received:', channel, args)
        callback(...args)
      })
    },

    // 双向通信（请求/响应模式）
    invoke: (channel, data) => {
      console.log('[Preload] invoke:', channel, data)
      return ipcRenderer.invoke(channel, data)
    }
  }

  contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  console.log('[Preload] ✓ electronAPI exposed successfully')

  // 确认暴露成功
  if (window.electronAPI) {
    console.log('[Preload] ✓ Confirmed: window.electronAPI is available')
  } else {
    console.error('[Preload] ✗ ERROR: window.electronAPI is NOT available after exposure!')
  }
} catch (error) {
  console.error('[Preload] ✗ FAILED to expose electronAPI:', error.message, error.stack)
}


