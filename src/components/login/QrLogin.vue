<template>
	<div class="qr-login-container">
		<div class="qr-header">
			<div class="qr-title">
				<i class="el-icon-qrcode"></i>
				<span>扫码登录</span>
			</div>
			<div class="qr-subtitle">使用手机APP扫描二维码快速登录</div>
		</div>

		<div class="qr-back-btn" @click="goBack">
			<i class="el-icon-back"></i>
		</div>

		<div class="qr-content">
			<!-- 加载状态 -->
			<div v-if="status === 'loading'" class="qr-loading">
				<div class="loading-animation">
					<div class="loading-circle"></div>
					<div class="loading-circle"></div>
					<div class="loading-circle"></div>
				</div>
				<p class="loading-text">正在生成二维码...</p>
			</div>

			<!-- 等待扫码状态 -->
			<div v-else-if="status === 'waiting'" class="qr-waiting">
				<div class="qr-image-container">
					<div class="qr-frame">
						<img :src="qrImage" alt="扫码登录" class="qr-image" />
						<div class="qr-corners">
							<div class="corner corner-tl"></div>
							<div class="corner corner-tr"></div>
							<div class="corner corner-bl"></div>
							<div class="corner corner-br"></div>
						</div>
					</div>
				</div>
				<div class="qr-info">
					<p class="qr-tip">
						<i class="el-icon-mobile-phone"></i>
						请使用手机APP扫描二维码
					</p>
					<div class="qr-expire">
						<i class="el-icon-time"></i>
						<span>二维码将在 {{ expireTime }} 秒后过期</span>
					</div>
				</div>
			</div>

			<!-- 已扫码状态 -->
			<div v-else-if="status === 'scanned'" class="qr-scanned">
				<div class="scanned-animation">
					<div class="success-icon">
						<i class="el-icon-check"></i>
					</div>
					<div class="pulse-ring"></div>
				</div>
				<p class="scanned-text">
					<i class="el-icon-mobile-phone"></i>
					已扫码，请在手机上确认登录
				</p>
			</div>

			<!-- 登录成功状态 -->
			<div v-else-if="status === 'success'" class="qr-success">
				<div class="success-animation">
					<div class="success-icon">
						<i class="el-icon-check"></i>
					</div>
				</div>
				<p class="success-text">登录成功!</p>
			</div>

			<!-- 二维码过期状态 -->
			<div v-else-if="status === 'expired'" class="qr-expired">
				<div class="qr-image-container">
					<div class="qr-frame">
						<img :src="qrImage" alt="扫码登录" class="qr-image" />
						<div class="qr-corners">
							<div class="corner corner-tl"></div>
							<div class="corner corner-tr"></div>
							<div class="corner corner-bl"></div>
							<div class="corner corner-br"></div>
						</div>
						<!-- 过期遮罩层 -->
						<div class="expired-overlay">
							<div class="expired-content">
								<p class="expired-text">二维码已过期</p>
								<div class="refresh-btn" @click="refreshQrCode">
									<i class="el-icon-refresh"></i>
									<span>重新生成</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="qr-footer">
			<div class="qr-tips">
				<i class="el-icon-info"></i>
				<span>请确保手机APP已登录</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'QrLogin',
	data() {
		return {
			// 扫码登录相关状态
			qrLoginStatus: 'loading', // loading, waiting, scanned, success, expired
			qrCode: '',
			qrImage: '',
			expireTime: 300,
			pollTimer: null,
			expireTimer: null
		};
	},
	mounted() {
		// 组件挂载时自动生成二维码
		this.generateQrCode();
	},
	beforeDestroy() {
		// 组件销毁前清理定时器
		this.stopTimers();
	},
	methods: {
		// 生成二维码
		generateQrCode() {
			this.qrLoginStatus = 'loading';
			this.$http({
				url: "/qrLogin/generate",
				method: 'post'
			}).then((data) => {
				this.qrCode = data.qrCode;
				this.qrImage = data.qrImage;
				this.expireTime = data.expiresIn;
				this.qrLoginStatus = 'waiting';
				this.startPolling();
				this.startExpireTimer();
			}).catch(() => {
				this.$message.error("生成二维码失败");
				this.$emit('back'); // 失败时返回密码登录
			});
		},
		// 开始轮询检查登录状态
		startPolling() {
			this.pollTimer = setInterval(() => {
				this.checkQrLoginStatus();
			}, 2000); // 每2秒检查一次状态
		},
		// 开始过期倒计时
		startExpireTimer() {
			this.expireTimer = setInterval(() => {
				this.expireTime--;
				if (this.expireTime <= 0) {
					this.qrLoginStatus = 'expired';
					this.stopTimers();
				}
			}, 1000);
		},
		// 检查二维码登录状态
		checkQrLoginStatus() {
			this.$http({
				url: `/qrLogin/status/${this.qrCode}`,
				method: 'get'
			}).then((data) => {
				if (data.status === 'SCANNED') {
					this.qrLoginStatus = 'scanned';
				} else if (data.status === 'CONFIRMED') {
					this.qrLoginStatus = 'success';
					this.stopTimers();
					// 保存登录信息
					sessionStorage.setItem("accessToken", data.loginInfo.accessToken);
					sessionStorage.setItem("refreshToken", data.loginInfo.refreshToken);
					this.$message.success("登录成功");
					this.$router.push("/home/chat");
				} else if (data.status === 'EXPIRED') {
					this.qrLoginStatus = 'expired';
					this.stopTimers();
				}
			}).catch((error) => {
				console.error("检查登录状态失败:", error);
			});
		},
		// 刷新二维码
		refreshQrCode() {
			this.qrLoginStatus = 'loading';
			this.generateQrCode();
		},
		// 停止所有定时器
		stopTimers() {
			if (this.pollTimer) {
				clearInterval(this.pollTimer);
				this.pollTimer = null;
			}
			if (this.expireTimer) {
				clearInterval(this.expireTimer);
				this.expireTimer = null;
			}
		},
		// 返回密码登录
		goBack() {
			this.stopTimers();
			this.$emit('back');
		}
	},
	computed: {
		// 当前状态
		status() {
			return this.qrLoginStatus;
		}
	}
}
</script>

<style scoped lang="scss">
.qr-login-container {
	width: 360px;
	height: 460px;
	padding: 25px;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(8px);
	border-radius: 3%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	position: relative;

	.qr-header {
		text-align: center;
		margin-bottom: 15px;

		.qr-title {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 24px;
			font-weight: 600;
			color: var(--im-color-primary);
			margin-bottom: 8px;

			i {
				margin-right: 8px;
				font-size: 28px;
				color: var(--im-color-primary);
			}
		}

		.qr-subtitle {
			font-size: 14px;
			color: var(--im-text-color-light);
			line-height: 1.4;
		}
	}

	.qr-back-btn {
		position: absolute;
		bottom: 20px;
		left: 20px;
		width: 40px;
		height: 40px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(40, 48, 211, 0.1);
		border: 1px solid rgba(40, 48, 211, 0.2);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 12px rgba(40, 48, 211, 0.15);
		transition: all 0.3s ease;
		z-index: 10;

		&:hover {
			background: rgba(40, 48, 211, 0.2);
			border-color: rgba(40, 48, 211, 0.3);
			transform: translateY(-2px) scale(1.05);
			box-shadow: 0 6px 20px rgba(40, 48, 211, 0.25);
		}

		&:active {
			transform: translateY(0) scale(1);
		}

		i {
			font-size: 18px;
			color: var(--im-color-primary);
			transition: all 0.3s ease;
		}
	}

	.qr-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		min-height: 280px;

		// 加载状态
		.qr-loading {
			.loading-animation {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-bottom: 20px;

				.loading-circle {
					width: 12px;
					height: 12px;
					border-radius: 50%;
					background: #409EFF;
					margin: 0 4px;
					animation: loading-bounce 1.4s ease-in-out infinite both;

					&:nth-child(1) {
						animation-delay: -0.32s;
					}

					&:nth-child(2) {
						animation-delay: -0.16s;
					}

					&:nth-child(3) {
						animation-delay: 0s;
					}
				}
			}

			.loading-text {
				color: #666;
				font-size: 16px;
			}
		}

		// 等待扫码状态
		.qr-waiting {
			.qr-image-container {
				margin-bottom: 20px;

				.qr-frame {
					position: relative;
					display: inline-block;
					padding: 15px;
					background: white;
					border-radius: 16px;
					box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

					.qr-image {
						width: 180px;
						height: 180px;
						border-radius: 8px;
						display: block;
					}

					.qr-corners {
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						pointer-events: none;

						.corner {
							position: absolute;
							width: 20px;
							height: 20px;
							border: 3px solid #409EFF;

							&.corner-tl {
								top: 0;
								left: 0;
								border-right: none;
								border-bottom: none;
								border-top-left-radius: 8px;
							}

							&.corner-tr {
								top: 0;
								right: 0;
								border-left: none;
								border-bottom: none;
								border-top-right-radius: 8px;
							}

							&.corner-bl {
								bottom: 0;
								left: 0;
								border-right: none;
								border-top: none;
								border-bottom-left-radius: 8px;
							}

							&.corner-br {
								bottom: 0;
								right: 0;
								border-left: none;
								border-top: none;
								border-bottom-right-radius: 8px;
							}
						}
					}
				}
			}

			.qr-info {
				.qr-tip {
					font-size: 15px;
					color: var(--im-text-color);
					margin: 0 0 10px 0;
					display: flex;
					align-items: center;
					justify-content: center;

					i {
						margin-right: 8px;
						color: var(--im-color-primary);
					}
				}

				.qr-expire {
					font-size: 13px;
					color: var(--im-text-color-light);
					display: flex;
					align-items: center;
					justify-content: center;

					i {
						margin-right: 6px;
						color: var(--im-color-warning);
					}
				}
			}
		}

		// 已扫码状态
		.qr-scanned {
			.scanned-animation {
				position: relative;
				margin-bottom: 40px;
				display: flex;
				align-items: center;
				justify-content: center;

				.success-icon {
					width: 50px;
					height: 50px;
					background: var(--im-color-primary-light-1);
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					color: white;
					font-size: 24px;
				}

				.pulse-ring {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 60px;
					height: 60px;
					border: 2px solid var(--im-color-primary-light-1);
					border-radius: 50%;
					animation: pulse 2s infinite;
				}
			}

			.scanned-text {
				color: var(--im-color-primary);
				font-size: var(--im-font-size-large);
				display: flex;
				align-items: center;
				justify-content: center;

				i {
					margin-right: 8px;
				}
			}
		}

		// 登录成功状态
		.qr-success {
			.success-animation {
				position: relative;
				margin-bottom: 20px;
				display: flex;
				align-items: center;
				justify-content: center;

				.success-icon {
					width: 50px;
					height: 50px;
					background: var(--im-color-primary-light-1);
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					color: white;
					font-size: 24px;
				}
			}

			.success-text {
				color: var(--im-color-primary-light-1);
				font-size: 18px;
				font-weight: 600;
				display: flex;
				align-items: center;
				justify-content: center;

				i {
					margin-right: 8px;
				}
			}
		}

		// 二维码过期状态
		.qr-expired {
			.qr-image-container {
				margin-bottom: 20px;

				.qr-frame {
					position: relative;
					display: inline-block;
					padding: 15px;
					background: white;
					border-radius: 16px;
					box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

					.qr-image {
						width: 180px;
						height: 180px;
						border-radius: 8px;
						display: block;
						filter: grayscale(0.3);
						opacity: 0.6;
					}

					.qr-corners {
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						pointer-events: none;

						.corner {
							position: absolute;
							width: 20px;
							height: 20px;
							border: 3px solid rgba(245, 108, 108, 0.6);

							&.corner-tl {
								top: 0;
								left: 0;
								border-right: none;
								border-bottom: none;
								border-top-left-radius: 8px;
							}

							&.corner-tr {
								top: 0;
								right: 0;
								border-left: none;
								border-bottom: none;
								border-top-right-radius: 8px;
							}

							&.corner-bl {
								bottom: 0;
								left: 0;
								border-right: none;
								border-top: none;
								border-bottom-left-radius: 8px;
							}

							&.corner-br {
								bottom: 0;
								right: 0;
								border-left: none;
								border-top: none;
								border-bottom-right-radius: 8px;
							}
						}
					}

					.expired-overlay {
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						background: rgba(0, 0, 0, 0.7);
						border-radius: 5px;
						display: flex;
						align-items: center;
						justify-content: center;
						backdrop-filter: blur(2px);

						.expired-content {
							text-align: center;
							color: white;


							.expired-text {
								color: white;
								font-size: 14px;
								margin-bottom: 16px;
								font-weight: 500;
							}

							.refresh-btn {
								display: inline-flex;
								align-items: center;
								padding: 8px 16px;
								background: rgba(255, 255, 255, 0.9);
								color: var(--im-color-primary);
								border-radius: 20px;
								cursor: pointer;
								font-size: 13px;
								font-weight: 500;
								transition: all 0.3s ease;
								backdrop-filter: blur(10px);
								box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

								&:hover {
									background: rgba(255, 255, 255, 1);
									transform: translateY(-1px);
									box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
								}

								&:active {
									transform: translateY(0);
								}

								i {
									margin-right: 6px;
									font-size: 14px;
								}

								span {
									font-size: 13px;
								}
							}
						}
					}
				}
			}
		}
	}

	.qr-footer {
		margin-top: 20px;
		text-align: center;

		.qr-tips {
			font-size: 12px;
			color: var(--im-text-color-light);
			display: flex;
			align-items: center;
			justify-content: center;

			i {
				margin-right: 4px;
				color: var(--im-color-primary);
			}
		}
	}
}

// 动画定义
@keyframes loading-bounce {

	0%,
	80%,
	100% {
		transform: scale(0);
	}

	40% {
		transform: scale(1);
	}
}

@keyframes pulse {
	0% {
		transform: translate(-50%, -50%) scale(1);
		opacity: 1;
	}

	100% {
		transform: translate(-50%, -50%) scale(1.5);
		opacity: 0;
	}
}

@keyframes success-ring {
	0% {
		transform: scale(0);
		opacity: 1;
	}

	100% {
		transform: scale(1);
		opacity: 0;
	}
}
</style>
