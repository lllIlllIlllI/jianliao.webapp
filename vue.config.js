const path = require('path')
const fs = require('fs')
const devApiTarget = process.env.DEV_API_PROXY_TARGET || 'http://127.0.0.1:8888'
const devWsTarget = process.env.DEV_WS_PROXY_TARGET || devApiTarget

module.exports = {
	devServer: {
        proxy: {
            "/api": {
                target: devApiTarget,
                changeOrigin: true,
                secure: false,
                pathRewrite: { "^/api": "/api" }
            },
            "/im": {
                target: devWsTarget,
                ws: true,
                changeOrigin: true,
                secure: false,
                pathRewrite: { "^/im": "/im" }
            }
        }
    },
	pluginOptions: {
		electronBuilder: {
			preload: 'src/preload.js',
			externals: ["electron-screenshots"],
			builderOptions: {
				// 包名
				appId: 'com.boxim',
				productName: '简聊IM', // 安装包名称
				icon: "public/logo.ico", // 安装包logo
				win: {
					icon: 'public/logo.ico' // Windows图标,大小要求:256x256
				},
				mac: {
					icon: 'public/logo.icns' // MacOS图标,大小要求: 512x512
				}
			}
		}
	}
}
