<template>
    <div class="modify-password">
        <!-- 密码修改表单 -->
        <div class="form-section">
            <h4 class="section-title">
                <i class="el-icon-lock"></i>
                修改密码
            </h4>
            <el-form :model="formData" label-width="80px" :rules="rules" ref="passwordForm" size="small">
                <el-form-item prop="oldPassword" label="原密码">
                    <el-input v-model="formData.oldPassword" type="password" autocomplete="off" size="small" maxlength="20"
                        show-word-limit></el-input>
                </el-form-item>
                <el-form-item prop="newPassword" label="新密码">
                    <el-input v-model="formData.newPassword" type="password" autocomplete="off" size="small" maxlength="20"
                        show-word-limit></el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword" label="确认密码">
                    <el-input v-model="formData.confirmPassword" type="password" autocomplete="off" size="small" maxlength="20"
                        show-word-limit></el-input>
                </el-form-item>
            </el-form>
            <div class="btn-group">
                <el-button type="primary" @click="onSubmit()">提 交</el-button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "modifyPassword",
    data() {
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
            if (value != this.formData.newPassword) {
                return callback(new Error('两次密码输入不一致'));
            }
            callback();
        };
        return {
            formData: {
                oldPassword: "",
                newPassword: "",
                confirmPassword: ""
            },
            rules: {
                newPassword: [{
                    validator: checkPassword,
                    trigger: 'blur'
                }],
                oldPassword: [{
                    validator: checkPassword,
                    trigger: 'blur'
                }],
                confirmPassword: [{
                    validator: checkConfirmPassword,
                    trigger: 'blur'
                }]
            },
        }
    },
    methods: {
        onSubmit() {
            this.$refs.passwordForm.validate((valid) => {
                if (!valid) {
                    return false;
                }
                this.$http({
                    url: "/modifyPwd",
                    method: "put",
                    data: this.formData
                }).then((res) => {
                    this.$message.success("修改成功");
                })
            });
        }
    }
}
</script>
<style scoped lang="scss">
.modify-password {
    padding: 15px;
    background: #fafbfc;
    min-height: 400px;

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
