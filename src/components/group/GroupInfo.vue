<template>
	<div v-if="show" class="group-info" :style="{ left: pos.x + 'px', top: pos.y + 'px' }" @click.stop>
		<div class="container">
			<div class="avatar">
				<head-image :name="group.name" :url="group.headImageThumb" :size="60" @click.native="showFullImage()"
					radius="10%"> </head-image>
			</div>
			<div class="info-card">
				<div class="header">
					<div class="name">{{ group.name }}</div>
					<el-tag v-if="group.isBanned" type="danger">已封禁</el-tag>
				</div>
				<div class="info-item">
					群主: {{ ownerName }}
				</div>
			</div>
		</div>

		<!-- 成员预览区域 -->
		<div class="member-preview">
			<div class="preview-header">
				<span class="preview-title">群成员</span>
				<span class="preview-count">{{ memberSize }}人</span>
			</div>
			<div class="member-avatars">
				<div v-for="member in previewMembers" :key="member.userId" class="member-avatar"
					:title="member.showNickName">
					<head-image :name="member.showNickName" :url="member.headImageThumb" :size="32"
						radius="50%"></head-image>
				</div>
				<div v-if="memberSize > maxPreviewCount" class="more-members">
					<span class="more-count">+{{ memberSize - maxPreviewCount }}</span>
				</div>
			</div>
		</div>
		<div class="btn-group">
			<el-button v-if="isInGroup" type="primary" @click="onSendMessage()" icon="el-icon-position">发消息</el-button>
			<el-button v-else type="primary" @click="onJoin()" icon="el-icon-plus">申请加入</el-button>
		</div>
	</div>
</template>

<script>
import HeadImage from '../common/HeadImage.vue';

export default {
	name: "GroupInfo",
	components: {
		HeadImage
	},
	data() {
		return {
			show: false,
			group: {},
			groupMembers: [],
			pos: {
				x: 0,
				y: 0
			}
		}
	},
	methods: {
		open(group, pos) {
			this.show = true;
			this.group = group;
			this.groupMembers = [];
			let w = document.documentElement.clientWidth;
			let h = document.documentElement.clientHeight;
			this.pos.x = Math.min(pos.x, w - 350);
			this.pos.y = Math.min(pos.y, h - 200);
			this.loadGroupMembers();
		},
		close() {
			this.show = false;
		},
		onSendMessage() {
			let chat = {
				type: 'GROUP',
				targetId: this.group.id,
				showName: this.group.showGroupName,
				headImage: this.group.headImageThumb,
				isDnd: this.group.isDnd,
				isTop: this.group.isTop
			};
			this.chatStore.openChat(chat);
			this.chatStore.setActiveChat(chat);
			if (this.$route.path != "/home/chat") {
				this.$router.push("/home/chat");
			}
			this.show = false;
		},
		onJoin() {
			this.$http({
				url: "/group/join/" + this.group.id,
				method: 'post'
			}).then(() => {
				this.groupStore.addGroup(this.group);
				this.$message.success(`您加入了群聊'${this.group.name}'`)
			})
		},
		showFullImage() {
			if (this.group.headImage) {
				this.$eventBus.$emit("openFullImage", this.group.headImage);
			}
		},
		loadGroupMembers() {
			this.$http({
				url: `/group/members/${this.group.id}`,
				method: "get"
			}).then((members) => {
				this.groupMembers = members;
			})
		}
	},
	computed: {
		isInGroup() {
			return this.groupStore.isGroup(this.group.id);
		},
		ownerName() {
			let member = this.groupMembers.find((m) => m.userId == this.group.ownerId);
			return member && member.showNickName;
		},
		memberSize() {
			return this.groupMembers.filter(m => !m.quit).length;
		},
		maxPreviewCount() {
			return 6; // 最多显示6个成员头像
		},
		previewMembers() {
			// 过滤掉已退群的成员，并限制显示数量
			const activeMembers = this.groupMembers.filter(m => !m.quit);
			return activeMembers.slice(0, this.maxPreviewCount);
		}
	}
}
</script>

<style lang="scss" scoped>
.group-info {
	position: fixed;
	width: 320px;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 16px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
	border: 1px solid rgba(255, 255, 255, 0.2);
	z-index: 9999;
	overflow: hidden;

	.container {
		padding: 20px;
		display: flex;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 20px;

		.avatar {
			position: relative;
			flex-shrink: 0;
		}

		.info-card {
			flex: 1;
			min-width: 0;

			.header {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 8px;
				flex-wrap: wrap;

				.name {
					font-size: 18px;
					font-weight: 700;
					color: var(--im-text-color-primary);
					line-height: 1.2;
				}
			}

			.info-item {
				font-size: 14px;
				color: var(--im-text-color);
				margin-bottom: 8px;
				word-break: break-word;
				line-height: 1.5;

				&:last-child {
					margin-bottom: 0;
				}
			}
		}
	}

	.member-preview {
		padding: 0 20px 20px 20px;

		.preview-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 12px;

			.preview-title {
				font-size: 14px;
				font-weight: 600;
				color: var(--im-text-color-primary);
			}

			.preview-count {
				font-size: 12px;
				color: var(--im-text-color-light);
				background: var(--im-background-active);
				padding: 2px 8px;
				border-radius: 10px;
			}
		}

		.member-avatars {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-wrap: wrap;

			.member-avatar {
				position: relative;
				cursor: pointer;
				transition: all 0.2s ease;

				&:hover {
					transform: scale(1.1);
					z-index: 10;
				}
			}

			.more-members {
				width: 32px;
				height: 32px;
				background: var(--im-background-active);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 2px solid rgba(255, 255, 255, 0.8);
				cursor: pointer;
				transition: all 0.2s ease;


				&:hover {
					background: var(--im-color-primary-light-2);
					transform: scale(1.1);

					.more-count {
						color: white;
					}
				}

				.more-count {
					font-size: 11px;
					font-weight: 600;
					color: var(--im-text-color-light);
				}
			}
		}
	}

	.btn-group {
		padding: 0 20px 20px 20px;
		text-align: center;

		.el-button {
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
	}
}
</style>
