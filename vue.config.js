const path = require('path')
const fs = require('fs')
// const devApiTarget = process.env.DEV_API_PROXY_TARGET || 'http://127.0.0.1:28888'
// const devWsTarget = process.env.DEV_WS_PROXY_TARGET || 'http://127.0.0.1:28878'
const devApiTarget = process.env.DEV_API_PROXY_TARGET || 'https://jlapi.relaynet.io'
const devWsTarget = process.env.DEV_WS_PROXY_TARGET || 'https://jlws.relaynet.io'

module.exports = {
	devServer: {
        proxy: {
            "/api": {
                target: devApiTarget,
                changeOrigin: true,
                secure: false,
                pathRewrite: { "^/api": "" },
                logLevel: 'warn',
                proxyTimeout: 30000,
                timeout: 30000,
                onProxyReq(proxyReq) {
                    proxyReq.on('error', () => {});
                },
                onProxyRes(proxyRes) {
                    proxyRes.on('error', () => {});
                },
                onError(err, req, res) {
                    res.writeHead(502, { 'Content-Type': 'text/plain' });
                    res.end('Bad Gateway');
                }
            },
            "/im": {
                target: devWsTarget,
                ws: true,
                changeOrigin: true,
                secure: false,
                pathRewrite: { "^/im": "/im" },
                logLevel: 'warn',
                proxyTimeout: 30000,
                timeout: 30000,
                onProxyReq(proxyReq) {
                    proxyReq.on('error', () => {});
                },
                onProxyRes(proxyRes) {
                    proxyRes.on('error', () => {});
                },
                onProxyReqWs(proxyReq, req, socket) {
                    socket.on('error', () => {});
                    proxyReq.on('error', () => {});
                },
                onError(err, req, res) {
                    res.writeHead(502, { 'Content-Type': 'text/plain' });
                    res.end('Bad Gateway');
                }
            }
        }
    },
	pluginOptions: {
		electronBuilder: {
			preload: 'src/preload.js',
			externals: ["electron-screenshots"],
			builderOptions: {
				// 包名
				appId: 'net.jianliao',
				productName: 'jianliao', // 安装包名称
				icon: "public/logo.ico", // 安装包logo
				// 确保 preload.js 复制到 resources 目录（asar 外），而非 asar 内部
				files: ['**', '!node_modules/**', '!**/*.map', '!**/dist/**'],
				extraFiles: [
					{
						from: 'dist_electron/bundled/preload.js',
						to: '../preload.js'
					},
					{
						from: 'node_modules/electron-screenshots',
						to: './node_modules/electron-screenshots'
					}
				],
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
