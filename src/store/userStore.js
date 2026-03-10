import { defineStore } from 'pinia';
import http from '../api/httpRequest.js'
import { RTC_STATE } from "../api/enums.js"

export default defineStore('userStore', {
	state: () => {
		return {
			userInfo: {},
			isInRtc: false // 是否正在通话中
		}
	},
	actions: {
		setUserInfo(userInfo) {
			this.userInfo = userInfo
		},
		setInRtc(isInRtc) {
			this.isInRtc = isInRtc;
		},
		clear() {
			this.userInfo = {};
			this.rtcInfo = {
				friend: {},
				mode: "video",
				state: RTC_STATE.FREE
			};
		},
		loadUser() {
			return new Promise((resolve, reject) => {
				http({
					url: '/user/self',
					method: 'GET'
				}).then((userInfo) => {
					this.setUserInfo(userInfo);
					resolve();
				}).catch((res) => {
					reject(res);
				});
			})
		}
	}
});