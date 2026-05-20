import { defineStore } from 'pinia';
import http from '../api/httpRequest.js'

export default defineStore('configStore', {
	state: () => {
		return {
			appInit: false,  // 应用是否完成初始化
			electronMode: false, // 当前是否以客户端模式运行
			fullScreen: true, // 当前是否全屏
			showDiscover: true, // 是否显示发现页(tab)
			discoverUrl: '', // 发现页URL
			registration: {
				mode: []
			},
			webrtc: {},
			policy: {
				protocolUrl: '',
				privacyUrl: ''
			}
		}
	},
	actions: {
		setConfig(config) {
			this.webrtc = config.webrtc;
			this.registration = config.registration;
			this.showDiscover = (config && typeof config.showDiscover !== 'undefined') ? config.showDiscover : this.showDiscover;
			this.discoverUrl = (config && typeof config.discoverUrl !== 'undefined') ? (config.discoverUrl || '') : this.discoverUrl;
			if (config.policy) {
				this.policy = config.policy;
			}
		},
		setElectronMode(mode) {
			this.electronMode = mode
		},
		setFullScreen(fullScreen) {
			this.fullScreen = fullScreen;
		},
		setAppInit(appInit) {
			this.appInit = appInit;
		},
		switchFullScreen() {
			this.fullScreen = !this.fullScreen;
		},
		loadConfig() {
			return new Promise((resolve, reject) => {
				http({
					url: '/system/config',
					method: 'GET'
				}).then(config => {
					console.log("系统配置", config)
					this.setConfig(config);
					resolve();
				}).catch((res) => {
					reject(res);
				});
			})
		}
	}
});
