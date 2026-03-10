'use strict'

import { app, protocol, BrowserWindow, Menu, Tray, ipcMain, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import Screenshots from "electron-screenshots";

const path = require('path');
const { nativeImage } = require('electron');
const isDevelopment = process.env.NODE_ENV !== 'production'
let win
let tray
let appLogo = path.join(__static, 'logo.ico');
let blinkTimer = null; // 闪烁定时器
let isBlinking = false; // 是否正在闪烁
let blinkIconVisible = true; // 当前图标是否可见
let defaultTooltip = process.env.VUE_APP_NAME; // 默认 tooltip 文本

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
async function createWindow() {
  // 创建窗口
  win = new BrowserWindow({
    width: 360,
    height: 440,
    icon: appLogo,
    frame: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, './preload.js'),
      webSecurity: false, // 解除跨域限制
      devTools: true // 允许打开调试器
    }
  })

  // 窗口获得焦点时停止闪烁
  win.on('focus', () => {
    stopBlink();
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
  if (isBlinking) {
    return;
  }
  isBlinking = true;
  blinkIconVisible = true;
  tray.setToolTip('您有新的未读消息');
  // 每 500ms闪烁一次图标事
  blinkTimer = setInterval(() => {
    if (blinkIconVisible) {
      // 显示空白图标（隐藏效果）
      tray.setImage(nativeImage.createEmpty());
      blinkIconVisible = false;
    } else {
      // 显示正常图标
      tray.setImage(appLogo);
      blinkIconVisible = true;
    }
  }, 500);
}

// 停止闪烁
function stopBlink() {
  if (!isBlinking) {
    return
  }
  isBlinking = false;
  if (blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }
  // 恢复正常图标
  tray.setImage(appLogo);
  tray.setToolTip(defaultTooltip);
  blinkIconVisible = true;
}

function createTray() {
  tray = new Tray(appLogo)
  defaultTooltip = process.env.VUE_APP_NAME; // 保存默认 tooltip
  const contextMenu = Menu.buildFromTemplate([{
    label: '显示窗口',
    click: () => {
      win.show();
      stopBlink(); // 显示窗口时停止闪烁
    }
  }, {
    label: '退出',
    click: () => app.quit()
  }
  ])
  // 点击托盘图标时显示窗口
  tray.on('click', () => {
    win.show();
    stopBlink(); // 显示窗口时停止闪烁
  });
  tray.setToolTip(defaultTooltip)
  tray.setContextMenu(contextMenu)
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
      const screenshots = new Screenshots();
      screenshots.startCapture();
      screenshots.on("ok", (e, buffer, bounds) => {
        resolve(buffer, bounds)
      });
      screenshots.on("cancel", (e) => {
        resolve()
      });
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
    win.setSize(v.width, v.height)
    win.setMaximizable(v.maximizable)
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
}

function initScreenshots() {
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
  createWindow()
  createTray()
  initIpcMainEvent()
  initScreenshots()
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