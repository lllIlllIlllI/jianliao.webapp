<template>
	<div class="chat-message-item" :class="active ? 'active' : ''">
		<div class="message-tip" v-if="msgInfo.type == $enums.MESSAGE_TYPE.TIP_TEXT">
			{{ msgInfo.content }}
		</div>
		<div class="message-tip" v-else-if="msgInfo.type == $enums.MESSAGE_TYPE.TIP_TIME">
			{{ $date.toTimeText(msgInfo.sendTime) }}
		</div>
		<div class="message-normal " v-else-if="isNormal" :class="{ 'message-mine': mine }">
			<div class="avatar">
				<head-image :name="showName" :size="38" :url="headImage" :id="msgInfo.sendId"></head-image>
			</div>
			<div class="content">
				<div v-if="msgInfo.groupId && !msgInfo.selfSend" class="top">
					<div class="show-name">{{ showName }}</div>
					<el-tag v-if="isGroupOwner(msgInfo.sendId)" size="mini" type="danger">群主</el-tag>
					<el-tag v-if="isGroupManager(msgInfo.sendId)" size="mini" type="primary">管理员</el-tag>
				</div>
				<div class="bottom" :class="{ fullscreen: configStore.fullScreen }"
					@contextmenu.prevent="showMessageMenu($event)">
					<div ref="chatMsgBox" class="message-content-wrapper">
						<div class="message-text" v-if="isTextMessage" v-html="htmlText">
						</div>
						<div class="message-image" v-else-if="msgInfo.type == $enums.MESSAGE_TYPE.IMAGE"
							@click="showFullImageBox()">
							<div class="image-container" :style="imageStyle">
								<img class="send-image" :src="contentData.thumbUrl" loading="lazy" />
								<div class="image-overlay">
									<i class="el-icon-zoom-in"></i>
								</div>
							</div>
						</div>
						<div class="message-video" v-else-if="msgInfo.type == $enums.MESSAGE_TYPE.VIDEO">
							<video class="send-video" :style="imageStyle" controls preload="none"
								:poster="contentData.coverUrl" :src="contentData.videoUrl" />
						</div>
						<div class="message-file" v-else-if="msgInfo.type == $enums.MESSAGE_TYPE.FILE">
							<div class="file-box" v-loading="sending">
								<div class="file-info">
									<el-link class="file-name" :underline="true" target="_blank" type="primary"
										:href="contentData.url" :download="contentData.name">{{ contentData.name
										}}</el-link>
									<div class="file-size">{{ fileSize }}</div>
								</div>
								<div class="file-icon">
									<span type="primary" class="el-icon-document"></span>
								</div>
							</div>
						</div>
						<div class="message-sticker" v-else-if="msgInfo.type == $enums.MESSAGE_TYPE.STICKER">
							<img :style="stickerStyle" :src="contentData.imageUrl" loading="lazy" />
						</div>
						<div class="message-voice" v-else-if="msgInfo.type == $enums.MESSAGE_TYPE.AUDIO"
							@click="onPlayVoice()">
							<audio controls :src="contentData.url"></audio>
						</div>
						<chat-user-card v-else-if="msgInfo.type == $enums.MESSAGE_TYPE.USER_CARD"
							:cardInfo="contentData"></chat-user-card>
						<chat-group-card v-else-if="msgInfo.type == $enums.MESSAGE_TYPE.GROUP_CARD"
							:cardInfo="contentData" :sendTime="msgInfo.sendTime"></chat-group-card>
						<div class="chat-action message-text" v-else-if="isAction">
							<span v-if="msgInfo.type == $enums.MESSAGE_TYPE.ACT_RT_VOICE" title="重新呼叫"
								@click="$emit('call')" class="iconfont icon-chat-voice"></span>
							<span v-if="msgInfo.type == $enums.MESSAGE_TYPE.ACT_RT_VIDEO" title="重新呼叫"
								@click="$emit('call')" class="iconfont icon-chat-video"></span>
							<span>{{ msgInfo.content }}</span>
						</div>
						<div v-else class="message-text">[暂不支持该消息类型]</div>
						<div title="发送中" v-if="sending" class="sending" v-loading="sending"></div>
						<div title="发送失败" v-else-if="sendFail" @click="onSendFail" class="send-fail el-icon-warning">
						</div>
					</div>
					<div class="quote-message" v-if="msgInfo.quoteMessage"
						@contextmenu.prevent.stop="showQuoteMenu($event)">
						<chat-quote-message :msgInfo="msgInfo.quoteMessage"
							@click.native.stop="$emit('locateQuote', msgInfo)"
							:showName="quoteShowName"></chat-quote-message>
					</div>
					<div class="message-status" v-if="!isAction && msgInfo.selfSend && !isGroupMessage">
						<span class="chat-readed" v-if="msgInfo.status == $enums.MESSAGE_STATUS.READED">已读</span>
						<span class="chat-unread" v-else>未读</span>
					</div>
					<div class="chat-receipt" v-if="msgInfo.receipt" @click="onShowReadedBox">
						<span v-if="msgInfo.receiptOk" class="icon iconfont icon-ok" title="全体已读"></span>
						<span v-else>{{ msgInfo.readedCount }}人已读</span>
					</div>
				</div>
			</div>
		</div>
		<right-menu ref="rightMenu" @select="onSelectMenu"></right-menu>
		<chat-group-readed ref="chatGroupReadedBox" :msgInfo="msgInfo" :group="group"
			:groupMembers="groupMembers"></chat-group-readed>
	</div>
</template>

<script>
import HeadImage from "../common/HeadImage.vue";
import RightMenu from '../common/RightMenu.vue';
import ChatGroupReaded from './ChatGroupReaded.vue';
import ChatQuoteMessage from "./ChatQuoteMessage.vue";
import ChatUserCard from "./ChatUserCard.vue";
import ChatGroupCard from "./ChatGroupCard.vue";
export default {
	name: "messageItem",
	components: {
		HeadImage,
		RightMenu,
		ChatGroupReaded,
		ChatQuoteMessage,
		ChatUserCard,
		ChatGroupCard
	},
	props: {
		mode: {
			type: Number,
			default: 1
		},
		active: {
			type: Boolean,
			default: false
		},
		mine: {
			type: Boolean,
			required: true
		},
		headImage: {
			type: String,
			default: ''
		},
		showName: {
			type: String,
			required: true
		},
		quoteShowName: {
			type: String,
			default: ''
		},
		msgInfo: {
			type: Object,
			required: true
		},
		group: {
			type: Object,
		},
		groupMembers: {
			type: Array
		}
	},
	data() {
		return {}
	},
	methods: {
		onSendFail() {
			this.$emit("resend", this.msgInfo);
		},
		showFullImageBox() {
			let imageUrl = this.contentData.originUrl;
			if (imageUrl) {
				this.$eventBus.$emit("openFullImage", imageUrl);
			}
		},
		onPlayVoice() {
			if (!this.audio) {
				this.audio = new Audio();
			}
			this.audio.src = this.contentData.url;
			this.audio.play();
			this.onPlayVoice = 'RUNNING';
		},
		showMessageMenu(e) {
			let menuItems = [];
			if (this.isTextMessage) {
				menuItems.push({
					key: 'COPY',
					name: '复制'
				});
			}
			menuItems.push({
				key: 'DELETE',
				name: '删除'
			});
			if (this.msgInfo.id) {
				if (this.isOwner || this.isManager || this.msgInfo.selfSend) {
					menuItems.push({
						key: 'RECALL',
						name: '撤回'
					});
				}
				if (this.$msgType.isNormal(this.msgInfo.type)) {
					menuItems.push({
						key: 'QUOTE',
						name: '引用'
					});
					menuItems.push({
						key: 'FORWARD',
						name: '转发'
					});
				}
				if ((this.isOwner || this.isManager) && this.$msgType.isNormal(this.msgInfo.type)) {
					menuItems.push({
						key: 'TOP',
						name: '置顶'
					});
				}
			}
			this.$refs.rightMenu.open(e, menuItems);
		},
		showQuoteMenu(e) {
			let menuItems = [];
			if (this.msgInfo.quoteMessage &&
				this.msgInfo.quoteMessage.status != this.$enums.MESSAGE_STATUS.RECALL) {
				menuItems.push({
					key: 'LOCATE_QUOTE',
					name: '定位到原消息'
				});
			}
			this.$refs.rightMenu.open(e, menuItems);
		},
		onSelectMenu(item) {
			// 菜单id转驼峰作为事件key
			let eventKey = item.key.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
			this.$emit(eventKey, this.msgInfo);
		},
		onShowReadedBox() {
			let rect = this.$refs.chatMsgBox.getBoundingClientRect();
			this.$refs.chatGroupReadedBox.open(rect);
		},
		isGroupOwner(userId) {
			return this.group.ownerId == userId;
		},
		isGroupManager(userId) {
			let m = this.groupMembers.find(m => m.userId == userId);
			return m && m.isManager
		}
	},
	computed: {
		sending() {
			return this.msgInfo.status == this.$enums.MESSAGE_STATUS.SENDING;
		},
		sendFail() {
			return this.msgInfo.status == this.$enums.MESSAGE_STATUS.FAILED;
		},
		contentData() {
			return JSON.parse(this.msgInfo.content)
		},
		fileSize() {
			let size = this.contentData.size;
			if (size > 1024 * 1024) {
				return Math.round(size / 1024 / 1024) + "M";
			}
			if (size > 1024) {
				return Math.round(size / 1024) + "KB";
			}
			return size + "B";
		},
		isTextMessage() {
			return this.msgInfo.type == this.$enums.MESSAGE_TYPE.TEXT
		},
		isAction() {
			return this.$msgType.isAction(this.msgInfo.type);
		},
		isNormal() {
			const type = this.msgInfo.type;
			return this.$msgType.isNormal(type) || this.$msgType.isAction(type)
		},
		isOwner() {
			let userId = this.userStore.userInfo.id;
			return this.group && userId == this.group.ownerId
		},
		isManager() {
			let userId = this.userStore.userInfo.id;
			let m = this.groupMembers.find((m) => m.userId == userId);
			return m && m.isManager;
		},
		htmlText() {
			let color = this.msgInfo.selfSend ? 'white' : '';
			let text = this.$str.html2Escape(this.msgInfo.content)
			text = this.$url.replaceURLWithHTMLLinks(text, color)
			return this.$emo.transform(text, 'emoji-normal')
		},
		isGroupMessage() {
			return !!this.msgInfo.groupId;
		},
		imageStyle() {
			// 计算图片的显示宽高，要求：任意边不能高于360px,不能低于60px,不能拉伸图片比例
			let maxSize = this.configStore.fullScreen ? 360 : 240;
			let minSize = 60;
			let width = this.contentData.width;
			let height = this.contentData.height;
			if (width && height) {
				let ratio = Math.min(width, height) / Math.max(width, height);
				let w = Math.max(Math.min(width > height ? maxSize : ratio * maxSize, width), minSize);
				let h = Math.max(Math.min(width > height ? ratio * maxSize : maxSize, height), minSize);
				return `width: ${w}px;height:${h}px;object-fit: cover;`
			} else {
				// 兼容历史版本，历史数据没有记录宽高
				return `max-width: ${maxSize}px;min-width:60px;max-height: ${maxSize}px;min-height:60px;`
			}
		},
		stickerStyle() {
			// 计算图片的显示宽高，要求：任意边不能高于180px,不能低于60px,不能拉伸图片比例
			let maxSize = 180;
			let minSize = 60;
			let width = this.contentData.width;
			let height = this.contentData.height;
			if (width && height) {
				let ratio = Math.min(width, height) / Math.max(width, height);
				let w = Math.max(Math.min(width > height ? maxSize : ratio * maxSize, width), minSize);
				let h = Math.max(Math.min(width > height ? ratio * maxSize : maxSize, height), minSize);
				return `width: ${w}px;height:${h}px;object-fit: cover;`
			} else {
				// 兼容历史版本，历史数据没有记录宽高
				return `max-width: ${maxSize}px;min-width:60px;max-height: ${maxSize}px;min-height:60px;`
			}
		}
	}
}
</script>

<style lang="scss">
.chat-message-item {
	padding: 3px 10px;
	border-radius: 10px;

	&.active {
		background: var(--im-background-active-dark);
	}

	.message-tip {
		line-height: 50px;
		font-size: var(--im-font-size-small);
		color: var(--im-text-color-light);
		word-break: break-word;
	}

	.message-normal {
		position: relative;
		font-size: 0;
		padding-left: 53px;
		min-height: 50px;
		margin: 5px 0;

		.avatar {
			position: absolute;
			width: 40px;
			height: 40px;
			top: 0;
			left: 0;
		}

		.content {
			text-align: left;

			.top {
				display: flex;
				flex-wrap: nowrap;
				align-items: center;

				.show-name {
					white-space: nowrap;
					max-width: 400px;
					overflow: hidden;
					line-height: 18px;
					font-size: var(--im-font-size-small);
					color: #888;
				}
			}

			.bottom {
				display: inline-block;
				padding-right: 30px;
				margin-top: 2px;

				&.fullscreen {
					padding-right: 240px;
				}

				.message-content-wrapper {
					position: relative;
					display: inline-flex;
					align-items: flex-end;

					.sending {
						width: 25px;
						height: 25px;

						.circular {
							width: 25px;
							height: 25px;
						}
					}

					.send-fail {
						color: #e45050;
						font-size: 25px;
						cursor: pointer;
						margin: 0 5px;
					}
				}

				.message-text {
					flex: 1;
					display: inline-block;
					position: relative;
					line-height: 26px;
					padding: 6px 10px;
					background: var(--im-background);
					border-radius: 10px;
					font-size: var(--im-font-size);
					text-align: left;
					white-space: pre-wrap;
					word-break: break-word;
				}

				.message-image {
					border-radius: 12px;
					overflow: hidden;
					cursor: pointer;
					background: var(--im-background);
					box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
					transition: all 0.3s ease;
					position: relative;

					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
					}

					.image-container {
						position: relative;
						width: 100%;
						height: 100%;
						overflow: hidden;
						border-radius: 12px;

						.send-image {
							width: 100%;
							height: 100%;
							object-fit: cover;
							transition: transform 0.3s ease;
						}

						.image-overlay {
							position: absolute;
							top: 0;
							left: 0;
							right: 0;
							bottom: 0;
							background: rgba(0, 0, 0, 0.3);
							display: flex;
							align-items: center;
							justify-content: center;
							opacity: 0;
							transition: opacity 0.3s ease;

							i {
								color: white;
								font-size: 24px;
							}
						}


						&:hover {
							.send-image {
								transform: scale(1.05);
							}

							.image-overlay {
								opacity: 1;
							}
						}
					}
				}

				.message-sticker {
					overflow: hidden;
					position: relative;
				}

				.message-video {
					border-radius: 12px;
					overflow: hidden;
					background: var(--im-background);
					box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
					transition: all 0.3s ease;

					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
					}

					.send-video {
						width: 100%;
						height: 100%;
						object-fit: cover;
						transition: transform 0.3s ease;
					}

					&:hover .send-video {
						transform: scale(1.02);
					}
				}

				.message-file {
					display: flex;
					flex-wrap: nowrap;
					flex-direction: row;
					align-items: center;
					cursor: pointer;
					margin-bottom: 2px;
					background: var(--im-background);

					.file-box {
						display: flex;
						flex-wrap: nowrap;
						align-items: center;
						min-height: 60px;
						box-shadow: var(--im-box-shadow-light);
						border-radius: 8px;
						padding: 10px 15px;
						border: 2px solid #eee;

						transition: all 0.3s ease;
						background: white;

						&:hover {
							transform: translateY(-2px);
							box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
						}

						.file-info {
							flex: 1;
							height: 100%;
							text-align: left;
							font-size: 14px;
							margin-right: 10px;

							.file-name {
								display: inline-block;
								min-width: 160px;
								max-width: 200px;
								font-size: 14px;
								margin-bottom: 4px;
								white-space: pre-wrap;
								word-break: break-all;
							}

							.file-size {
								font-size: var(--im-font-size-smaller);
								color: var(--im-text-color-light);
							}
						}

						.file-icon {
							font-size: 44px;
							color: #d42e07;
							transition: transform 0.3s ease;
						}

						&:hover .file-icon {
							transform: scale(1.1);
						}
					}
				}

				.message-voice {
					audio {
						height: 46px;
						cursor: pointer;
						border: 1px solid rgba(0, 0, 0, 0.08);
						border-radius: 23px;
						box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
						transition: all 0.3s ease;

						&:hover {
							transform: translateY(-1px);
							box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
						}
					}
				}

				.chat-action {
					display: flex;
					align-items: center;

					.iconfont {
						cursor: pointer;
						font-size: 22px;
						padding-right: 8px;
					}
				}

				.quote-message {
					display: block;
					margin-top: 3px;
					cursor: pointer;
				}

				.message-status {
					margin-top: 3px;
					display: block;
					font-size: 11px;

					.chat-readed {
						color: var(--im-text-color-light);
					}

					.chat-unread {
						color: var(--im-color-danger);
					}
				}

				.chat-receipt {
					font-size: var(--im-font-size-smaller);
					cursor: pointer;
					color: var(--im-text-color-light);

					.icon-ok {
						font-size: 20px;
						color: var(--im-color-success);
					}
				}

				.chat-at-user {
					padding: 2px 5px;
					border-radius: 3px;
					cursor: pointer;
				}
			}
		}

		&.message-mine {
			text-align: right;
			padding-left: 0;
			padding-right: 53px;

			.avatar {
				left: auto;
				right: 0;
			}

			.content {
				text-align: right;

				.top {
					flex-direction: row-reverse;
				}

				.bottom {
					padding-left: 30px;
					padding-right: 0;

					&.fullscreen {
						padding-left: 240px;
					}

					.message-content-wrapper {
						flex-direction: row-reverse;
					}

					.message-text {
						background-color: var(--im-color-primary-light-2);
						color: #fff;
					}

					.chat-action {
						flex-direction: row-reverse;

						.iconfont {
							transform: rotateY(180deg);
						}
					}
				}
			}
		}
	}
}
</style>