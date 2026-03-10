<template>
    <div class="reset-pwd">
        <div class="reset-wizard">
            <div class="header">
                <h2>密码重置向导</h2>
                <p>只需四步，轻松重置您的密码</p>
            </div>
            <div class="steps-container">
                <el-steps :active="currentStep" align-center>
                    <el-step title="选择方式"></el-step>
                    <el-step title="验证身份"></el-step>
                    <el-step title="设置密码"></el-step>
                    <el-step title="完成"></el-step>
                </el-steps>
                <div class="step-content">
                    <!-- 步骤1: 选择重置方式 -->
                    <div v-if="currentStep === 0">
                        <div class="step-title">
                            <span>请选择密码重置方式</span>
                        </div>
                        <div class="mode-selector">
                            <div v-if="containsPhoneMode" class="mode-card"
                                :class="{ active: dataForm.mode === 'phone' }" @click="dataForm.mode = 'phone'">
                                <i class="iconfont icon-phone"></i>
                                <h3>手机号重置</h3>
                                <p>通过短信验证码验证身份</p>
                            </div>
                            <div v-if="containsEmailMode" class="mode-card"
                                :class="{ active: dataForm.mode === 'email' }" @click="dataForm.mode = 'email'">
                                <i class="iconfont icon-email"></i>
                                <h3>邮箱重置</h3>
                                <p>通过邮箱验证码验证身份</p>
                            </div>
                        </div>
                        <div class="navigation">
                            <el-button class="nav-btn" @click="cancelReset">取消</el-button>
                            <el-button type="primary" class="nav-btn" @click="nextStep">下一步</el-button>
                        </div>
                    </div>
                    <!-- 步骤2: 验证身份 -->
                    <div v-show="currentStep === 1">
                        <div class="step-title">
                            <span>验证您的身份</span>
                        </div>
                        <div v-if="dataForm.mode === 'phone'">
                            <div class="form-group">
                                <label>手机号码</label>
                                <el-input v-model="dataForm.phone" placeholder="请输入您的手机号码"
                                    prefix-icon="el-icon-mobile-phone"></el-input>
                            </div>
                            <div class="form-group">
                                <label>短信验证码</label>
                                <div class="code-input">
                                    <el-input v-model="dataForm.code" placeholder="请输入短信验证码"
                                        prefix-icon="el-icon-message"></el-input>
                                    <el-button class="send-code-btn" type="primary" plain :disabled="phoneLockTime > 0"
                                        @click="onSendSmsCode">
                                        {{ phoneLockTime > 0 ? `${phoneLockTime}秒后重发` : '获取验证码' }}
                                    </el-button>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <div class="form-group">
                                <label>邮箱地址</label>
                                <el-input v-model="dataForm.email" placeholder="请输入您的邮箱地址"
                                    prefix-icon="el-icon-message"></el-input>
                            </div>
                            <div class="form-group">
                                <label>邮箱验证码</label>
                                <div class="code-input">
                                    <el-input v-model="dataForm.code" placeholder="请输入6位邮箱验证码"
                                        prefix-icon="el-icon-chat-dot-round"></el-input>
                                    <el-button class="send-code-btn" type="primary" plain :disabled="emailLockTime > 0"
                                        @click="onSendMailCode">
                                        {{ emailLockTime > 0 ? `${emailLockTime}秒后重发` : '获取验证码' }}
                                    </el-button>
                                </div>
                            </div>
                        </div>
                        <div class="navigation">
                            <el-button class="nav-btn" @click="prevStep">上一步</el-button>
                            <el-button class="nav-btn" type="primary" :disabled="!canVerify" @click="onVertifyCode()">
                                验证
                            </el-button>
                        </div>
                    </div>
                    <!-- 步骤3: 设置新密码 -->
                    <div v-if="currentStep === 2">
                        <div class="step-title">
                            <span>设置新密码</span>
                        </div>
                        <div class="form-group">
                            <label>新密码</label>
                            <el-input v-model="dataForm.password" type="password" placeholder="请输入您的新密码"
                                prefix-icon="el-icon-lock" show-password></el-input>
                        </div>
                        <div class="form-group">
                            <label>确认新密码</label>
                            <el-input v-model="dataForm.confirmPassword" type="password" placeholder="请再次输入您的新密码"
                                prefix-icon="el-icon-lock" show-password></el-input>
                        </div>
                        <div class="navigation">
                            <el-button class="nav-btn" @click="prevStep">上一步</el-button>
                            <el-button type="primary" class="nav-btn" :disabled="!canSubmit" @click="onSubmit">
                                提交
                            </el-button>
                        </div>
                    </div>
                    <!-- 步骤4: 完成 -->
                    <div v-if="currentStep === 3">
                        <div class="success-content">
                            <i class="el-icon-success success-icon"></i>
                            <h3>密码重置成功！</h3>
                            <p>您已成功重置密码，请使用新密码登录您的账户。</p>
                            <p>系统将在 <strong>{{ countdown }}</strong> 秒后自动跳转到登录页面</p>
                            <el-button type="primary" class="nav-btn" @click="toLogin">立即登录</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <captcha-image ref="captchaRef"></captcha-image>
    </div>
</template>
<script>
import CaptchaImage from '../components/common/CaptchaImage.vue';

export default {
    components: {
        CaptchaImage
    },
    data() {
        return {
            currentStep: 0,
            phoneLockTime: 0,
            phoneLockTimer: null,
            emailLockTime: 0,
            emailLockTimer: null,
            countdown: 0,
            countdownTimer: null,
            dataForm: {
                mode: 'phone',
                phone: '13794329827',
                email: '825657193@qq.com',
                code: '',
                password: '123456',
                confirmPassword: '123456',
            }
        };
    },
    methods: {
        nextStep() {
            if (this.currentStep < 3) {
                this.currentStep++;
                // 如果是最后一步，开始倒计时
                if (this.currentStep === 3) {
                    this.startCountdown();
                }
            }
        },
        prevStep() {
            if (this.currentStep > 0) {
                this.currentStep--;
            }
        },
        onSendSmsCode() {
            const regex = /^1[3-9]\d{9}$/;
            if (!regex.test(this.dataForm.phone)) {
                this.$message.error('请输入正确的手机号');
                return;
            }
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
        },
        onSendMailCode() {
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!regex.test(this.dataForm.email)) {
                this.$message.error('请输入正确的邮箱地址');
                return;
            }
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
        },
        onVertifyCode() {
            let action = "";
            if (this.dataForm.mode == 'phone') {
                action = `/captcha/sms/vertify?id=${this.dataForm.phone}&code=${this.dataForm.code}`;
            } else {
                action = `/captcha/mail/vertify?id=${this.dataForm.email}&code=${this.dataForm.code}`
            }
            this.$http({
                url: action,
                method: 'get'
            }).then(isPass => {
                if (!isPass) {
                    this.$message.error("验证失败,请重新输入验证码")
                    this.dataForm.code = "";
                } else {
                    this.nextStep();
                }
            })
        },
        onSubmit() {
            if (this.dataForm.confirmPassword != this.dataForm.password) {
                this.$message.error("两次密码输入不一致")
                return;
            }
            this.$http({
                url: '/resetPwd',
                data: this.dataForm,
                method: 'PUT'
            }).then(() => {
                this.$message.success('密码重置成功！');
                this.nextStep();
            })
        },
        startCountdown() {
            this.countdown = 5;
            this.countdownTimer = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                } else {
                    clearInterval(this.countdownTimer);
                    this.toLogin();
                }
            }, 1000);
        },
        toLogin() {
            this.$router.push("/login");
        },
        cancelReset() {
            this.$confirm('确定要取消密码重置吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.toLogin();
            });
        }
    },
    computed: {
        canVerify() {
            if (this.dataForm.mode === 'phone') {
                return this.dataForm.phone && this.dataForm.code;
            } else {
                return this.dataForm.email && this.dataForm.code;
            }
        },
        canSubmit() {
            return this.dataForm.password && this.dataForm.confirmPassword;
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
    },
    mounted() {
        this.configStore.loadConfig();
        // electron窗口大小
        window.electronAPI && window.electronAPI.sendEvent('resize', {
            width: 700,
            height: 600, 
            maximizable: false
        })
    }
}
</script>

<style scoped lang="scss">
.reset-pwd {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--im-background);

    .reset-wizard {
        width: 700px;
        height: 600px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        background: white;

        .header {
            background: linear-gradient(90deg, var(--im-color-primary-light-1) 0%, var(--im-color-primary-light-3) 100%);
            color: white;
            padding: 25px 30px;
            text-align: center;

            h2 {
                font-weight: bold;
                font-size: 24px;
                margin-bottom: 5px;
            }

            p {
                opacity: 0.9;
                font-size: var(--im-font-size);
            }
        }

        .steps-container {
            padding: 30px;

            .el-steps {
                margin-bottom: 30px;
            }

            .step-content {
                min-height: 280px;
                padding: 10px 0;

                .step-title {
                    font-size: var(--im-font-size-larger);
                    font-weight: 600;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                }

                .mode-selector {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 25px;

                    .mode-card {
                        flex: 1;
                        border: 2px solid #e6e6e6;
                        border-radius: 10px;
                        padding: 20px;
                        text-align: center;
                        cursor: pointer;
                        transition: all 0.3s;
                        max-width: 260px;

                        &:hover {
                            transform: translateY(-3px);
                            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                        }

                        &.active {
                            border-color: var(--im-color-primary-light-4);
                            background: #f4f8fc;
                        }

                        i {
                            font-size: 36px;
                            color: var(--im-color-primary-light-3);
                            margin-bottom: 15px;
                        }

                        h3 {
                            font-size: var(--im-font-size-large);
                            margin-bottom: 10px;
                        }

                        p {
                            font-size: var(--im-font-size);
                            color: var(--im-text-color-light);
                        }
                    }
                }
            }

            .form-group {
                margin-bottom: 25px;

                label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #2c3e50;
                }

                .el-input__inner {
                    height: 48px;
                    line-height: 48px;
                    border-radius: 6px;
                    font-size: 15px;
                }

                .code-input {
                    display: flex;
                    gap: 10px;

                    el-input {
                        flex: 1;
                    }
                }

                .send-code-btn {
                    border-radius: 6px;
                    padding: 0 15px;
                }

                .send-code-btn:disabled {
                    background: #eee;
                    cursor: not-allowed;
                }
            }

            .navigation {
                display: flex;
                justify-content: space-between;
                margin-top: 30px;

                .nav-btn {
                    min-width: 120px;
                    height: 46px;
                    font-size: 16px;
                    border-radius: 6px;
                }
            }

            .success-content {
                text-align: center;
                padding: 30px 0;

                .success-icon {
                    font-size: 70px;
                    color: #2ecc71;
                    margin-bottom: 20px;
                }

                h3 {
                    margin-bottom: 15px;
                    font-size: 22px;
                }

                p {
                    color: var(--im-text-color-light);
                    line-height: 1.6;
                    margin-bottom: 25px;
                }
            }
        }
    }
}
</style>
