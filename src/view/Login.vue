<template>
	<div class="login-view" :class="configStore.electronMode ? 'white-backgroup' : ''">
		<div class="decoration decoration-1"></div>
		<div class="decoration decoration-2"></div>
		<div class="decoration decoration-3"></div>
		<div class="content">
			<!-- 密码登录表单 -->
			<el-form v-if="loginMode === 'password'" class="form" :model="loginForm" status-icon :rules="rules"
				ref="loginForm" @keyup.enter.native="submitForm()" v-loading="loading" element-loading-text="正在登陆...">
				<div class="title">简聊IM</div>
				<el-form-item prop="terminal" v-show="false">
					<el-input type="terminal" v-model="loginForm.terminal"></el-input>
				</el-form-item>
				<el-form-item prop="userName">
					<el-input type="userName" v-model="loginForm.userName" :placeholder="loginNamePlaceholder"
						prefix-icon="el-icon-user"></el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input type="password" v-model="loginForm.password" placeholder="密码"
						prefix-icon="el-icon-lock"></el-input>
				</el-form-item>
				<el-form-item>
					<div class="nav-tool-bar">
						<el-checkbox v-model="isAutoLogin">下次自动登录</el-checkbox>
						<router-link v-if="containsPhoneMode || containsEmailMode" class="forgot-pwd"
							to="/password/reset">忘记密码?</router-link>
					</div>
				</el-form-item>
				<el-button class="submit-btn" type="primary" @click="submitForm()">登录</el-button>
				<div class="qr-switch-btn" type="success" @click="toggleLoginMode">
					<i class="iconfont icon-scan"></i>
					扫码登录
				</div>
				<div class="register">
					<router-link to="/register">没有账号? 立即注册</router-link>
				</div>
			</el-form>

			<!-- 扫码登录界面 -->
			<QrLogin v-if="loginMode === 'qr'" @back="goBackToPassword" />
		</div>
		<icp></icp>
		<captcha-image ref="captchaRef"></captcha-image>
	</div>

</template>

<script>
import Icp from '../components/common/Icp.vue'
import CaptchaImage from '../components/common/CaptchaImage.vue';
import QrLogin from '../components/login/QrLogin.vue';

export default {
	name: "login",
	components: {
		Icp,
		CaptchaImage,
		QrLogin
	},
	data() {
		var checkUsername = (rule, value, callback) => {
			if (!value) {
				return callback(new Error('请输入用户名'));
			}
			callback();
		};
		var checkPassword = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('请输入密码'));
			}
			callback();
		};
		return {
			loading: false,
			isAutoLogin: true,
			loginForm: {
				terminal: this.$enums.TERMINAL_TYPE.WEB,
				userName: '',
				password: ''
			},
			rules: {
				userName: [{
					validator: checkUsername,
					trigger: 'blur'
				}],
				password: [{
					validator: checkPassword,
					trigger: 'blur'
				}]
			},
			// 登录模式切换
			loginMode: 'password' // password, qr
		};
	},
	methods: {
		submitForm() {
			this.$refs.loginForm.validate((valid) => {
				if (valid) {
					this.loading = true;
					this.$http({
						url: "/login",
						method: 'post',
						data: this.loginForm
					}).then((data) => {
						localStorage.setItem('isAutoLogin', this.isAutoLogin);
						// 保存密码到
						localStorage.setItem('username', this.loginForm.userName);
						localStorage.setItem('password', this.loginForm.password);
						// localStorage
						sessionStorage.setItem("accessToken", data.accessToken);
						sessionStorage.setItem("refreshToken", data.refreshToken);
						this.$message.success("登录成功");
						this.$router.push("/home/chat");
					}).finally(() => {
						this.loading = false
					})
				}
			});
		},
		resetForm(formName) {
			this.$refs[formName].resetFields();
		},
		// 获取cookie、
		getCookie(name) {
			let reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
			let arr = document.cookie.match(reg)
			if (arr) {
				return unescape(arr[2]);
			}
			return '';
		},
		// 设置cookie,增加到vue实例方便全局调用
		setCookie(name, value) {
			document.cookie = name + "=" + escape(value);
		},
		// 登录模式切换
		toggleLoginMode() {
			if (this.loginMode === 'password') {
				this.loginMode = 'qr';
			} else {
				this.loginMode = 'password';
			}
		},
		goBackToPassword() {
			this.loginMode = 'password';
		}
	},
	mounted() {
		// 账号密码
		this.loginForm.userName = localStorage.getItem("username");
		this.loginForm.password = localStorage.getItem("password");
		// 加载配置
		this.configStore.loadConfig();
		// electron 窗口大小
		window.electronAPI && window.electronAPI.sendEvent('resize', {
			width: 410,
			height: 510,
			maximizable: false
		})
		// 自动登录
		if (localStorage.getItem("isAutoLogin") != null) {
			this.isAutoLogin = JSON.parse(localStorage.getItem("isAutoLogin"));
			if (this.isAutoLogin) {
				this.submitForm();
			}
		}
	},
	computed: {
		loginNamePlaceholder() {
			let mode = this.configStore.registration.mode;
			let strText = "用户名";
			if (mode.includes("phone")) {
				strText += "/手机号"
			}
			if (mode.includes("email")) {
				strText += "/邮箱"
			}
			return strText;
		},
		containsPhoneMode() {
			return this.modes.includes("phone")
		},
		containsEmailMode() {
			return this.modes.includes("email")
		},
		modes() {
			return this.configStore.registration.mode || []
		}
	}
}
</script>

<style scoped lang="scss">
.login-view {
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	display: flex;
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
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;

		.form {
			width: 360px;
			height: 460px;
			padding: 25px;
			background: rgba(255, 255, 255, 0.95);
			border-radius: 3%;
			overflow: hidden;

			// 优化输入框样式
			::v-deep .el-form-item {
				margin-bottom: 20px;

				.el-input__inner {
					height: 50px;
					border-radius: 25px;
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
					display: none;
				}
			}


			.title {
				line-height: 50px;
				margin: 30px 0;
				font-size: 24px;
				font-weight: 700;
				color: var(--im-color-primary);
				letter-spacing: 1px;
				text-align: center;
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

			.qr-switch-btn {
				width: 100%;
				margin-top: 10px;
				margin-left: 0;
				height: 46px;
				border-radius: 23px;
				border: 2px solid var(--im-color-primary);
				background: transparent;
				color: var(--im-color-primary);
				font-size: var(--im-font-size-large);
				font-weight: 600;
				box-shadow: none;
				transition: all 0.3s ease;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				box-sizing: border-box;

				&:hover {
					background: var(--im-color-primary-light-1);
					color: white;
					transform: translateY(-2px);
					
				}

				i {
					margin-right: 6px;
					font-size: 18px;
				}
			}

			.nav-tool-bar {
				display: flex;
				justify-content: space-between;

				.forgot-pwd {
					text-decoration: none;
					color: #6a6a6a;
					font-size: var(--im-font-size-small);
					transition: all 0.3s ease;

					&:hover {
						color: var(--im-color-primary);
					}
				}
			}

			.register {
				display: flex;
				flex-direction: row-reverse;
				line-height: 40px;
				text-align: left;
				margin-top: 20px;
				padding-left: 20px;

				a {
					color: #6a6a6a;
					text-decoration: none;
					font-size: var(--im-font-size);
					transition: all 0.3s ease;

					&:hover {
						color: var(--im-color-primary);
					}
				}
			}
		}
	}
}
</style>