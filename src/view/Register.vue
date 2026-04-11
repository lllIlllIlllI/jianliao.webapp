<template>
	<el-container class="register" :class="configStore.electronMode ? 'white-backgroup' : ''">
		<div class="decoration decoration-1"></div>
		<div class="decoration decoration-2"></div>
		<div class="decoration decoration-3"></div>
		<div class="content">
			<el-form :model="dataForm" status-icon :rules="rules" ref="registerForm" class="form">
				<div class="title">
					<div>{{ modeNameMap[dataForm.mode] }}</div>
				</div>
				<el-form-item prop="inviteCode">
					<el-input v-model="dataForm.inviteCode" placeholder="邀请码" prefix-icon="el-icon-key"
						maxlength="50"></el-input>
				</el-form-item>
				<el-form-item v-if="dataForm.mode == 'phone'" prop="phone">
					<el-input v-model="dataForm.phone" placeholder="手机号码" prefix-icon="el-icon-mobile-phone"
						maxlength="20"></el-input>
				</el-form-item>
				<el-form-item v-show="dataForm.mode == 'phone'" prop="code">
					<div class="send-code-bar">
						<el-input class="input" v-model="dataForm.code" placeholder="短信验证码" maxlength="6"
							prefix-icon="el-icon-key"></el-input>
						<div class="lock-text" v-if="phoneLockTime > 0">{{ `${phoneLockTime}秒后重新获取` }}</div>
						<el-button v-else class="code-btn" type="primary" plain size="mini"
							@click="onSendSmsCode">获取验证码</el-button>
					</div>
				</el-form-item>
				<el-form-item v-if="dataForm.mode == 'email'" prop="email">
					<el-input v-model="dataForm.email" placeholder="邮箱" prefix-icon="el-icon-message"
						maxlength="20"></el-input>
				</el-form-item>
				<el-form-item v-show="dataForm.mode == 'email'" prop="code">
					<div class="send-code-bar">
						<el-input class="input" v-model="dataForm.code" placeholder="邮件验证码" maxlength="6"
							prefix-icon="el-icon-key"></el-input>
						<div class="lock-text" v-if="emailLockTime > 0">{{ `${emailLockTime}秒后重新获取` }}</div>
						<el-button v-else class="code-btn" type="primary" plain
							@click="onSendMailCode">获取验证码</el-button>
					</div>
				</el-form-item>
				<el-form-item prop="userName">
					<el-input v-model="dataForm.userName" maxlength="20" placeholder="用户名" show-word-limit
						prefix-icon="el-icon-user"></el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input :type="isShowPwd ? 'text' : 'password'" v-model="dataForm.password" maxlength="20"
						placeholder="密码" prefix-icon="el-icon-lock">
						<template #suffix>
							<i :class="isShowPwd ? 'icon-pwd-show' : 'icon-pwd-hide'" @click="switchPassword"
								class="iconfont password-switch-icon"></i>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item prop="confirmPassword">
					<el-input :type="isShowConfirmPwd ? 'text' : 'password'" v-model="dataForm.confirmPassword"
						maxlength="20" placeholder="确认密码" prefix-icon="el-icon-lock">
						<template #suffix>
							<i :class="isShowConfirmPwd ? 'icon-pwd-show' : 'icon-pwd-hide'"
								@click="switchConfirmPassword" class="iconfont password-switch-icon"></i>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item>
					<el-button class="submit-btn" type="primary" @click="submitForm()">注册</el-button>
				</el-form-item>
				<div class="to-login">
					<router-link to="/login">已有账号? 去登录</router-link>
				</div>
			</el-form>
			<el-divider class="custom-divider">其他注册方式</el-divider>
			<div class="other-mode">
				<div v-for="(mode) in config.mode" :key="mode">
					<div class="reg-mode" :class="mode == dataForm.mode ? 'active' : ''" @click="switchMode(mode)">
						<span class="icon iconfont " :class="'icon-' + mode"></span>
						<span class="mode-text">{{ modeNameMap[mode] }}</span>
					</div>
				</div>
			</div>
		</div>
		<icp></icp>
		<captcha-image ref="captchaRef"></captcha-image>
	</el-container>
</template>

<script>
import CaptchaImage from '../components/common/CaptchaImage.vue';
import Icp from '../components/common/Icp.vue'

export default {
	name: "login",
	components: {
		Icp,
		CaptchaImage
	},
	data() {
		var checkInviteCode = (rule, value, callback) => {
			if (!value) {
				return callback(new Error('请输入邀请码'));
			}
			callback();
		};
		var checkPhone = (rule, value, callback) => {
			if (!value) {
				return callback(new Error('请输入手机号码'));
			}
			const regex = /^1[3-9]\d{9}$/;
			if (!regex.test(value)) {
				return callback(new Error('手机号格式错误'));
			}
			callback();
		};
		var checkEmail = (rule, value, callback) => {
			if (!value) {
				return callback(new Error('请输入邮箱'));
			}
			const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			if (!regex.test(value)) {
				return callback(new Error('邮箱格式错误'));
			}
			callback();
		};
		var checkUserName = (rule, value, callback) => {
			if (!value) {
				return callback(new Error('请输入用户名'));
			}
			callback();
		};
		var checkPassword = (rule, value, callback) => {
			if (value === '') {
				return callback(new Error('请输入密码'));
			}
			callback();
		};
		var checkConfirmPassword = (rule, value, callback) => {
			if (value === '') {
				return callback(new Error('请输入密码'));
			}
			if (value != this.dataForm.password) {
				return callback(new Error('两次密码输入不一致'));
			}
			callback();
		};
		return {
			dataForm: {
				phone: '',
				email: '',
				code: '',
				mode: 'username',
				userName: '',
				password: '',
				confirmPassword: '',
				inviteCode: ''
			},
			// 密码显示状态
			isShowPwd: false,
			isShowConfirmPwd: false,
			rules: {
				inviteCode: [{
					validator: checkInviteCode,
					trigger: 'blur'
				}],
				phone: [{
					validator: checkPhone,
					trigger: 'submit'
				}],
				email: [{
					validator: checkEmail,
					trigger: 'submit'
				}],
				userName: [{
					validator: checkUserName,
					trigger: 'submit'
				}],
				password: [{
					validator: checkPassword,
					trigger: 'submit'
				}],
				confirmPassword: [{
					validator: checkConfirmPassword,
					trigger: 'submit'
				}]
			},
			showCaptchaImage: false,
			phoneLockTime: 0,
			phoneLockTimer: null,
			emailLockTime: 0,
			emailLockTimer: null,
			modeNameMap: {
				username: "用户名注册",
				phone: "手机注册",
				email: "邮箱注册"
			}
		};
	},
	methods: {
		submitForm() {
			this.$refs.registerForm.validate((valid) => {
				if (valid) {
					this.$http({
						url: "/register",
						method: 'post',
						data: this.dataForm
					}).then(() => {
						this.$message.success("注册成功!");
						// 注册成功，清除缓存中的邀请码
						localStorage.removeItem('inviteCode');
					})
				}
			});
		},
		onSendSmsCode() {
			this.$refs.registerForm.validateField('phone', (valid) => {
				if (valid == '') {
					// 发短信前先验证验证码，防止盗刷
					this.$refs.captchaRef.open((id, code) => {
						// 60s内不允许再次发送
						this.phoneLockTime = 60;
						this.phoneLockTimer && clearInterval(this.phoneLockTimer);
						this.phoneLockTimer = setInterval(() => {
							this.phoneLockTime -= 1;
							if (this.phoneLockTime <= 0) {
								this.phoneLockTimer && clearInterval(this.phoneLockTimer);
							}
						}, 1000)
						// 发送短信
						let data = {
							phone: this.dataForm.phone,
							id: id,
							code: code
						}
						this.$http({
							url: "/captcha/sms/code",
							method: 'post',
							data: data
						}).then(() => {
							this.$message.success("验证码已发送至您的手机，请注意查收")
						})
					});
				}
			})
		},
		onSendMailCode() {
			this.$refs.registerForm.validateField('email', (valid) => {
				if (valid == '') {
					// 60s内不允许再次发送
					this.emailLockTime = 60;
					this.emailLockTimer && clearInterval(this.emailLockTimer);
					this.emailLockTimer = setInterval(() => {
						this.emailLockTime -= 1;
						if (this.emailLockTime <= 0) {
							this.emailLockTimer && clearInterval(this.emailLockTimer);
						}
					}, 1000)
					// 发送短信
					let data = {
						email: this.dataForm.email,
					}
					this.$http({
						url: "/captcha/mail/code",
						method: 'post',
						data: data
					}).then(() => {
						this.$message.success("验证码已发送至您的邮箱，请注意查收")
					})

				}
			})
		},
		switchMode(mode) {
			this.dataForm.mode = mode;
			this.$refs.registerForm.resetFields();
		},
		// 切换密码显示状态
		switchPassword() {
			this.isShowPwd = !this.isShowPwd;
		},
		// 切换确认密码显示状态
		switchConfirmPassword() {
			this.isShowConfirmPwd = !this.isShowConfirmPwd;
		}
	},
	computed: {
		config() {
			return this.configStore.registration;
		},
	},
	watch: {
		config: {
			handler() {
				this.switchMode(this.config.mode[0]);
			}
		},
		'dataForm.inviteCode': {
			handler(newVal) {
				// 邀请码变化时，自动保存到缓存
				if (newVal) {
					localStorage.setItem('inviteCode', newVal);
				}
			}
		}
	},
	mounted() {
		this.configStore.loadConfig().then(() => {
			if (this.config.mode) {
				this.switchMode(this.config.mode[0]);
			}
		})
		// 从URL参数或缓存读取邀请码
		const urlCode = this.$route.query.code;
		if (urlCode) {
			// URL中有参数，使用URL参数并保存到缓存
			this.dataForm.inviteCode = urlCode;
			localStorage.setItem('inviteCode', urlCode);
		} else {
			// 从缓存读取
			const cachedCode = localStorage.getItem('inviteCode');
			if (cachedCode) {
				this.dataForm.inviteCode = cachedCode;
			}
		}
		// electron窗口大小
		window.electronAPI && window.electronAPI.sendEvent('resize', {
			width: 440,
			height: 700,
			maximizable: false
		})
	}
}
</script>

<style scoped lang="scss">
.register {
	display: flex;
	justify-content: space-around;
	align-items: center;
	width: 100%;
	height: 100%;
	background: linear-gradient(15deg, var(--im-color-primary-light-9) 0%, var(--im-color-primary-light-4) 100%);

	&.white-backgroup {
		background: white;
	}

	/* 装饰性元素 */
	.decoration {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.25);
	}

	.decoration-1 {
		width: 150px;
		height: 150px;
		background: rgba(255, 255, 255, 0.2);
		top: -150px;
		right: 0px;
		animation: float 16s infinite ease-in-out;
	}

	.decoration-2 {
		width: 200px;
		height: 200px;
		background: rgba(255, 255, 255, 0.18);
		bottom: -100px;
		left: -50px;
		animation: float 12s infinite ease-in-out;
	}

	.decoration-3 {
		width: 100px;
		height: 100px;
		background: rgba(255, 255, 255, 0.15);
		top: 50%;
		right: 50px;
		animation: float 8s infinite ease-in-out;
	}

	@keyframes float {

		0%,
		100% {
			transform: translateY(0) translateX(0);
		}

		25% {
			transform: translateY(-60px) translateX(30px);
		}

		50% {
			transform: translateY(30px) translateX(-45px);
		}

		75% {
			transform: translateY(-30px) translateX(-30px);
		}
	}

	.content {
		width: 400px;
		height: 660px;
		padding: 20px;
		background: white;
		border-radius: 3px;
		overflow: hidden;
		border-radius: 3%;

		.form {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 520px;
			justify-content: center;

			.title {
				line-height: 50px;
				margin: 10px 0 20px 0;
				font-size: 24px;
				font-weight: 700;
				color: var(--im-color-primary);
				letter-spacing: 1px;
				text-align: center;
			}

			.send-code-bar {
				display: flex;
				align-items: center;
				gap: 8px;

				.input {
					flex: 1;
					min-width: 0;
				}

				.lock-text {
					font-size: 12px;
					color: var(--im-text-color-light);
					white-space: nowrap;
					flex-shrink: 0;
				}

				.code-btn {
					height: 36px;
					border-radius: 18px;
					font-size: 13px;
					padding: 0 16px;
					background: transparent;
					color: var(--im-color-primary);
					border: 1px solid var(--im-color-primary);
					transition: all 0.2s ease;

					&:hover {
						background: var(--im-color-primary-light-2);
						color: white;
						border-color: var(--im-color-primary);
					}
				}
			}

			// 优化输入框样式
			::v-deep .el-form-item {
				margin-bottom: 20px;

				.el-input__inner {
					height: 46px;
					border-radius: 23px;
					border: 2px solid transparent;
					background: rgba(255, 255, 255, 0.9);
					box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
					transition: all 0.3s ease;
					padding-left: 50px;
					font-size: var(--im-font-size-large);

					&:focus {
						border-color: var(--im-color-primary);
						box-shadow: 0 8px 32px rgba(62, 69, 215, 0.15);
					}

					&::placeholder {
						color: var(--im-text-color-light);
						font-size: var(--im-font-size);
					}
				}

				.el-input__prefix {
					left: 15px;

					.el-input__icon {
						color: var(--im-color-primary);
						font-size: 18px;
					}
				}

				.el-input__suffix {
					right: 15px;
				}

				// 密码切换图标样式
				.password-switch-icon {
					cursor: pointer;
					color: var(--im-text-color-light);
					font-size: 18px;
					padding: 0 8px;
				}
			}
		}

		.submit-btn {
			width: 100%;
			height: 46px;
			border-radius: 23px;
			border: none;
			background: var(--im-color-primary);
			color: white;
			font-size: var(--im-font-size-large);
			font-weight: 600;
			transition: all 0.3s ease;
			letter-spacing: 5px;

			&:hover {
				background: var(--im-color-primary-light-1);
			}
		}

		.to-login {
			display: flex;
			flex-direction: row-reverse;
			line-height: 40px;
			text-align: left;
			padding-left: 20px;

			a {
				color: var(--im-text-color-light);
				text-decoration: none;
				font-size: var(--im-font-size);
				transition: all 0.3s ease;

				&:hover {
					color: var(--im-color-primary);
				}
			}
		}

		// 优化分隔线样式
		::v-deep .custom-divider {
			margin: 20px 0;

			.el-divider__text {
				color: var(--im-text-color-light);
				font-size: var(--im-font-size-small);
				font-weight: 500;
			}
		}

		.other-mode {
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 20px 10px;
			gap: 20px;

			.reg-mode {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 15px 10px;
				cursor: pointer;
				opacity: 0.7;
				transition: all 0.3s ease;
				border-radius: 15px;

				&:hover {
					opacity: 1;
				}

				.icon {
					width: 40px;
					height: 40px;
					line-height: 40px;
					text-align: center;
					color: white;
					font-size: 20px;
					border-radius: 50%;
					margin: 0 20px;
					transition: all 0.3s ease;
				}

				.icon-username {
					background: #7272da;
				}

				.icon-phone {
					background: #65af5a;
				}

				.icon-email {
					background: #e0944f;
				}

				.mode-text {
					color: var(--im-text-color-light);
					font-size: var(--im-font-size-smaller);
					margin-top: 8px;
					font-weight: 500;
				}

				&.active {
					opacity: 1;

					.icon {
						box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
					}

					.mode-text {
						font-weight: 600;
					}
				}
			}
		}
	}
}
</style>