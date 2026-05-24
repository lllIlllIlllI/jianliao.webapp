'use strict'

import { app, protocol, BrowserWindow, Menu, Tray, ipcMain, globalShortcut, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

const path = require('path');
const { nativeImage } = require('electron');
const fs = require('fs');
const isDevelopment = process.env.NODE_ENV !== 'production'
let win
let tray

// 获取logo文件路径（支持开发和生产环境）
let appLogo
try {
  // 尝试从 __static 获取（生产环境）
  if (typeof __static !== 'undefined') {
    appLogo = path.join(__static, 'logo.ico')
  } else {
    // 开发环境：从项目public目录获取
    appLogo = path.join(app.getAppPath(), '../public/logo.ico')
    if (!fs.existsSync(appLogo)) {
      // 备用方案
      appLogo = path.join(process.cwd(), 'public/logo.ico')
    }
  }
  if (!fs.existsSync(appLogo)) {
    console.warn('[Main] Logo not found at:', appLogo, '- using default')
    appLogo = null
  }
} catch (error) {
  console.warn('[Main] Error getting logo path:', error.message)
  appLogo = null
}

console.log('[Main] App logo path:', appLogo)

let blinkTimer = null; // 闪烁定时器
let isBlinking = false; // 是否正在闪烁
let blinkIconVisible = true; // 当前图标是否可见
let defaultTooltip = process.env.VUE_APP_NAME; // 默认 tooltip 文本

// 动态加载 electron-screenshots（生产环境可能不可用）
let Screenshots = null
try {
  Screenshots = require('electron-screenshots')
} catch (error) {
  console.warn('[Main] electron-screenshots module not available:', error.message)
  Screenshots = null
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
async function createWindow() {
  // preload.js 路径：生产环境在资源目录根部，开发环境在编译输出目录
  let preloadPath
  if (app.isPackaged) {
    // 生产环境：preload.js 在 resources 目录（asar外）
    preloadPath = path.join(process.resourcesPath, 'preload.js')
  } else {
    // 开发环境：preload.js 在 dist_electron/bundled 目录
    preloadPath = path.join(app.getAppPath(), 'preload.js')
  }

  const fs = require('fs');
  const preloadExists = fs.existsSync(preloadPath);

  if (isDevelopment) {
    console.log('[Main] ========== DEBUG INFO ==========');
    console.log('[Main] Preload path:', preloadPath)
    console.log('[Main] Preload exists:', preloadExists)
    console.log('[Main] App packaged:', app.isPackaged)
    console.log('[Main] App path:', app.getAppPath())
    console.log('[Main] Resources path:', process.resourcesPath)
    console.log('[Main] ================================');
  }

  if (!preloadExists && isDevelopment) {
    console.warn('[Main] ⚠️  Preload file not found at:', preloadPath);
  }

  // 创建窗口（初始尺寸与登录页一致，避免启动时闪烁）
  const windowConfig = {
    width: 410,
    height: 510,
    minWidth: 0,    // 移除最小宽度限制
    minHeight: 0,   // 移除最小高度限制
    frame: false,
    backgroundColor: '#ffffff',  // 设置窗体背景色为白色，避免灰色边框
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: false,
      devTools: true
    }
  }

  if (appLogo) {
    windowConfig.icon = appLogo
  }

  win = new BrowserWindow(windowConfig)

  // 初始化后也确保没有任何限制
  win.setMinimumSize(0, 0)
  win.setMaximumSize(10000, 10000)

  // 当页面加载完成时，注入diagnostics
  win.webContents.on('dom-ready', () => {
    console.log('[Main] DOM ready, checking electronAPI...')

    // 延迟检查，确保preload有时间加载
    setTimeout(() => {
      win.webContents.executeJavaScript(`
        console.log('[Renderer] ============ DIAGNOSTIC ============');
        console.log('[Renderer] window.electronAPI exists:', !!window.electronAPI);
        console.log('[Renderer] window.electronAPI:', window.electronAPI);
        if (window.electronAPI) {
          console.log('[Renderer] ✓ electronAPI.sendEvent:', typeof window.electronAPI.sendEvent);
          console.log('[Renderer] ✓ electronAPI.invoke:', typeof window.electronAPI.invoke);
          console.log('[Renderer] ✓ electronAPI.receive:', typeof window.electronAPI.receive);
        } else {
          console.error('[Renderer] ✗ electronAPI NOT available!');
        }
        console.log('[Renderer] =====================================');
        window.rendererReady = true;
      `).catch(err => {
        console.error('[Main] Error executing diagnostic script:', err)
      })
    }, 500)
  })

  // 窗口获得焦点时停止闪烁
  win.on('focus', () => {
    stopBlink();
  })

  // 帮助函数：调整窗口大小
  const adjustWindowSize = (hash) => {
    if (!win || win.isDestroyed()) return

    try {
      const display = screen.getDisplayMatching(win.getBounds())
      const { width: sw, height: sh } = display.workAreaSize
      const margin = 60
      const screenCenterX = display.bounds.x + sw / 2
      const screenCenterY = display.bounds.y + sh / 2

      let w, h

      if (/home/.test(hash)) {
        const recommendW = Math.round((sw - margin) * 0.75)
        const recommendH = Math.round((sh - margin) * 0.75)
        w = Math.max(800, recommendW)
        h = Math.max(600, recommendH)
      } else if (/login/.test(hash)) {
        w = 450
        h = 550
      } else if (/register/.test(hash)) {
        w = 480
        h = 750
      } else if (/password|reset/.test(hash)) {
        w = 750
        h = 650
      } else {
        return
      }

      if (isDevelopment) {
        console.log(`[Main] 📍 Adjusting to ${hash}: ${w}x${h}`)
      }

      // 强制移除所有限制
      win.setMinimumSize(0, 0)
      win.setMaximumSize(10000, 10000)
      win.setResizable(true)

      // ⚠️ 关键修复：如果窗口是最大化状态，必须先还原
      // 当窗口被拖动到很大时，可能会进入最大化状态
      // 在这种状态下，setBounds() 无法正常缩小窗口
      if (win.isMaximized()) {
        if (isDevelopment) {
          console.log('[Main] ℹ️ Window is maximized, calling unmaximize() first')
        }
        win.unmaximize()
      }

      // 计算居中位置
      const x = Math.round(screenCenterX - w / 2)
      const y = Math.round(screenCenterY - h / 2)

      // 稍微延迟以确保 unmaximize() 生效，然后调用多次 setBounds
      setTimeout(() => {
        if (!win || win.isDestroyed()) return
        for (let i = 0; i < 3; i++) {
          win.setBounds({ x, y, width: w, height: h })
        }
      }, 50)

      // 在renderer中显示调整反馈
      win.webContents.executeJavaScript(`
        document.title = 'jianliao (${w}x${h})';
        if (window.__resizeCount === undefined) window.__resizeCount = 0;
        window.__resizeCount++;
        console.log('[Renderer] Window resize #' + window.__resizeCount + ': ${w}x${h}');
      `).catch(err => {})

      if (isDevelopment) {
        setTimeout(() => {
          if (win && !win.isDestroyed()) {
            const finalBounds = win.getBounds()
            console.log(`[Main] ✓ Final size: ${finalBounds.width}x${finalBounds.height}`)
          }
        }, 100)
      }
    } catch (error) {
      console.error('[Main] Error adjusting window size:', error.message)
    }
  }

  // 监听路由变化，在主进程直接调整窗口大小
  win.webContents.on('did-navigate-in-page', (event, url, isMainFrame) => {
    if (!isMainFrame) return
    const hash = (url.split('#')[1] || '').replace(/\?.*$/, '')
    if (isDevelopment) console.log('[Main] Route changed to:', hash)
    adjustWindowSize(hash)
  })

  // 备用方案：通过IPC从渲染进程接收路由变化（开发环境可能需要）
  ipcMain.on('routeChange', (event, hash) => {
    if (isDevelopment) console.log('[Main] Route changed via IPC:', hash)
    adjustWindowSize(hash)
  })

  // 禁用顶部菜单
  Menu.setApplicationMenu(null)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (process.env.IS_TEST) win.webContents.openDevTools({ mode: 'detach' })
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// 开始闪烁
function startBlink() {
  if (!tray || isBlinking) {
    return;
  }
  isBlinking = true;
  blinkIconVisible = true;
  try {
    tray.setToolTip('您有新的未读消息');
    // 每 500ms闪烁一次图标事
    blinkTimer = setInterval(() => {
      if (!tray) return;
      if (blinkIconVisible) {
        // 显示空白图标（隐藏效果）
        tray.setImage(nativeImage.createEmpty());
        blinkIconVisible = false;
      } else {
        // 显示正常图标
        if (appLogo) {
          tray.setImage(appLogo);
        }
        blinkIconVisible = true;
      }
    }, 500);
  } catch (error) {
    console.error('[Main] Error in startBlink:', error)
    isBlinking = false;
  }
}

// 停止闪烁
function stopBlink() {
  if (!tray || !isBlinking) {
    return
  }
  isBlinking = false;
  if (blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }
  try {
    // 恢复正常图标
    if (appLogo) {
      tray.setImage(appLogo);
    }
    tray.setToolTip(defaultTooltip);
    blinkIconVisible = true;
  } catch (error) {
    console.error('[Main] Error in stopBlink:', error)
  }
}

function createTray() {
  try {
    if (!appLogo || typeof appLogo !== 'string') {
      console.warn('[Main] Cannot create tray: invalid logo -', appLogo)
      tray = null
      return
    }

    tray = new Tray(appLogo)
    defaultTooltip = process.env.VUE_APP_NAME

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          if (win) {
            win.show()
            stopBlink()
          }
        }
      },
      {
        label: '退出',
        click: () => app.quit()
      }
    ])

    tray.on('click', () => {
      if (win) {
        win.show()
        stopBlink()
      }
    })

    tray.setToolTip(defaultTooltip)
    tray.setContextMenu(contextMenu)

    console.log('[Main] ✓ Tray created successfully')
  } catch (error) {
    console.error('[Main] ✗ Failed to create tray:', error.message)
    tray = null
  }
}

function initIpcMainEvent() {
  // 获取全屏状态
  ipcMain.handle('isFullScreen', () => {
    return win.isFullScreen()
  })
  // 是否获得焦点
  ipcMain.handle('isFocused', () => {
    return win.isFocused()
  })
  // 用户点击页面的截屏按钮触发截屏
  ipcMain.handle('screenshot', () => {
    return new Promise((resolve, reject) => {
      if (!Screenshots) {
        console.warn('[Main] Screenshots module not available')
        resolve()
        return
      }
      try {
        const screenshots = new Screenshots();
        screenshots.startCapture();
        screenshots.on("ok", (e, buffer, bounds) => {
          resolve(buffer, bounds)
        });
        screenshots.on("cancel", (e) => {
          resolve()
        });
      } catch (error) {
        console.error('[Main] Screenshot error:', error)
        resolve()
      }
    })
  })

  ipcMain.on('show', () => {
    win.show()
  })

  ipcMain.on('minimize', () => {
    win.minimize()
  })

  ipcMain.on('maximize', () => {
    win.maximize()
  })

  ipcMain.on('unmaximize', () => {
    win.unmaximize()
  })

  ipcMain.on('close', () => {
    win.hide()
  })

  ipcMain.on('resize', (event, v) => {
    // 获取当前窗口所在显示器的工作区（排除任务栏），防止窗口超出屏幕
    const display = screen.getDisplayMatching(win.getBounds())
    const { width: sw, height: sh } = display.workAreaSize
    const margin = 40 // 与屏幕边缘保留安全距离
    const w = Math.min(v.width, sw - margin)
    const h = Math.min(v.height, sh - margin)
    win.setMinimumSize(
      Math.min(v.minWidth || v.width, sw - margin),
      Math.min(v.minHeight || v.height, sh - margin)
    )
    win.setSize(w, h)
    win.setMaximizable(!!v.maximizable)
    win.center()
  })

  ipcMain.on('center', () => {
    win.center();
  })

  // 开始托盘图标闪烁
  ipcMain.on('startTrayBlink', () => {
    // 只有在窗口不在焦点时才闪烁
    if (!win.isFocused()) {
      startBlink();
    }
  })

  // 停止托盘图标闪烁
  ipcMain.on('stopTrayBlink', () => {
    stopBlink();
  })

  // 诊断和调试命令
  ipcMain.on('diagnostic', (event, data) => {
    console.log('[Main] Diagnostic request:', data)
    const diagnostic = {
      preloadPath: preloadPath,
      preloadExists: preloadExists,
      isDevelopment: isDevelopment,
      appIsPackaged: app.isPackaged,
      appPath: app.getAppPath(),
      resourcesPath: process.resourcesPath
    }
    console.log('[Main] Diagnostic info:', diagnostic)
    event.reply('diagnostic-reply', diagnostic)
  })

  // 测试窗口调整大小
  ipcMain.on('testResize', (event, size) => {
    console.log('[Main] Test resize request:', size)
    if (win && !win.isDestroyed()) {
      const { width, height } = size
      console.log(`[Main] Resizing window to ${width}x${height}`)
      win.setBounds({ x: win.getBounds().x, y: win.getBounds().y, width, height })
      setTimeout(() => {
        const bounds = win.getBounds()
        console.log(`[Main] Window is now ${bounds.width}x${bounds.height}`)
      }, 200)
    }
  })
}

function initScreenshots() {
  if (!Screenshots) {
    console.warn('[Main] Screenshots module not available, screenshot shortcuts disabled')
    return
  }

  try {
    // 快捷键截屏
    const screenshots = new Screenshots();
    globalShortcut.register("ctrl+alt+a", () => {
      if (!screenshots.$win || !screenshots.$win.isFocused) {
        screenshots.startCapture();
      }
    })

    // esc取消截屏
    globalShortcut.register("esc", () => {
      if (screenshots.$win && screenshots.$win.isFocused()) {
        screenshots.endCapture();
      }
    })
  } catch (error) {
    console.error('[Main] Failed to initialize screenshots:', error)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  // 先初始化IPC处理器，确保handler在window加载完成前就已注册
  initIpcMainEvent()
  initScreenshots()

  // 然后创建window
  await createWindow()
  createTray()

  // 修改通知栏标题
  app.setAppUserModelId(process.env.VUE_APP_NAME)
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}