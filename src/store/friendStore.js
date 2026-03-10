import { defineStore } from 'pinia';
import http from '../api/httpRequest.js'
import { TERMINAL_TYPE } from "../api/enums.js"

export default defineStore('friendStore', {
	state: () => {
		return {
			friends: [], // 数组用于展示，防止更新时不刷新
			friendMap: new Map(), // map用于查询，提高查询效率
			requests: [] // 好友申请列表
		}
	},
	actions: {
		setFriends(friends) {
			this.friends = friends;
			this.friendMap.clear();
			friends.forEach(f => this.friendMap.set(f.id, f))
		},
		setRequests(requests) {
			this.requests = requests;
		},
		addRequest(request) {
			this.requests.unshift(request);
		},
		removeRequest(id) {
			for (let idx in this.requests) {
				if (this.requests[idx].id == id) {
					this.requests.splice(idx, 1);
					break;
				}
			}
		},
		updateFriend(friend) {
			console.log("updateFriend")
			let f = this.findFriend(friend.id);
			friend.online = f.online;
			friend.onlineWeb = f.onlineWeb;
			friend.onlineApp = f.onlineApp;
			Object.assign(f, friend);
		},
		removeFriend(id) {
			let f = this.findFriend(id);
			f.deleted = true;
		},
		addFriend(friend) {
			if (this.friendMap.has(friend.id)) {
				this.updateFriend(friend)
			} else {
				this.friends.unshift(friend);
				this.friendMap.set(friend.id, friend)
			}
		},
		updateOnlineStatus(onlineData) {
			let friend = this.findFriend(onlineData.userId);
			if (onlineData.terminal == TERMINAL_TYPE.WEB) {
				friend.onlineWeb = onlineData.online;
			} else if (onlineData.terminal == TERMINAL_TYPE.APP) {
				friend.onlineApp = onlineData.online;
			}
			friend.online = friend.onlineWeb || friend.onlineApp;
		},
		setDnd(id, isDnd) {
			let friend = this.findFriend(id);
			friend.isDnd = isDnd;
		},
		setTop(id, isTop) {
			let friend = this.findFriend(id);
			friend.isTop = isTop;
		},
		clear() {
			this.friends = [];
			this.friendMap.clear();
			this.requests = [];
		},
		loadFriend() {
			return new Promise((resolve, reject) => {
				http({
					url: '/friend/list',
					method: 'GET'
				}).then(async (friends) => {
					this.setFriends(friends);
					// 加载好友申请列表
					const requests = await http({
						url: '/friend/request/list',
						method: 'GET'
					});
					this.setRequests(requests);
					resolve();
				}).catch(() => {
					reject();
				})
			});
		}
	},
	getters: {
		isFriend: (state) => (userId) => {
			let f = state.findFriend(userId)
			return f && !f.deleted
		},
		findFriend: (state) => (userId) => {
			return state.friendMap.get(userId);
		},
		isInRecvRequest: (state) => (userId) => {
			return state.requests.some((req) => req.recvId == userId);
		},
		isInSendRequest: (state) => (userId) => {
			return state.requests.some((req) => req.sendId == userId);
		}
	}
});