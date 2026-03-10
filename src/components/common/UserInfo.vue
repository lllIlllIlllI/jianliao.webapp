<template>
	<div v-if="show" class="user-info" :style="{ left: pos.x + 'px', top: pos.y + 'px' }" @click.stop>
		<div class="user-card">
			<!-- 头部区域 -->
			<div class="user-header">
				<div class="avatar-section">
					<head-image :name="user.nickName" :url="user.headImageThumb" :size="70" :online="user.online"
						@click.native="showFullImage()" radius="50%"></head-image>
				</div>
				<div class="user-basic-info">
					<div class="user-name-row">
						<span class="nick-name">{{ user.nickName }}</span>
						<span v-if="user.companyName" class="company-tag-mini">@{{ user.companyName }}</span>
						<i v-if="user.sex == 0" class="el-icon-male gender-icon male"></i>
						<i v-if="user.sex == 1" class="el-icon-female gender-icon female"></i>
						<el-tag v-if="user.status == 1" type="danger" size="mini">已注销</el-tag>
						<el-tag v-if="user.isBanned" type="danger" size="mini">已封禁</el-tag>
					</div>
					<div class="user-id">
						<span>ID: {{ user.userName }}</span>
						<i class="el-icon-copy-document copy-btn" @click="copyUserName" title="复制用户ID"></i>
					</div>
				</div>
			</div>

			<!-- 个性签名区域 -->
			<div class="signature-section">
				<div class="signature-label">个性签名</div>
				<div class="signature-content">
					{{ user.signature ? user.signature : '这个人很懒，什么也没留下' }}
				</div>
			</div>

			<!-- 操作按钮区域 -->
			<div class="action-section">
				<el-button v-if="isFriend" type="primary" size="small" @click="onSendMessage()" class="action-btn"
					icon="el-icon-position">
					发消息
				</el-button>
				<div v-else-if="isWaitingApprove" class="wait-status">
					<i class="el-icon-time"></i>
					好友验证中
				</div>
				<el-button v-else-if="user.id != mine.id" type="success" size="small" @click="onAddFriend()"
					class="action-btn" icon="el-icon-plus">
					加为好友
				</el-button>
			</div>
		</div>
		<friend-apply ref="applyRef"></friend-apply>
	</div>
</template>

<script>
import FriendApply from '../friend/FriendApply.vue';
import HeadImage from './HeadImage.vue'

export default {
	name: "userInfo",
	components: {
		HeadImage,
		FriendApply
	},
	data() {
		return {
			show: false,
			user: {},
			pos: {
				x: 0,
				y: 0
			}
		}
	},
	methods: {
		open(user, pos) {
			this.show = true;
			this.user = user;
			let w = document.documentElement.clientWidth;
			let h = document.documentElement.clientHeight;
			this.pos.x = Math.min(pos.x, w - 350);
			this.pos.y = Math.min(pos.y, h - 200);
		},
		close() {
			this.show = false;
		},
		onSendMessage() {
			let user = this.user;
			let chat = {
				type: 'PRIVATE',
				targetId: user.id,
				showName: user.nickName,
				headImage: user.headImageThumb,
			};
			if (this.isFriend) {
				chat.isDnd = this.friendInfo.isDnd;
				chat.isTop = this.friendInfo.isTop;
				chat.companyName = this.friendInfo.companyName;
			}
			this.chatStore.openChat(chat);
			this.chatStore.setActiveChat(chat);
			if (this.$route.path != "/home/chat") {
				this.$router.push("/home/chat");
			}
			this.show = false;
		},
		onAddFriend() {
			this.$refs.applyRef.open(this.user);
		},
		showFullImage() {
			if (this.user.headImage) {
				this.$eventBus.$emit("openFullImage", this.user.headImage);
			}
		},
		copyUserName() {
			const userName = this.user.userName;
			// 使用现代浏览器的 Clipboard API
			if (navigator.clipboard && window.isSecureContext) {
				navigator.clipboard.writeText(userName).then(() => {
					this.$message.success(`内容'${userName}'已复制到剪贴板`);
				}).catch(() => {
					this.$message.error('复制失败，请手动复制');
				});
			} else {
				this.$message.error('复制失败，请手动复制');
			}
		}
	},
	computed: {
		mine() {
			return this.userStore.userInfo;
		},
		isFriend() {
			return this.friendStore.isFriend(this.user.id);
		},
		friendInfo() {
			return this.friendStore.findFriend(this.user.id);
		},
		isWaitingApprove() {
			return this.friendStore.isInRecvRequest(this.user.id);
		}
	}
}
</script>

<style lang="scss">
.user-info {
	position: fixed;
	width: 320px;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 16px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
	border: 1px solid rgba(255, 255, 255, 0.2);
	z-index: 9999;
	overflow: hidden;

	.user-card {
		padding: 20px;

		.user-header {
			position: relative;
			display: flex;
			align-items: flex-start;
			gap: 16px;
			margin-bottom: 20px;

			.avatar-section {
				position: relative;
			}

			.user-basic-info {
				display: flex;
				flex-direction: column;
				justify-content: center;
				flex: 1;
				min-height: 70px;
				overflow: hidden;

				.user-name-row {
					gap: 8px;
					margin-bottom: 8px;

					.nick-name {
						font-size: var(--im-font-size-large);
						font-weight: 700;
						color: var(--im-text-color-primary);
						line-height: 1.2;
						word-break: break-all;
					}

					.gender-icon {
						font-size: 16px;
						border-radius: 50%;
						padding: 2px;
						transition: all 0.3s ease;
						margin-left: 3px;
						&.male {
							color: #1890ff;
							background: rgba(24, 144, 255, 0.1);
						}

						&.female {
							color: #f5222d;
							background: rgba(245, 34, 45, 0.1);
						}
					}

				}

				.user-id {
					font-size: var(--im-font-size);
					color: var(--im-text-color);
					font-family: 'Courier New', monospace;
					display: flex;
					align-items: center;
					word-break: break-all;
					gap: 6px;

					.copy-btn {
						font-size: 12px;
						color: var(--im-color-primary);
						cursor: pointer;
						padding: 2px;
						border-radius: 3px;
						transition: all 0.3s ease;
						opacity: 0.7;

						&:hover {
							background: rgba(64, 158, 255, 0.1);
							opacity: 1;
							transform: scale(1.1);
						}
					}
				}
			}
		}

		.signature-section {
			margin-bottom: 20px;
			padding: 16px;
			background: rgba(0, 0, 0, 0.02);
			border-radius: 12px;
			border: 1px solid rgba(0, 0, 0, 0.06);

			.signature-label {
				font-size: 12px;
				color: var(--im-text-color-light);
				font-weight: 500;
				margin-bottom: 8px;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}

			.signature-content {
				font-size: 14px;
				color: var(--im-text-color);
				line-height: 1.5;
				font-style: italic;
				word-break: break-word;
			}
		}

		.action-section {
			text-align: center;

			.action-btn {
				width: 100%;
				padding: 10px 16px;
				border-radius: 8px;
				font-weight: 500;
				transition: all 0.3s ease;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

				&:hover {
					transform: translateY(-1px);
					box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
				}
			}

			.wait-status {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8px;
				padding: 10px 16px;
				color: var(--im-text-color-light);
				font-size: 14px;
				background: rgba(0, 0, 0, 0.04);
				border-radius: 8px;

				i {
					font-size: 16px;
					color: var(--im-color-warning);
				}
			}
		}
	}
}
</style>
