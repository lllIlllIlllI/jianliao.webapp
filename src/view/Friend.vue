<template>
	<el-container class="friend-page">
		<resizable-aside :default-width="260" :min-width="200" :max-width="500" storage-key="friend-aside-width">
			<div class="header" :class="configStore.electronMode ? 'header-menu-wrap' : ''">
				<el-input class="search-text" size="small" placeholder="搜索" v-model="searchText">
					<i class="el-icon-search el-input__icon" slot="prefix"> </i>
				</el-input>
				<el-button plain class="add-btn" icon="el-icon-plus" title="添加好友"
					@click="onShowAddFriend()"></el-button>
				<add-friend :dialogVisible="showAddFriend" @close="onCloseAddFriend"></add-friend>
			</div>
			<el-scrollbar class="friend-items">
				<!-- 顶部列表: 新的朋友、ai机器人等 -->
				<div class="top-item" :class="showFriendReuqest ? 'active' : ''" @click="onClickNewFriend">
					<div class="top-item-avatar">
						<head-image :size="42" :url="require('@/assets/image/new_friend.png')">
							<div v-show="recvCount" class="unread-text">{{ recvCount }} </div>
						</head-image>
					</div>
					<div class="top-item-info">
						<div class="top-item-name">新的朋友</div>
					</div>
				</div>
				<div class="divider"></div>
				<div v-for="(friends, i) in friendValues" :key="i">
					<div class="letter">{{ friendKeys[i] }}</div>
					<div v-for="(friend) in friends" :key="friend.id">
						<friend-item :id="friend.id" :friend="friend" :active="friend.id === activeFriend.id"
							@chat="onSendMessage(friend)" @card="onSendCard(friend)" @delete="onDelFriend(friend)"
							@click.native="onActiveItem(friend)">
						</friend-item>
					</div>
					<div v-if="i < friendValues.length - 1" class="divider"></div>
				</div>
			</el-scrollbar>
		</resizable-aside>
		<el-container v-if="showFriendReuqest" class="container">
			<div class="header" :class="configStore.electronMode ? 'header-menu-wrap' : ''"> 新的朋友</div>
			<friend-request class="request-box"></friend-request>
		</el-container>
		<el-container v-else class="container" v-show="userInfo.id">
			<div class="header" :class="configStore.electronMode ? 'header-menu-wrap' : ''">
				<div class="nick-name">{{ userInfo.nickName }}</div>
				<span v-if="userInfo.companyName" class="company-tag">@{{ userInfo.companyName }}</span>
			</div>
			<div class="friend-info">
				<div class="info-card">
					<div class="avatar-section">
						<head-image :size="120" :name="userInfo.nickName" :url="userInfo.headImage" :radius="'50%'"
							@click.native="showFullImage()"></head-image>
					</div>
					<div class="info-section">
						<div class="name-header">
							<h2 class="friend-name">{{ activeFriend.showNickName || userInfo.nickName }}</h2>
							<div v-if="isFriend" title="更多" class="more-btn el-icon-more" @click="onClickMore"></div>
						</div>
						<div class="info-item-list">
							<div class="info-item">
								<span class="info-label">用户名(ID)</span>
								<span class="info-value">
									{{ userInfo.userName }}
									<el-tag v-if="userInfo.status == 1" type="danger" size="mini">已注销</el-tag>
								</span>
							</div>
							<div class="info-item">
								<span class="info-label">昵称</span>
								<span class="info-value">{{ userInfo.nickName }}</span>
							</div>
							<div class="info-item" v-if="userInfo.companyName">
								<span class="info-label">所在企业</span>
								<span class="info-value">
									{{ userInfo.companyName }}
								</span>
							</div>
							<div v-if="isFriend" class="info-item remark-item">
								<span class="info-label">备注名</span>
								<span class="info-value remark-content"
									:class="activeFriend.remarkNickName ? '' : 'light-text'">
									{{ activeFriend.showNickName || '未设置备注名' }}
									<i class="icon iconfont icon-modify" @click="onEditRemark"></i>
								</span>
							</div>
							<div class="info-item">
								<span class="info-label">性别</span>
								<span class="info-value">{{ userInfo.sex == 0 ? "男" : "女" }}</span>
							</div>
							<div class="info-item">
								<span class="info-label">个性签名</span>
								<span class="info-value" v-if="userInfo.signature">{{ userInfo.signature }}</span>
								<span class="info-value light-text" v-else>这个人很懒，什么都没有留下</span>
							</div>
						</div>
						<div class="btn-group">
							<el-button v-show="isFriend" icon="el-icon-position" type="primary"
								@click="onSendMessage(activeFriend)">发消息</el-button>
							<el-button v-show="!isFriend" icon="el-icon-plus" type="primary"
								@click="onAddFriend(userInfo)">加为好友</el-button>
							<el-button v-show="isFriend" icon="el-icon-delete" type="danger"
								@click="onDelFriend(userInfo)">删除好友</el-button>
						</div>
					</div>
				</div>
			</div>

		</el-container>
		<friend-apply ref="applyRef"></friend-apply>
		<chat-selector ref="chatSel" title="分享名片"></chat-selector>
		<right-menu ref="rightMenu" @select="onSelectMenu"></right-menu>
		<complaint ref="complaint"></complaint>
	</el-container>
</template>

<script>
import FriendItem from "../components/friend/FriendItem.vue";
import FriendRequestItem from "../components/friend/FriendRequestItem.vue";
import AddFriend from "../components/friend/AddFriend.vue";
import HeadImage from "../components/common/HeadImage.vue";
import NoDataTip from '../components/common/NoDataTip.vue';
import FriendApply from '../components/friend/FriendApply.vue';
import FriendRequest from '../components/friend/FriendRequest.vue';
import ChatSelector from "../components/chat/ChatSelector.vue";
import RightMenu from "../components/common/RightMenu.vue";
import ResizableAside from "../components/common/ResizableAside.vue";
import { pinyin } from 'pinyin-pro';
import Complaint from '../components/common/Complaint.vue';

export default {
	name: "friend",
	components: {
		FriendItem,
		FriendRequestItem,
		AddFriend,
		HeadImage,
		NoDataTip,
		FriendApply,
		FriendRequest,
		ChatSelector,
		RightMenu,
		ResizableAside,
		Complaint
	},
	data() {
		return {
			searchText: "",
			showAddFriend: false,
			activeFriend: {},
			userInfo: {},
			showFriendReuqest: false,
			menuItems: [{
				key: 'CHAT',
				name: '发送消息',
			}, {
				key: 'CARD',
				name: '分享名片',
			}, {
				key: 'REMARK',
				name: '修改备注',
			}, {
				key: 'COMPLAINT',
				name: '投诉'
			}, {
				key: 'DELETE',
				name: '删除好友',
				danger: true
			}]
		}
	},
	mounted() {
		let userId = this.$route.query.id;
		if (userId) {
			let friend = this.friendStore.findFriend(parseInt(userId));
			this.onActiveItem(friend);
			this.locateItem(friend.id);
		}
	},
	methods: {
		onShowAddFriend() {
			this.showAddFriend = true;
		},
		onCloseAddFriend() {
			this.showAddFriend = false;
		},
		onActiveItem(friend) {
			this.activeFriend = friend;
			this.showFriendReuqest = false;
			this.loadUserInfo(friend.id);
		},
		onDelFriend(friend) {
			this.$confirm(`确认删除'${friend.nickName}',并清空聊天记录吗?`, '确认解除?', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$http({
					url: `/friend/delete/${friend.id}`,
					method: 'delete'
				}).then(() => {
					this.$message.success("删除好友成功");
					this.friendStore.removeFriend(friend.id);
					this.chatStore.removePrivateChat(friend.id);
				})
			})
		},
		onAddFriend() {
			this.$refs.applyRef.open(this.userInfo)
		},
		onSendMessage(friend) {
			let chat = {
				type: 'PRIVATE',
				targetId: friend.id,
				showName: friend.showNickName,
				headImage: friend.headImage,
				companyName: friend.companyName,
				isDnd: friend.isDnd,
				isTop: friend.isTop
			};
			this.chatStore.openChat(chat);
			this.chatStore.setActiveChat(chat);
			this.$router.push("/home/chat");
		},
		onSendCard(friend) {
			this.$refs.chatSel.open(chats => {
				let idx = 0;
				chats.forEach(chat => {
					let cardData = {
						userId: friend.id,
						nickName: friend.nickName,
						headImage: friend.headImage,
					}
					let msgInfo = {};
					msgInfo.type = this.$enums.MESSAGE_TYPE.USER_CARD;
					msgInfo.content = JSON.stringify(cardData);
					if (chat.type == 'PRIVATE') {
						msgInfo.recvId = chat.targetId;
					} else {
						msgInfo.groupId = chat.targetId;
					}
					let action = `/message/${chat.type.toLowerCase()}/send`;
					this.$http({
						url: action,
						method: 'post',
						data: msgInfo
					}).then(m => {
						m.selfSend = true;
						this.chatStore.openChat(chat);
						this.chatStore.insertMessage(m, chat);
						if (++idx == chats.length) {
							this.$message.success("发送成功")
						}
					})
				})
			})
		},
		onEditRemark() {
			this.$prompt('请输入好友备注', '修改备注', {
				inputValue: this.activeFriend.showNickName,
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputValidator: (value) => {
					if (value.length > 32) {
						return '好友备注长度不能大于32';
					}
				}
			}).then((o) => {
				let data = {
					friendId: this.activeFriend.id,
					remarkNickName: o.value
				}
				this.$http({
					url: '/friend/update/remark',
					method: 'put',
					data: data
				}).then((friend) => {
					this.activeFriend = friend;
					this.chatStore.updateChatFromFriend(friend);
					this.friendStore.updateFriend(friend);
				})
			})
		},
		onComplaint(friend) {
			this.$refs.complaint.open(1, friend.id, friend.nickName)
		},
		onClickNewFriend() {
			this.activeFriend = {};
			this.showFriendReuqest = true;
		},
		onClickMore(e) {
			this.$refs.rightMenu.open(e, this.menuItems);
		},
		onSelectMenu(item) {
			switch (item.key) {
				case 'CHAT':
					this.onSendMessage(this.activeFriend);
					break;
				case 'CARD':
					this.onSendCard(this.activeFriend);
					break;
				case 'REMARK':
					this.onEditRemark();
					break;
				case 'COMPLAINT':
					this.onComplaint(this.activeFriend);
					break;
				case 'DELETE':
					this.onDelFriend(this.activeFriend);
					break;
			}
		},
		locateItem(id) {
			if (this.isFriend) {
				document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
			}
		},
		showFullImage() {
			if (this.userInfo.headImage) {
				this.$eventBus.$emit("openFullImage", this.userInfo.headImage);

			}
		},
		updateFriendInfo() {
			if (this.isFriend) {
				// store的数据不能直接修改，深拷贝一份store的数据
				let friend = JSON.parse(JSON.stringify(this.activeFriend));
				friend.headImage = this.userInfo.headImageThumb;
				friend.nickName = this.userInfo.nickName;
				friend.showNickName = friend.remarkNickName ? friend.remarkNickName : friend.nickName;
				this.chatStore.updateChatFromFriend(friend);
				this.friendStore.updateFriend(friend);
			}
		},
		loadUserInfo(id) {
			// 获取好友用户信息
			this.$http({
				url: `/user/find/${id}`,
				method: 'GET'
			}).then((userInfo) => {
				this.userInfo = userInfo;
				this.updateFriendInfo();
			})
		},
		firstLetter(strText) {
			// 使用pinyin-pro库将中文转换为拼音
			let pinyinOptions = {
				toneType: 'none', // 无声调
				type: 'normal' // 普通拼音
			};
			let pyText = pinyin(strText, pinyinOptions);
			return pyText[0];
		},
		isEnglish(character) {
			return /^[A-Za-z]+$/.test(character);
		}
	},
	computed: {
		mine() {
			return this.userStore.userInfo;
		},
		friendMap() {
			// 按首字母分组
			let map = new Map();
			this.friendStore.friends.forEach((f) => {
				if (f.deleted || (this.searchText && !f.showNickName.includes(this.searchText))) {
					return;
				}
				let letter = this.firstLetter(f.showNickName).toUpperCase();
				// 非英文一律为#组
				if (!this.isEnglish(letter)) {
					letter = "#"
				}
				if (f.online) {
					letter = '在线'
				}
				if (map.has(letter)) {
					map.get(letter).push(f);
				} else {
					map.set(letter, [f]);
				}
			})
			// 排序
			let arrayObj = Array.from(map);
			arrayObj.sort((a, b) => {
				// #组在最后面
				if (a[0] == '#' || b[0] == '#') {
					return b[0].localeCompare(a[0])
				}
				return a[0].localeCompare(b[0])
			})
			map = new Map(arrayObj.map(i => [i[0], i[1]]));
			return map;
		},
		friendKeys() {
			return Array.from(this.friendMap.keys());
		},
		friendValues() {
			return Array.from(this.friendMap.values());
		},
		recvCount() {
			let requests = this.friendStore.requests;
			return requests.filter((req) => req.recvId == this.mine.id).length;
		},
		isFriend() {
			return this.friendStore.isFriend(this.userInfo.id);
		}
	}
}
</script>

<style lang="scss">
.friend-page {

	.divider {
		border-bottom: 1px #ddd solid;
		margin: 10px;
	}

	.header {
		height: 60px;
		display: flex;
		align-items: center;
		padding: 0 12px;

		.add-btn {
			padding: 8px;
			margin: 5px;
			font-size: 16px;
			border-radius: 50%;
			background: var(--im-background-active);
			color: var(--im-color-primary);
			transition: all 0.3s ease;
			font-weight: 600;
			border: var(--im-border);

			&:hover {
				background: var(--im-background-active-dark);
				transform: scale(1.1);
			}
		}
	}

	.friend-items {
		flex: 1;

		.top-item {
			height: 50px;
			display: flex;
			position: relative;
			padding: 5px 10px;
			align-items: center;
			white-space: nowrap;
			cursor: pointer;
			border-radius: 12px;

			&:hover {
				background-color: var(--im-background-active);
			}

			&.active {
				background-color: var(--im-background-active-dark);
			}

			.top-item-avatar {
				display: flex;
				justify-content: center;
				align-items: center;

				.unread-text {
					position: absolute;
					background-color: var(--im-color-danger);
					right: -4px;
					top: -8px;
					color: white;
					border-radius: 30px;
					padding: 1px 5px;
					font-size: 10px;
					text-align: center;
					white-space: nowrap;
					border: 1px solid #f1e5e5;
				}
			}

			.top-item-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				padding-left: 10px;
				text-align: left;

				.top-item-name {
					font-size: var(--im-font-size);
					white-space: nowrap;
					overflow: hidden;
				}
			}
		}
	}

	.letter {
		text-align: left;
		font-size: var(--im-larger-size-larger);
		padding: 5px 15px;
		color: var(--im-text-color-light);
	}
}

.container {
	display: flex;
	flex-direction: column;
	background: #fcfdff;

	.header {
		height: 60px;
		line-height: 60px;
		display: flex;
		align-items: center;
		padding: 0 12px;
		box-sizing: border-box;

		.nick-name {
			font-size: var(--im-font-size-larger);
			border-bottom: var(--im-border);
		}
	}

	.request-box {
		flex: 1;
	}

	.friend-info {
		flex: 1;
		display: flex;
		justify-content: center;
		padding: 20px;
		align-items: center;

		.info-card {
			border-radius: 20px;
			padding: 10px;
			position: relative;
			overflow: hidden;
			max-width: 600px;
			width: 100%;
			border-radius: 20px;

			.avatar-section {
				text-align: center;
				margin-bottom: 20px;

				:deep(.head-image) {
					border: 4px solid rgba(255, 255, 255, 0.8);
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
					transition: all 0.3s ease;
					cursor: pointer;

					&:hover {
						transform: scale(1.05);
						box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
						border-color: var(--im-color-primary-light-3);
					}
				}
			}

			.info-section {
				.name-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 25px;
					padding-bottom: 15px;
					border-bottom: 1px solid rgba(0, 0, 0, 0.06);

					.friend-name {
						font-size: 24px;
						font-weight: 600;
						color: var(--im-text-color-primary);
						margin: 0;
						position: relative;

						&::after {
							content: '';
							position: absolute;
							bottom: -15px;
							left: 0;
							width: 40px;
							height: 2px;
							background: var(--im-color-primary);
							border-radius: 1px;
						}
					}

					.more-btn {
						font-size: 20px;
						cursor: pointer;
						padding: 8px;
						border-radius: 50%;
						transition: all 0.3s ease;
						background: var(--im-background-active);
						color: var(--im-color-primary);

						&:hover {
							background: var(--im-background-active-dark);
							transform: scale(1.1);
						}
					}
				}

				.info-item-list {
					margin-bottom: 30px;

					.info-item {
						display: flex;
						align-items: center;
						padding: 12px 0;
						border-bottom: 1px solid rgba(0, 0, 0, 0.04);

						&:last-child {
							border-bottom: none;
						}

						.info-label {
							font-weight: 500;
							color: var(--im-text-color-secondary);
							font-size: 14px;
							min-width: 80px;
							margin-right: 20px;
						}

						.info-value {
							flex: 1;
							color: var(--im-text-color-primary);
							font-size: 15px;
							line-height: 24px;
							display: flex;
							align-items: center;
							text-align: left;
							gap: 8px;

							&.remark-content {
								display: flex;
								align-items: center;
								justify-content: space-between;

								.icon-modify {
									cursor: pointer;
									color: var(--im-color-primary);
									padding: 4px;
									border-radius: 4px;
									transition: all 0.3s ease;

									&:hover {
										background: var(--im-color-primary-light-9);
										transform: scale(1.1);
									}
								}
							}

							&.light-text {
								color: var(--im-text-color-light) !important;
							}
						}

						&.remark-item {
							.info-value {
								color: var(--im-text-color-secondary);
								font-style: italic;
							}
						}
					}
				}

				.btn-group {
					display: flex;
					gap: 12px;
					justify-content: center;
					flex-wrap: wrap;
				}
			}
		}
	}
}
</style>