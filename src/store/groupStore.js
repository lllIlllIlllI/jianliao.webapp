import { defineStore } from 'pinia';
import http from '../api/httpRequest.js'

export default defineStore('groupStore', {
	state: () => {
		return {
			groups: [],// 数组用于展示，防止更新时不刷新
			groupMap: new Map(), // map用于查询，提高查询效率
		}
	},
	actions: {
		setGroups(groups) {
			// 逐个群处理，保证ws重连后群成员不被清理
			groups.forEach(group => this.addGroup(group));
		},
		addGroup(group) {
			if (this.groupMap.has(group.id)) {
				this.updateGroup(group)
			} else {
				group.members = [];
				group.rtcInfo = {};
				this.groups.unshift(group);
				this.groupMap.set(group.id, group);
			}
		},
		removeGroup(id) {
			let group = this.findGroup(id);
			group.quit = true;
		},
		updateGroup(group) {
			let g = this.findGroup(group.id);
			// 成员列表保持不变
			group.members = g.members;
			// 拷贝属性
			Object.assign(g, group);
		},
		updateTopMessage(id, topMessage) {
			let group = this.findGroup(id);
			if (group) {
				group.topMessage = topMessage;
			}
		},
		setDnd(id, isDnd) {
			let group = this.findGroup(id);
			group.isDnd = isDnd;
		},
		setTop(id, isTop) {
			let group = this.findGroup(id);
			group.isTop = isTop;
		},
		setMuted(id, isMuted) {
			let group = this.findGroup(id);
			group.isMuted = isMuted;
		},
		setAllMuted(id, isAllMuted) {
			let group = this.findGroup(id);
			group.isAllMuted = isAllMuted;
		},
		setRtcInfo(id, rtcInfo) {
			let group = this.findGroup(id);
			group.rtcInfo = rtcInfo;
		},
		refreshMember(id) {
			let group = this.findGroup(id);
			// 成员最大版本号
			let maxVersion = 0;
			if (group.members) {
				group.members.forEach(m => maxVersion = Math.max(maxVersion, m.version));
			}
			http({
				url: `/group/members/${id}?version=${maxVersion}`,
				method: 'get'
			}).then(members => {
				if (!group.members.length) {
					// 全量更新
					group.members = members;
				} else {
					// 增量更新
					members.forEach(m1 => {
						let member = group.members.find(m2 => m1.userId == m2.userId);
						if (member) {
							Object.assign(member, m1);
						} else {
							group.members.push(m1)
						}
					})
					// 更新成员在线状态
					this.refreshMemberOnline(id);
				}
			});
		},
		refreshMemberOnline(id) {
			let group = this.findGroup(id);
			http({
				url: `/group/members/online/${id}`,
				method: 'get'
			}).then(userIds => {
				group.members.forEach(m => {
					// 更新成员在线状态
					m.online = userIds.some(userId => m.userId == userId)
				})
				// 重新排序
				this.refreshMmeberSort(id);
			})
		},
		refreshMmeberSort(id) {
			let group = this.findGroup(id);
			group.members.sort((m1, m2) => {
				// 在线的放前面
				if (m1.online && !m2.online) {
					return -1
				}
				if (!m1.online && m2.online) {
					return 1
				}
				// 群主在前面
				if (m1.userId == group.ownerId) {
					return -1;
				}
				if (m2.userId == group.ownerId) {
					return 1;
				}
				// 管理员在前面
				if (m1.isManager && !m2.isManager) {
					return -1;
				}
				if (!m1.isManager && m2.isManager) {
					return 1;
				}
				return 0;
			})
		},
		clear() {
			this.groups = [];
			this.groupMap.clear();
		},
		loadGroup() {
			return new Promise((resolve, reject) => {
				http({
					url: '/group/list',
					method: 'GET'
				}).then(groups => {
					this.setGroups(groups);
					resolve();
				}).catch((res) => {
					reject(res);
				})
			});
		}
	},
	getters: {
		findGroup: (state) => (id) => {
			return state.groupMap.get(id);
		},
		isGroup: (state) => (id) => {
			let group = state.findGroup(id);
			return group && !group.quit
		},
	}
});