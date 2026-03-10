<template>
	<div class="rtc-group-acceptor">
		<div class="acceptor-container">
			<div class="avatar-section">
				<div class="avatar-container">
					<head-image 
						v-if="inviter" 
						:name="inviter.nickName" 
						:url="inviter.headImage" 
						:size="80"
						radius="50%"
					></head-image>
					<div class="avatar-pulse"></div>
				</div>
			</div>
			
			<div class="info-section">
				<div class="caller-name">{{ inviter ? inviter.nickName : '未知用户' }}</div>
				<div class="call-status">邀请您加入多人通话</div>
			</div>
			
			<div class="participants-section" v-if="otherUsers.length > 0">
				<div class="participants-title">参与通话的还有:</div>
				<div class="participants-list">
					<div class="participant-item" v-for="user in otherUsers" :key="user.id">
						<head-image 
							:url="user.headImage" 
							:name="user.nickName" 
							:size="32"
							radius="50%"
						></head-image>
					</div>
				</div>
			</div>
			
			<div class="button-section">
				<div class="action-buttons">
					<div class="action-btn accept-btn iconfont icon-phone-accept" @click="$emit('accept')" title="接受">
					</div>
					<div class="action-btn reject-btn iconfont icon-phone-reject" @click="$emit('reject')" title="拒绝">
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import HeadImage from '../common/HeadImage.vue';

export default {
	name: "rtcGroupAcceptor",
	components: {
		HeadImage
	},
	props: {
		groupId: {
			type: Number
		},
		inviterId: {
			type: Number
		},
		userInfos: {
			type: Array
		}
	},
	computed: {
		inviter() {
			return this.userInfos.find(user => user.id == this.inviterId);
		},
		otherUsers() {
			return this.userInfos.filter(user => user.id != this.inviterId);
		}
	}
}
</script>

<style scoped lang="scss">
.rtc-group-acceptor {
	position: fixed;
	bottom: 0;
	right: 0;
	z-index: 10000;
	width: 320px;

	.acceptor-container {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 20px;
		padding: 30px 25px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.2);
		text-align: center;

		.avatar-section {
			margin-bottom: 25px;

			.avatar-container {
				position: relative;
				display: inline-block;

				.avatar-pulse {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 100px;
					height: 100px;
					border-radius: 50%;
					background: rgba(76, 175, 80, 0.2);
					animation: pulse-ring 2s infinite;

					&::before {
						content: '';
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						width: 120px;
						height: 120px;
						border-radius: 50%;
						background: rgba(76, 175, 80, 0.1);
						animation: pulse-ring 2s infinite 0.5s;
					}
				}
			}
		}

		.info-section {
			margin-bottom: 20px;

			.caller-name {
				font-size: 22px;
				font-weight: 700;
				color: var(--im-text-color-primary);
				margin-bottom: 8px;
			}

			.call-status {
				font-size: 14px;
				color: var(--im-text-color-light);
				font-weight: 500;
			}
		}

		.participants-section {
			margin-bottom: 25px;

			.participants-title {
				font-size: 14px;
				color: var(--im-text-color-light);
				margin-bottom: 12px;
				font-weight: 500;
			}

			.participants-list {
				display: flex;
				justify-content: center;
				flex-wrap: wrap;
				gap: 8px;
				max-height: 60px;
				overflow: hidden;

				.participant-item {
					position: relative;
					cursor: pointer;
					transition: all 0.2s ease;

					&:hover {
						transform: scale(1.1);
						z-index: 10;
					}
				}
			}
		}

		.button-section {
			.action-buttons {
				display: flex;
				justify-content: center;
				gap: 50px;

				.action-btn {
					border-radius: 50%;
					cursor: pointer;
					transition: all 0.3s ease;
					font-size: 60px;

					&:hover {
						transform: scale(1.1);
						box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
					}

					&.reject-btn {
						color: var(--im-color-danger);
					}

					&.accept-btn {
						color: var(--im-color-success);
						animation: accept-pulse 1.5s infinite;
					}
				}
			}
		}
	}
}

@keyframes pulse-ring {
	0% {
		transform: translate(-50%, -50%) scale(1);
		opacity: 1;
	}
	100% {
		transform: translate(-50%, -50%) scale(1.3);
		opacity: 0;
	}
}

@keyframes accept-pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
	}
	70% {
		box-shadow: 0 0 0 20px rgba(76, 175, 80, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
	}
}
</style>
