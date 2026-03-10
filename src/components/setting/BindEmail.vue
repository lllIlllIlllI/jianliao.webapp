<template>
    <div class="bind-email">
        <!-- 绑定成功提示 -->
        <div v-if="isBound" class="success-section">
            <div class="success-content">
                <div class="success-icon">
                    <i class="el-icon-success"></i>
                </div>
                <div class="success-text">
                    <div class="success-title">邮箱绑定成功</div>
                    <div class="success-desc">您的邮箱 {{ userStore.userInfo.email }} 已成功绑定</div>
                </div>
            </div>
        </div>

        <!-- 绑定表单 -->
        <div v-else>
            <!-- 友好提示 -->
            <div class="tip-section">
                <div class="tip-content">
                    <div class="tip-title"> <i class="el-icon-info"></i>建议绑定邮箱</div>
                    <div class="tip-desc">绑定邮箱后，您可以通过邮箱快速重置密码，提高账户安全性</div>
                </div>
            </div>
            
            <!-- 绑定表单 -->
            <div class="form-section">
                <h4 class="section-title">
                    <i class="el-icon-message"></i>
                    邮箱绑定
                </h4>
                <el-form :model="dataForm" status-icon :rules="rules" ref="bindEmailForm" label-width="80px" size="small">
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="dataForm.email" placeholder="请输入邮箱地址" maxlength="50"></el-input>
                    </el-form-item>
                    <el-form-item label="验证码" prop="code">
                        <div class="send-code-bar">
                            <el-input v-model="dataForm.code" placeholder="请输入验证码" maxlength="6"></el-input>
                            <div class="lock-text" v-if="lockTime > 0">{{ `${lockTime}秒后重新获取` }}</div>
                            <el-button v-else type="primary" plain size="small" @click="onSendMailCode">获取验证码</el-button>
                        </div>
                    </el-form-item>
                </el-form>
                <div class="btn-group">
                    <el-button type="primary" @click="submitForm()">绑定</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "bindEmail",
    data() {
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
        var checkCode = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请输入验证码'));
            }
            callback();
        };
        return {
            dataForm: {
                email: '',
                code: ''
            },
            rules: {
                email: [{
                    validator: checkEmail,
                    trigger: 'blur'
                }],
                code: [{
                    validator: checkCode,
                    trigger: 'blur'
                }]
            },
            lockTime: 0,
            lockTimer: null,
            isBound: false
        };
    },
    computed: {
        userStore() {
            return this.$root.userStore;
        }
    },
    methods: {
        init() {
            // 检查是否已绑定邮箱
            this.isBound = !!this.userStore.userInfo.email;
            if (!this.isBound) {
                // 初始化时清空表单
                this.dataForm.email = '';
                this.dataForm.code = '';
                this.$refs.bindEmailForm && this.$refs.bindEmailForm.resetFields();
            }
        },
        submitForm() {
            this.$refs.bindEmailForm.validate((valid) => {
                if (valid) {
                    this.$confirm('邮箱绑定后无法更改，是否绑定？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$http({
                            url: "/user/bindEmail",
                            method: 'PUT',
                            data: this.dataForm
                        }).then(() => {
                            this.$message.success("邮箱绑定成功");
                            this.userStore.userInfo.email = this.dataForm.email;
                            this.isBound = true; 
                        })
                    })
                }
            });
        },
        onSendMailCode() {
            this.$refs.bindEmailForm.validateField('email', (valid) => {
                if (valid == '') {
                    // 60s内不允许再次发送
                    this.lockTime = 60;
                    this.lockTimer && clearInterval(this.lockTimer);
                    this.lockTimer = setInterval(() => {
                        this.lockTime -= 1;
                        if (this.lockTime <= 0) {
                            this.lockTimer && clearInterval(this.lockTimer);
                        }
                    }, 1000)
                    // 发送邮件
                    let data = {
                        email: this.dataForm.email
                    }
                    this.$http({
                        url: "/captcha/mail/code",
                        method: 'post',
                        data: data
                    }).then(() => {
                        this.$message.success("验证码已发送至您的邮箱，请注意查收")
                    }).catch((error) => {
                        this.$message.error(error.message || "发送验证码失败");
                        // 重置倒计时
                        this.lockTime = 0;
                        this.lockTimer && clearInterval(this.lockTimer);
                    })
                }
            })
        }
    },
    beforeDestroy() {
        // 清理定时器
        if (this.lockTimer) {
            clearInterval(this.lockTimer);
        }
    }
}
</script>

<style scoped lang="scss">
.bind-email {
    padding: 15px;
    background: #fafbfc;
    min-height: 400px;

    // 绑定成功提示
    .success-section {
        background: white;
        border-radius: 8px;
        padding: 30px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border: 1px solid #f0f0f0;
        text-align: center;

        .success-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;

            .success-icon {
                i {
                    font-size: 48px;
                    color: #67c23a;
                }
            }

            .success-text {
                .success-title {
                    font-size: var(--im-font-size-larger);
                    font-weight: 600;
                    color: #67c23a;
                    margin-bottom: 8px;
                }

                .success-desc {
                    font-size: var(--im-font-size);
                    color: var(--im-text-color-light);
                }
            }
        }
    }

    .tip-section {
        display: flex;
        align-items: flex-start;
        padding: 15px;
        margin-bottom: 20px;
        background: var(--im-background-active);
        border: 1px solid #b3d8ff;
        border-radius: 6px;

        .tip-content {
            flex: 1;

            .tip-title {
                font-size: var(--im-font-size);
                font-weight: 600;
                color: var(--im-color-primary-light-3);
                margin-bottom: 4px;

                i {
                    font-size: 16px;
                    margin: 0 5px;
                }
            }

            .tip-desc {
                font-size: var(--im-font-size-small);
                color: var(--im-text-color-light);
                line-height: 1.4;
            }
        }
    }

    // 表单区域
    .form-section {
        background: white;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border: 1px solid #f0f0f0;

        .section-title {
            margin: 0 0 15px 0;
            font-size: var(--im-font-size-larger);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f5f5f5;

            i {
                color: var(--im-color-primary);
                font-size: 16px;
            }
        }
    }

    .send-code-bar {
        display: flex;
        align-items: center;
        gap: 8px;

        .el-input {
            flex: 1;
            min-width: 0;
        }

        .lock-text {
            font-size: var(--im-font-size-small);
            color: var(--im-text-color-light);
            white-space: nowrap;
            flex-shrink: 0;
        }
    }

    .btn-group {
        margin-top: 20px;

        .el-button {
            padding: 10px 28px;
            font-size: var(--im-font-size);
            font-weight: 600;
        }
    }
}
</style>
