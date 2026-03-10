<template>
	<div class="chat-group-side">
		<chat-group-member v-if="showAllMembers" @back="showAllMembers = false" :group="group"
			:groupMembers="showMembers"></chat-group-member>
		<div v-else>
			<div class="member-area">
				<div class="member-header">
					<div class="member-title">群成员</div>
					<div class="more-member-btn" @click="onShowMoreMember">查看全部{{ showMembers.length }}名成员</div>
				</div>
				<div class="member-items">
					<div v-for="member in showGridMembers" :key="member.id">
						<group-member-item class="member-item" :group="group" :groupMembers="groupMembers"
							:member="member" type="card"></group-member-item>
					</div>
					<div class="member-tools" v-if="isAllowInvite">
						<div class="tool-btn" title="邀请好友进群聊" @click="onInvite()">
							<i class="el-icon-plus"></i>
						</div>
						<div class="tool-text">邀请</div>
						<add-group-member ref="addGroupMember" :groupId="group.id" :members="groupMembers"
							@reload="$emit('reload')"></add-group-member>
					</div>
					<div class="member-tools" v-if="isOwner || isManager">
						<div class="tool-btn" title="选择成员移出群聊" @click="onRemove()">
							<i class="el-icon-minus"></i>
						</div>
						<div class="tool-text">移除</div>
						<group-member-selector ref="removeSelector" title="选择成员进行移除" :group="group"
							@complete="onRemoveComplete"></group-member-selector>
					</div>
					<div class="member-tools" v-if="isOwner || isManager">
						<div class="tool-btn" title="禁言" @click="onMuted()">
							<span class="icon iconfont icon-chat-muted"></span>
						</div>
						<div class="tool-text">禁言</div>
						<group-member-selector ref="mutedSelector" title="选择成员进行禁言" :group="group"
							@complete="onMutedComplete"></group-member-selector>
					</div>
					<div class="member-tools" v-if="isOwner || isManager">
						<div class="tool-btn" title="解除禁言" @click="onUnmuted()">
							<span class="icon iconfont icon-chat-unmuted"></span>
						</div>
						<div class="tool-text">解除禁言</div>
						<group-member-selector ref="unmutedSelector" title="选择成员进行解除禁言" :group="group"
							@complete="onUnmutedComplete"></group-member-selector>
					</div>
				</div>
			</div>

			<!-- 个人设置区域 -->
			<div class="switch-setting">
				<div class="switch-item">
					<div class="label">
						<span>消息免打扰</span>
					</div>
					<el-switch v-model="group.isDnd" @change="onDndChange"></el-switch>
				</div>
				<div class="switch-item">
					<div class="label">
						<span>置顶聊天</span>
					</div>
					<el-switch v-model="group.isTop" @change="onTopChange"></el-switch>
				</div>
			</div>

			<div class="switch-setting" v-if="isOwner || isManager">
				<div class="switch-item">
					<div class="label">
						<span>全员禁言</span>
					</div>
					<el-switch v-model="group.isAllMuted" @change="onAllMutedChange"></el-switch>
				</div>
				<div class="switch-item">
					<div class="label">
						<span>允许普通成员邀请好友</span>
					</div>
					<el-switch v-model="group.isAllowInvite" @change="onAllowInviteChange"></el-switch>
				</div>
				<div class="switch-item">
					<div class="label">
						<span>允许普通成员分享名片</span>
					</div>
					<el-switch v-model="group.isAllowShareCard" @change="onAllowShareCardChange"></el-switch>
				</div>
			</div>
			<div class="group-info-section">
				<!-- 群聊名称 -->
				<div class="info-item">
					<div class="info-label">
						<span>群聊名称</span>
					</div>
					<div class="info-content">
						<el-input v-if="isEditingGroupName" v-model="groupNameValue" size="small" placeholder="请输入群聊名称"
							maxlength="20" show-word-limit @blur="saveGroupName" @keyup.enter="saveGroupName"
							ref="groupNameInput">
						</el-input>
						<div v-else class="info-display" @click="startEditGroupName">
							<span v-if="group.name">{{ group.name }}</span>
							<span v-else class="info-placeholder">点击设置群聊名称</span>
						</div>
					</div>
				</div>

				<!-- 备注 -->
				<div class="info-item">
					<div class="info-label">
						<span>备注名</span>
					</div>
					<div class="info-content">
						<el-input v-if="isEditingRemark" v-model="remarkValue" size="small" maxlength="32"
							show-word-limit @blur="saveRemark" @keyup.enter="saveRemark" ref="remarkInput">
						</el-input>
						<div v-else class="info-display" @click="startEditRemark">
							<span v-if="group.remarkGroupName">{{ group.remarkGroupName }}</span>
							<span v-else class="info-placeholder">点击设置备注名</span>
						</div>
					</div>
				</div>

				<!-- 我在本群的昵称 -->
				<div class="info-item">
					<div class="info-label">
						<span>我在本群的昵称</span>
					</div>
					<div class="info-content">
						<el-input v-if="isEditingNickName" v-model="nickNameValue" size="small" placeholder="请输入昵称"
							maxlength="20" show-word-limit @blur="saveNickName" @keyup.enter="saveNickName"
							ref="nickNameInput">
						</el-input>
						<div v-else class="info-display" @click="startEditNickName">
							<span v-if="group.remarkNickName">{{ group.remarkNickName }}</span>
							<span v-else class="info-placeholder">点击设置昵称</span>
						</div>
					</div>
				</div>
			</div>

			<!-- 群公告 -->
			<div class="notice-section" v-if="group.notice || isOwner || isManager">
				<div class="notice-header">
					<span>群公告</span>
				</div>
				<div class="notice-content">
					<div class="notice-display" @click="openNoticeDialog">
						<div v-if="group.notice" class="notice-text">{{ group.notice }}</div>
						<div v-else class="notice-placeholder">点击设置群公告</div>
					</div>
				</div>
			</div>

			<!-- 群公告编辑弹窗 -->
			<el-dialog title="编辑群公告" :visible.sync="noticeDialogVisible" width="500px" :close-on-click-modal="false"
				:close-on-press-escape="false">
				<div class="notice-dialog-content">
					<el-input v-model="noticeValue" type="textarea" placeholder="请输入群公告" maxlength="512" show-word-limit
						:rows="6" ref="noticeDialogInput">
					</el-input>
				</div>
				<div slot="footer" class="dialog-footer">
					<el-button @click="cancelNoticeEdit">取消</el-button>
					<el-button type="primary" @click="saveNotice">保存</el-button>
				</div>
			</el-dialog>

			<div v-show="!group.quit" class="btn-group">
				<div class="text-btn" @click="onCleanMessage">
					清空聊天记录
				</div>
				<div class="text-btn" v-show="!isOwner" @click="onQuit()">
					退出群聊
				</div>
			</div>
			<div class="complaint-tip" @click="onComplaint">
				<span>被骚扰了？举报该群</span>
			</div>
		</div>

		<complaint ref="complaint"></complaint>
	</div>
</template>

<script>
import AddGroupMember from '../group/AddGroupMember.vue';
import GroupMemberItem from '../group/GroupMemberItem.vue';
import GroupMemberSelector from '../group/GroupMemberSelector.vue';
import ChatGroupMember from './ChatGroupMember.vue';
import Complaint from '../common/Complaint.vue';

export default {
	name: "chatGroupSide",
	components: {
		AddGroupMember,
		GroupMemberItem,
		GroupMemberSelector,
		ChatGroupMember,
		Complaint
	},
	data() {
		return {
			editing: false,
			showAllMembers: false,
			group: {},
			// 编辑状态
			isEditingGroupName: false,
			isEditingRemark: false,
			isEditingNickName: false,
			// 弹窗状态
			noticeDialogVisible: false,
			// 编辑值
			groupNameValue: '',
			noticeValue: '',
			remarkValue: '',
			nickNameValue: ''
		}
	},
	props: {
		groupId: {
			type: Number
		},
		groupMembers: {
			type: Array
		},
		chat: {
			type: Object
		}
	},
	methods: {
		onClose() {
			this.$emit('close');
		},

		// 免打扰开关变化
		onDndChange(value) {
			const data = {
				groupId: this.groupId,
				isDnd: value
			};
			this.$http({
				url: '/group/dnd',
				method: 'PUT',
				data: data
			}).then(() => {
				this.groupStore.setDnd(this.groupId, value);
				this.chatStore.setDnd(this.chat, value);
				this.$message.success(value ? '已开启免打扰' : '已关闭免打扰');
			}).catch(() => {
				this.$message.error('操作失败，请重试');
				this.group.isDnd = !value;
			});
		},

		// 置顶开关变化
		onTopChange(value) {
			const data = {
				groupId: this.groupId,
				isTop: value
			};
			this.$http({
				url: '/group/top',
				method: 'PUT',
				data: data
			}).then(() => {
				this.groupStore.setTop(this.groupId, value);
				this.chatStore.setTop(this.chat, value);
				this.$message.success(value ? '已置顶聊天' : '已取消置顶');
			}).catch(() => {
				this.$message.error('操作失败，请重试');
				this.group.isTop = !value;
			});
		},
		onInvite() {
			this.$refs.addGroupMember.open();
		},
		onRemove() {
			// 群主和自己不显示
			let hideIds = [this.group.ownerId, this.mine.id];
			// 只有群主可以移除管理员
			if (!this.isOwner) {
				hideIds = hideIds.concat(this.managerIds);
			}
			this.$refs.removeSelector.open(50, [], [], hideIds);
		},
		onRemoveComplete(members) {
			let userIds = members.map(m => m.userId);
			let data = {
				groupId: this.group.id,
				userIds: userIds
			}
			this.$http({
				url: "/group/members/remove",
				method: 'delete',
				data: data
			}).then(() => {
				this.$emit('reload');
				this.$message.success(`您移除了${userIds.length}位成员`);
			})
		},
		onMuted() {
			// 群主和自己不显示
			let hideIds = [this.group.ownerId, this.mine.id];
			// 只有群主可以禁言管理员
			if (!this.isOwner) {
				hideIds = hideIds.concat(this.managerIds);
			}
			// 已禁言的用户不可选中
			let lockedIds = this.groupMembers.filter(m => m.isMuted).map(m => m.userId);
			this.$refs.mutedSelector.open(50, [], lockedIds, hideIds);
		},
		onMutedComplete(members) {
			let userIds = members.map(m => m.userId);
			let data = {
				groupId: this.group.id,
				userIds: userIds,
				isMuted: true
			}
			let tip = `您对${userIds.length}位成员进行了禁言`;
			this.sendMemberMuted(data, tip);
		},
		onUnmuted() {
			// 过滤掉未禁言的用户
			let hideIds = this.groupMembers.filter(m => !m.isMuted).map(m => m.userId)
			// 只有群主可以解除管理员的禁言
			if (!this.isOwner) {
				hideIds = hideIds.concat(this.managerIds);
			}
			this.$refs.unmutedSelector.open(50, [], [], hideIds);
		},
		onUnmutedComplete(members) {
			let userIds = members.map(m => m.userId);
			let data = {
				groupId: this.group.id,
				userIds: userIds,
				isMuted: false
			}
			let tip = `您解除了${userIds.length}位成员的禁言`;
			this.sendMemberMuted(data, tip);
		},
		onAllMutedChange() {
			let data = {
				id: this.group.id,
				isMuted: this.group.isAllMuted
			}
			this.$http({
				url: '/group/muted',
				method: 'PUT',
				data: data
			})
		},
		onAllowInviteChange() {
			let data = {
				groupId: this.group.id,
				isAllowInvite: this.group.isAllowInvite
			}
			this.$http({
				url: '/group/allowInvite',
				method: 'PUT',
				data: data
			})
		},
		onAllowShareCardChange() {
			let data = {
				groupId: this.group.id,
				isAllowShareCard: this.group.isAllowShareCard
			}
			this.$http({
				url: '/group/allowShareCard',
				method: 'PUT',
				data: data
			})
		},
		onSaveGroup() {
			let vo = this.group;
			this.$http({
				url: "/group/modify",
				method: "put",
				data: vo
			}).then(group => {
				this.editing = !this.editing
				this.groupStore.updateGroup(group);
				this.$emit('reload');
				this.$message.success("修改成功");
			})
		},
		onShowMoreMember() {
			this.showAllMembers = true;
		},
		onQuit() {
			this.$confirm('退出群聊后将不再接受群里的消息，确认退出吗？', '确认退出?', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.$http({
					url: `/group/quit/${this.group.id}`,
					method: 'delete'
				}).then(() => {
					this.groupStore.removeGroup(this.group.id);
					this.chatStore.removeGroupChat(this.group.id);
				});
			})
		},
		sendMemberMuted(data, tip) {
			this.$http({
				url: "/group/members/muted",
				method: "put",
				data: data
			}).then(() => {
				this.$emit('reload');
				this.$message.success(tip)
			})
		},

		// 开始编辑群聊名称
		startEditGroupName() {
			if (!this.isOwner && !this.isManager) return;
			this.isEditingGroupName = true;
			this.groupNameValue = this.group.name || '';
			this.$nextTick(() => {
				this.$refs.groupNameInput.focus();
			});
		},

		// 保存群聊名称
		saveGroupName() {
			const newName = this.groupNameValue.trim();
			if (newName === (this.group.name || '')) {
				this.isEditingGroupName = false;
				return;
			}
			this.group.name = newName;
			this.saveGroupInfo();
		},

		// 打开群公告编辑弹窗
		openNoticeDialog() {
			if (!this.isOwner && !this.isManager) return;
			this.noticeValue = this.group.notice || '';
			this.noticeDialogVisible = true;
			this.$nextTick(() => {
				this.$refs.noticeDialogInput.focus();
			});
		},

		// 保存群公告
		saveNotice() {
			const newNotice = this.noticeValue.trim();
			if (newNotice === (this.group.notice || '')) {
				this.noticeDialogVisible = false;
				return;
			}
			this.group.notice = newNotice;
			this.saveGroupInfo();
		},

		// 取消群公告编辑
		cancelNoticeEdit() {
			this.noticeDialogVisible = false;
			this.noticeValue = this.group.notice || '';
		},

		// 开始编辑备注
		startEditRemark() {
			this.isEditingRemark = true;
			this.remarkValue = this.group.remarkGroupName || '';
			this.$nextTick(() => {
				this.$refs.remarkInput.focus();
			});
		},

		// 保存备注
		saveRemark() {
			const newRemark = this.remarkValue.trim();
			if (newRemark === (this.group.remarkGroupName || '')) {
				this.isEditingRemark = false;
				return;
			}
			this.group.remarkGroupName = newRemark;
			this.saveGroupInfo();
		},

		// 开始编辑昵称
		startEditNickName() {
			this.isEditingNickName = true;
			this.nickNameValue = this.group.remarkNickName || '';
			this.$nextTick(() => {
				this.$refs.nickNameInput.focus();
			});
		},

		// 保存昵称
		saveNickName() {
			const newNickName = this.nickNameValue.trim();
			if (newNickName === (this.group.remarkNickName || '')) {
				this.isEditingNickName = false;
				return;
			}
			this.group.remarkNickName = newNickName;
			this.saveGroupInfo();
		},

		// 保存群信息
		saveGroupInfo() {
			let vo = this.group;
			this.$http({
				url: "/group/modify",
				method: "put",
				data: vo
			}).then(group => {
				this.chatStore.updateChatFromGroup(group)
				this.groupStore.updateGroup(group);
				this.$message.success("修改成功");
				// 关闭群公告弹窗
				if (this.noticeDialogVisible) {
					this.noticeDialogVisible = false;
				}
			}).finally(() => {
				// 退出所有编辑模式
				this.isEditingGroupName = false;
				this.isEditingRemark = false;
				this.isEditingNickName = false;
			});
		},
		// 清空聊天记录
		onCleanMessage() {
			this.$confirm(`确定要清空'${this.group.name}'的所有聊天记录吗？`, '清空聊天记录', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.chatStore.cleanMessage(this.chat);
				this.$message.success(`您清空了'${this.group.name}'的聊天记录`);
			}).catch(() => {
				// 用户取消操作
			});
		},
		// 投诉群组
		onComplaint() {
			this.$refs.complaint.open(2, this.group.id, this.group.name);
		}
	},
	computed: {
		mine() {
			return this.userStore.userInfo;
		},
		ownerName() {
			let member = this.groupMembers.find((m) => m.userId == this.group.ownerId);
			return member && member.showNickName;
		},
		isOwner() {
			return this.group.ownerId == this.mine.id;
		},
		isManager() {
			let userId = this.mine.id;
			let m = this.groupMembers.find((m) => m.userId == userId);
			return m && m.isManager;
		},
		isAllowInvite() {
			return this.isOwner || this.isManager || this.group.isAllowInvite;
		},
		managerIds() {
			return this.groupMembers.filter(m => m.isManager).map(m => m.userId)
		},
		showMembers() {
			return this.groupMembers.filter((m) => !m.quit)
		},
		showGridMembers() {
			return this.showMembers.slice(0, this.showMaxIdx);
		},
		showMaxIdx() {
			let idx = this.configStore.fullScreen ? 12 : 9;
			if (this.isAllowInvite) {
				// 邀请按钮
				idx--;
			}
			if (this.isOwner || this.isManager) {
				// 开启禁言、解除禁言、移除成员
				idx -= 3;
			}
			return idx;
		}
	},
	mounted() {
		// vuex的数据不允许编辑，这里拷贝一份数据
		let group = this.groupStore.findGroup(this.groupId);
		this.group = JSON.parse(JSON.stringify(group));
	}
}
</script>

<style lang="scss">
.chat-group-side {
	padding: 10px;
	position: relative;
	height: 100%;
	overflow-y: auto;
	box-sizing: border-box;

	// 公共卡片样式
	%card-style {
		padding: 5px 16px;
		background: rgba(255, 255, 255, 0.8);
		border-radius: 10px;
		border: 1px solid rgba(0, 0, 0, 0.05);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.member-area {
		margin-bottom: 12px;
		padding: 12px;
		@extend %card-style;

		.member-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 12px;
			padding-bottom: 8px;
			border-bottom: 1px solid rgba(0, 0, 0, 0.08);

			.member-title {
				font-size: var(--im-font-size);
				font-weight: 500;
				color: var(--im-text-color-primary);
			}

			.more-member-btn {
				font-size: var(--im-font-size-smaller);
				color: var(--im-color-primary-light-2);
				cursor: pointer;
				padding: 4px 8px;
				border-radius: 4px;
				transition: all 0.2s ease;

				&:hover {
					color: var(--im-color-primary);
				}
			}
		}

		.member-items {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			text-align: center;
			gap: 10px;

			.member-item {
				transition: all 0.3s ease;
				padding: 4px;
				border-radius: 8px;

				&:hover {
					transform: translateY(-2px);
					background: rgba(64, 158, 255, 0.05);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
				}
			}

			.member-tools {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 54px;
				margin-left: 8px;

				.tool-btn {
					width: 40px;
					height: 40px;
					display: flex;
					align-items: center;
					justify-content: center;
					border: var(--im-border);
					border-radius: 50%;
					font-size: 18px;
					cursor: pointer;
					color: var(--im-text-color-light);
					box-sizing: border-box;
					font-weight: 800;
					background: var(--im-background-active);
					transition: all 0.3s ease;
					box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

					&:hover {
						border-color: var(--im-color-primary-light-2);
						color: var(--im-color-primary-light-2);
						background: var(--im-background-active);
						transform: translateY(-2px);
						box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
					}
				}

				.tool-text {
					font-size: 11px;
					color: var(--im-text-color);
					margin-top: 6px;
					text-align: center;
					font-weight: 500;
					width: 100%;
					height: 20px;
					line-height: 20px;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
				}
			}
		}
	}

	.switch-setting {
		margin-bottom: 12px;
		@extend %card-style;

		.switch-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 12px 0;
			border-bottom: 1px solid rgba(0, 0, 0, 0.08);
			transition: all 0.2s ease;

			&:last-child {
				border-bottom: none;
			}

			&:hover {
				background: var(--im-background-active);
				border-radius: 6px;
				padding: 12px 8px;
				margin: 0 -8px;
			}

			.label {
				display: flex;
				align-items: center;
				gap: 10px;
				font-size: 14px;
				font-weight: 500;
				color: var(--im-text-color-primary);
			}
		}
	}

	.group-info-section {
		margin-bottom: 12px;
		@extend %card-style;

		.info-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 3px 0;
			border-bottom: 1px solid rgba(0, 0, 0, 0.08);
			transition: all 0.2s ease;

			&:last-child {
				border-bottom: none;
			}

			&:hover {
				background: var(--im-background-active);
				border-radius: 6px;
				padding: 3px 8px;
				margin: 0 -8px;
			}

			.info-label {
				display: flex;
				align-items: center;
				gap: 6px;
				font-weight: 500;
				color: var(--im-text-color-primary);
				font-size: var(--im-font-size);
				flex-shrink: 0;
				width: 120px;
			}

			.info-content {
				flex: 1;
				margin-left: 12px;

				.info-display {
					display: flex;
					align-items: center;
					justify-content: flex-start;
					padding: 3px;
					cursor: pointer;
					transition: all 0.2s ease;
					min-height: 32px;
					border-radius: 8px;

					&:hover {
						background: var(--im-background-active);
					}

					span {
						font-size: var(--im-font-size);
						color: var(--im-text-color-light);
						text-align: left;
						word-break: break-all;

						&.info-placeholder {
							color: var(--im-text-color-light);
							font-style: italic;
						}
					}
				}
			}
		}
	}

	.notice-section {
		margin-bottom: 12px;
		@extend %card-style;

		.notice-header {
			display: flex;
			align-items: center;
			gap: 6px;
			margin-bottom: 8px;
			font-weight: 500;
			color: var(--im-text-color-primary);
			font-size: var(--im-font-size);
		}

		.notice-content {

			.notice-display {
				min-height: 40px;
				padding: 10px;
				border-radius: 10px;
				cursor: pointer;
				transition: all 0.2s ease;
				position: relative;
				font-style: italic;
				background: var(--im-background-active);

				&:hover {
					transform: translateY(-2px);
				}

				.notice-text {
					font-size: var(--im-font-size-small);
					color: var(--im-text-color-light);
					line-height: 1.4;
					word-break: break-word;
					text-align: left;
				}

				.notice-placeholder {
					font-size: var(--im-font-size-small);
					color: var(--im-text-color-light);
					line-height: 1.4;
					text-align: left;
				}
			}
		}
	}

	// 群公告弹窗样式
	.notice-dialog-content {
		padding: 10px 0;

		.el-textarea {
			.el-textarea__inner {
				font-size: 14px;
				padding: 12px;
				border-radius: 6px;
				border: 1px solid rgba(0, 0, 0, 0.1);
				transition: all 0.3s ease;
				min-height: 120px;
				resize: vertical;
				line-height: 1.5;

				&:focus {
					border-color: var(--im-color-primary);
					box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
				}
			}
		}
	}

	.dialog-footer {
		text-align: right;

		.el-button {
			margin-left: 10px;
		}
	}

	.btn-group {
		text-align: center;
		@extend %card-style;

		.text-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			padding: 12px 16px;
			font-size: var(--im-font-size);
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s ease;
			border-radius: 6px;
			color: var(--im-color-danger);
			background: transparent;
			border: none;
			box-sizing: border-box;
			border-bottom: 1px solid rgba(0, 0, 0, 0.08);

			&:last-child {
				border-bottom: none;
			}

			&:hover {
				background: var(--im-background-active);
			}
		}
	}

	.complaint-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		font-size: var(--im-font-size-smaller);
		color: var(--im-color-primary-light-2);
		cursor: pointer;
		margin-top: 8px;

		&:hover {
			color: var(--im-color-primary);
		}
	}
}
</style>