'use strict'

import { app, protocol, BrowserWindow, Menu, Tray, ipcMain, globalShortcut, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

const path = require('path');
const os = require('os');
const { nativeImage } = require('electron');
const fs = require('fs');
const isDevelopment = process.env.NODE_ENV !== 'production'
let win
let tray

// 获取logo文件路径（支持开发和生产环境）
// 企业级方案：尝试多个位置，有完整的错误处理和日志
function getAppLogo() {
  const logoFilename = 'logo.ico'
  const candidatePaths = [
    // 生产环境
    ...(typeof __static !== 'undefined' ? [path.join(__static, logoFilename)] : []),
    // 开发环境 - 相对于app.getAppPath()
    path.join(app.getAppPath(), '../public', logoFilename),
    // 开发环境 - 相对于进程目录
    path.join(process.cwd(), 'public', logoFilename),
    // 相对于dist_electron
    path.join(app.getAppPath(), 'public', logoFilename),
  ]

  for (const logoPath of candidatePaths) {
    try {
      if (fs.existsSync(logoPath)) {
        console.log('[Main] ✓ App logo found at:', logoPath)
        return logoPath
      }
    } catch (error) {
      console.debug('[Main] Checking path failed:', logoPath, error.message)
    }
  }

  console.warn('[Main] ⚠️ App logo not found in any candidate paths')
  return null
}

let appLogo = getAppLogo()

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
  // 在 Windows 上，使用透明窗口 + 白色内容背景是隐藏系统边框的最可靠方法
  const windowConfig = {
    width: 410,
    height: 510,
    minWidth: 0,    // 移除最小宽度限制
    minHeight: 0,   // 移除最小高度限制
    frame: false,
    transparent: true,  // Windows: 透明窗口以避免系统边框
    backgroundColor: '#00000000',  // 完全透明，让 CSS 处理背景
    hasShadow: false,  // 禁用窗体阴影
    show: false,  // 不立即显示，等待DOM准备好
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: !isDevelopment,  // 生产环境启用安全性
      devTools: isDevelopment,  // 仅开发环境打开devTools
      enableBlinkFeatures: 'CSSBackdropFilter'  // 允许 CSS backdrop-filter
    }
  }

  if (appLogo) {
    windowConfig.icon = appLogo
  }

  win = new BrowserWindow(windowConfig)

  // 初始化后也确保没有任何限制
  win.setMinimumSize(0, 0)
  win.setMaximumSize(10000, 10000)

  // Windows 特定：禁用窗体边框和额外装饰
  if (os.platform() === 'win32') {
    try {
      // 在 Windows 上，某些版本可能需要额外的配置来完全隐藏边框
      win.setAutoHideMenuBar(true);
      console.log('[Main] ✓ Windows-specific border hiding applied');
    } catch (error) {
      console.warn('[Main] Could not apply Windows border fix:', error.message);
    }
  }

  // 当页面加载完成时，注入diagnostics并显示窗口
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

      // 显示窗口（在DOM准备好后显示，避免白屏闪烁和边框问题）
      if (win && !win.isDestroyed()) {
        win.show();
        console.log('[Main] ✓ Window shown after DOM ready');
      }
    }, 500)
  })

  // 窗口获得焦点时停止闪烁
  win.on('focus', () => {
    stopBlink();
  })

  // 窗口准备好显示时的事件（备用显示方案）
  win.once('ready-to-show', () => {
    console.log('[Main] ready-to-show event fired');
    if (win && !win.isDestroyed() && !win.isVisible()) {
      win.show();
      console.log('[Main] ✓ Window shown via ready-to-show');
    }
  })

  // 防抖定时器：防止频繁调整窗口大小导致WebSocket断连
  let resizeDebounceTimer = null
  const RESIZE_DEBOUNCE_MS = 300
  let lastRoute = '' // 跟踪上一个路由
  let shouldAutoResize = true // 是否应该自动调整大小

  // 帮助函数：调整窗口大小（防抖版本）
  const adjustWindowSizeDebounced = (hash) => {
    // 企业级方案：只在特定路由转换时自动调整窗口大小
    // 场景1: 初始化 → 登录/注册 → 需要调整
    // 场景2: 登录 → 首页 → 需要调整
    // 场景3: 首页内部导航（点击左侧菜单）→ 不需要调整，保持用户调整的大小

    const isLoginRoute = /login|register|password|reset/.test(hash)
    const isHomeRoute = /home/.test(hash)
    const wasLoginRoute = /login|register|password|reset/.test(lastRoute)
    const wasHomeRoute = /home/.test(lastRoute)

    // 决定是否调整窗口
    let shouldResize = false

    if (!lastRoute) {
      // 初始化：应该调整
      shouldResize = true
    } else if (wasLoginRoute && isHomeRoute) {
      // 从登录/注册到首页：应该调整
      shouldResize = true
    } else if (isLoginRoute && !wasLoginRoute) {
      // 进入登录/注册页面：应该调整
      shouldResize = true
    } else if (wasHomeRoute && isHomeRoute) {
      // 在首页内部导航（点击左侧菜单）：不调整，保持用户调整的大小
      shouldResize = false
    }

    lastRoute = hash

    if (!shouldResize) {
      if (isDevelopment) {
        console.log(`[Main] ℹ️ Home internal navigation (${hash}): keeping current size`)
      }
      return
    }

    // 清除之前的定时器
    if (resizeDebounceTimer) {
      clearTimeout(resizeDebounceTimer)
    }
    // 设置新的防抖定时器
    resizeDebounceTimer = setTimeout(() => {
      adjustWindowSize(hash)
      resizeDebounceTimer = null
    }, RESIZE_DEBOUNCE_MS)
  }

  // 帮助函数：调整窗口大小（原始实现）
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
        // 对于透明窗口，需要先设置大小再设置位置
        win.setSize(w, h)
        win.setPosition(x, y)
        // 额外调用以确保生效
        for (let i = 0; i < 2; i++) {
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

  // 监听路由变化，在主进程直接调整窗口大小（使用防抖防止频繁调整）
  win.webContents.on('did-navigate-in-page', (event, url, isMainFrame) => {
    if (!isMainFrame) return
    const hash = (url.split('#')[1] || '').replace(/\?.*$/, '')
    if (isDevelopment) console.log('[Main] Route changed to:', hash)
    adjustWindowSizeDebounced(hash)
  })

  // 备用方案：通过IPC从渲染进程接收路由变化（开发环境可能需要，同样使用防抖）
  ipcMain.on('routeChange', (event, hash) => {
    if (isDevelopment) console.log('[Main] Route changed via IPC:', hash)
    adjustWindowSizeDebounced(hash)
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

  let trayImage = null
  try {
    // 预加载托盘图标，以提高闪烁性能
    if (appLogo && typeof appLogo === 'string') {
      trayImage = nativeImage.createFromPath(appLogo)
      if (trayImage.isEmpty()) {
        console.warn('[Main] Tray image is empty, blinking will show empty icon only')
        trayImage = null
      }
    }
  } catch (error) {
    console.error('[Main] Error loading tray image for blinking:', error.message)
    trayImage = null
  }

  try {
    tray.setToolTip('您有新的未读消息');
    // 每 500ms闪烁一次图标
    blinkTimer = setInterval(() => {
      if (!tray) return;
      try {
        if (blinkIconVisible) {
          // 显示空白图标（隐藏效果）
          tray.setImage(nativeImage.createEmpty());
          blinkIconVisible = false;
        } else {
          // 显示正常图标
          if (trayImage && !trayImage.isEmpty()) {
            tray.setImage(trayImage);
          }
          blinkIconVisible = true;
        }
      } catch (innerError) {
        console.error('[Main] Error updating tray image during blink:', innerError.message)
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
    if (appLogo && typeof appLogo === 'string') {
      try {
        const trayImage = nativeImage.createFromPath(appLogo)
        if (!trayImage.isEmpty()) {
          tray.setImage(trayImage);
        }
      } catch (iconError) {
        console.error('[Main] Error restoring tray icon:', iconError.message)
      }
    }
    tray.setToolTip(defaultTooltip || 'jianliao');
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

    // 使用 nativeImage.createFromPath 确保 Windows 上正确处理图标
    // 这比直接传递路径字符串更可靠
    const trayIcon = nativeImage.createFromPath(appLogo)
    if (trayIcon.isEmpty()) {
      console.warn('[Main] Cannot create tray: logo image is empty at -', appLogo)
      tray = null
      return
    }

    tray = new Tray(trayIcon)
    defaultTooltip = process.env.VUE_APP_NAME || 'jianliao'

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
    try {
      // 在Electron中，应用内容应该默认占满整个窗口（应用级全屏，不是系统全屏）
      // 返回true表示应用容器应该占满窗口
      return true
    } catch (error) {
      console.error('[Main] Error in isFullScreen handler:', error.message)
      return true
    }
  })

  // 是否获得焦点
  ipcMain.handle('isFocused', () => {
    try {
      if (win && !win.isDestroyed()) {
        return win.isFocused()
      }
      return false
    } catch (error) {
      console.error('[Main] Error in isFocused handler:', error.message)
      return false
    }
  })
  // 用户点击页面的截屏按钮触发截屏
  ipcMain.handle('screenshot', () => {
    return new Promise((resolve, reject) => {
      if (!Screenshots) {
        console.warn('[Main] Screenshots module not available, screenshot feature disabled')
        resolve(null)
        return
      }
      try {
        const screenshots = new Screenshots();
        const timeout = setTimeout(() => {
          console.warn('[Main] Screenshot operation timed out')
          resolve(null)
        }, 30000) // 30秒超时

        screenshots.startCapture();
        screenshots.on("ok", (e, buffer, bounds) => {
          clearTimeout(timeout)
          if (isDevelopment) {
            console.log('[Main] ✓ Screenshot captured successfully')
          }
          resolve({ buffer, bounds })
        });
        screenshots.on("cancel", (e) => {
          clearTimeout(timeout)
          if (isDevelopment) {
            console.log('[Main] Screenshot operation cancelled by user')
          }
          resolve(null)
        });
        screenshots.on("error", (error) => {
          clearTimeout(timeout)
          console.error('[Main] Screenshot error:', error)
          resolve(null)
        });
      } catch (error) {
        console.error('[Main] Failed to start screenshot:', error.message)
        resolve(null)
      }
    })
  })

  ipcMain.on('show', () => {
    try {
      if (win && !win.isDestroyed()) {
        win.show()
        if (isDevelopment) console.log('[Main] Window shown via IPC')
      }
    } catch (error) {
      console.error('[Main] Error showing window:', error.message)
    }
  })

  ipcMain.on('minimize', () => {
    try {
      if (win && !win.isDestroyed()) {
        win.minimize()
        if (isDevelopment) console.log('[Main] Window minimized via IPC')
      }
    } catch (error) {
      console.error('[Main] Error minimizing window:', error.message)
    }
  })

  ipcMain.on('maximize', () => {
    try {
      if (!win || win.isDestroyed()) {
        console.warn('[Main] Cannot maximize: window is destroyed')
        return
      }

      // 简单稳定的最大化实现
      // 直接使用Electron内置的maximize()方法
      // 如果已经最大化则恢复
      if (win.isMaximized()) {
        if (isDevelopment) console.log('[Main] Window already maximized, restoring...')
        win.unmaximize()
        return
      }

      // 最大化窗口
      win.maximize()

      if (isDevelopment) {
        console.log('[Main] ✓ Window maximized')
      }
    } catch (error) {
      console.error('[Main] Error maximizing window:', error.message)
    }
  })

  ipcMain.on('unmaximize', () => {
    try {
      if (!win || win.isDestroyed()) {
        console.warn('[Main] Cannot unmaximize: window is destroyed')
        return
      }

      // 检查当前状态
      if (!win.isMaximized()) {
        if (isDevelopment) console.log('[Main] Window is not maximized')
        return
      }

      // 恢复窗口
      win.unmaximize()

      if (isDevelopment) {
        console.log('[Main] ✓ Window unmaximized')
      }
    } catch (error) {
      console.error('[Main] Error unmaximizing window:', error.message)
    }
  })

  ipcMain.on('close', () => {
    try {
      if (win && !win.isDestroyed()) {
        win.hide()
        if (isDevelopment) console.log('[Main] Window hidden via IPC')
      }
    } catch (error) {
      console.error('[Main] Error hiding window:', error.message)
    }
  })

  ipcMain.on('resize', (event, v) => {
    try {
      if (!win || win.isDestroyed()) {
        console.warn('[Main] Cannot resize: window is destroyed')
        return
      }

      // 验证输入参数
      if (!v || typeof v.width !== 'number' || typeof v.height !== 'number') {
        console.warn('[Main] Invalid resize parameters:', v)
        return
      }

      // 获取当前窗口所在显示器的工作区（排除任务栏），防止窗口超出屏幕
      const display = screen.getDisplayMatching(win.getBounds())
      const { width: sw, height: sh } = display.workAreaSize
      const margin = 40 // 与屏幕边缘保留安全距离
      const w = Math.min(Math.max(v.width, 300), sw - margin) // 最小宽度300px
      const h = Math.min(Math.max(v.height, 300), sh - margin) // 最小高度300px

      win.setMinimumSize(
        Math.min(v.minWidth || 300, sw - margin),
        Math.min(v.minHeight || 300, sh - margin)
      )
      win.setSize(w, h)
      win.setMaximizable(!!v.maximizable)
      win.center()

      if (isDevelopment) {
        console.log(`[Main] Window resized via IPC: ${w}x${h}`)
      }
    } catch (error) {
      console.error('[Main] Error resizing window:', error.message)
    }
  })

  ipcMain.on('center', () => {
    try {
      if (win && !win.isDestroyed()) {
        win.center()
        if (isDevelopment) console.log('[Main] Window centered via IPC')
      }
    } catch (error) {
      console.error('[Main] Error centering window:', error.message)
    }
  })

  // 开始托盘图标闪烁
  ipcMain.on('startTrayBlink', () => {
    try {
      // 只有在窗口不在焦点时才闪烁
      if (win && !win.isDestroyed() && !win.isFocused()) {
        startBlink()
        if (isDevelopment) console.log('[Main] Tray blink started')
      }
    } catch (error) {
      console.error('[Main] Error starting tray blink:', error.message)
    }
  })

  // 停止托盘图标闪烁
  ipcMain.on('stopTrayBlink', () => {
    try {
      stopBlink()
      if (isDevelopment) console.log('[Main] Tray blink stopped')
    } catch (error) {
      console.error('[Main] Error stopping tray blink:', error.message)
    }
  })

  // 诊断和调试命令
  ipcMain.on('diagnostic', (event, data) => {
    try {
      if (isDevelopment) {
        console.log('[Main] Diagnostic request:', data)
      }
      const diagnostic = {
        preloadPath,
        preloadExists,
        isDevelopment,
        appIsPackaged: app.isPackaged,
        appPath: app.getAppPath(),
        resourcesPath: process.resourcesPath,
        platform: process.platform,
        nodeVersion: process.version,
        electronVersion: process.versions.electron,
        windowState: {
          isDestroyed: win ? win.isDestroyed() : true,
          isFocused: win && !win.isDestroyed() ? win.isFocused() : false,
          isVisible: win && !win.isDestroyed() ? win.isVisible() : false,
          bounds: win && !win.isDestroyed() ? win.getBounds() : null
        }
      }
      if (isDevelopment) {
        console.log('[Main] Diagnostic info:', diagnostic)
      }
      event.reply('diagnostic-reply', diagnostic)
    } catch (error) {
      console.error('[Main] Error in diagnostic handler:', error.message)
      event.reply('diagnostic-reply', { error: error.message })
    }
  })

  // 测试窗口调整大小
  ipcMain.on('testResize', (event, size) => {
    try {
      if (!size || typeof size.width !== 'number' || typeof size.height !== 'number') {
        console.warn('[Main] Invalid testResize parameters:', size)
        return
      }

      console.log('[Main] Test resize request:', size)
      if (win && !win.isDestroyed()) {
        const { width, height } = size
        const validWidth = Math.max(300, width)
        const validHeight = Math.max(300, height)
        console.log(`[Main] Resizing window to ${validWidth}x${validHeight}`)
        win.setBounds({ x: win.getBounds().x, y: win.getBounds().y, width: validWidth, height: validHeight })
        setTimeout(() => {
          if (win && !win.isDestroyed()) {
            const bounds = win.getBounds()
            console.log(`[Main] Window is now ${bounds.width}x${bounds.height}`)
          }
        }, 200)
      }
    } catch (error) {
      console.error('[Main] Error in testResize:', error.message)
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

    // Ctrl+Alt+A 开始截屏
    try {
      globalShortcut.register("ctrl+alt+a", () => {
        try {
          if (!screenshots.$win || !screenshots.$win.isFocused) {
            screenshots.startCapture();
          }
        } catch (error) {
          console.error('[Main] Error starting screenshot capture:', error.message)
        }
      })
      if (isDevelopment) console.log('[Main] ✓ Screenshot shortcut Ctrl+Alt+A registered')
    } catch (error) {
      console.error('[Main] Failed to register Ctrl+Alt+A shortcut:', error.message)
    }

    // Esc 取消截屏
    try {
      globalShortcut.register("esc", () => {
        try {
          if (screenshots.$win && screenshots.$win.isFocused()) {
            screenshots.endCapture();
          }
        } catch (error) {
          console.error('[Main] Error ending screenshot capture:', error.message)
        }
      })
      if (isDevelopment) console.log('[Main] ✓ Screenshot shortcut Esc registered')
    } catch (error) {
      console.error('[Main] Failed to register Esc shortcut:', error.message)
    }
  } catch (error) {
    console.error('[Main] Failed to initialize screenshots:', error.message)
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

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('[Main] Uncaught Exception:', error)
  if (isDevelopment) {
    console.error('[Main] Stack trace:', error.stack)
  }
})

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Main] Unhandled Rejection at:', promise, 'reason:', reason)
  if (isDevelopment) {
    console.error('[Main] Error details:', reason instanceof Error ? reason.stack : reason)
  }
})

app.on('ready', async () => {
  try {
    // 先初始化IPC处理器，确保handler在window加载完成前就已注册
    initIpcMainEvent()
    initScreenshots()

    // 然后创建window
    await createWindow()
    createTray()

    // 修改通知栏标题
    app.setAppUserModelId(process.env.VUE_APP_NAME || 'jianliao')

    if (isDevelopment) {
      console.log('[Main] ✓ Application initialized successfully')
    }
  } catch (error) {
    console.error('[Main] ✗ Failed to initialize application:', error)
    if (isDevelopment) {
      console.error('[Main] Stack trace:', error.stack)
    }
    app.quit()
  }
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