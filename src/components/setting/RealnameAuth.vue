<template>
    <div class="realname-auth">
        <!-- 已认证状态 -->
        <div v-if="authInfo && authInfo.authStatus === 2" class="success-section">
            <div class="success-content">
                <div class="success-icon">
                    <i class="el-icon-success"></i>
                </div>
                <div class="success-text">
                    <div class="success-title">实名认证成功</div>
                    <div class="success-desc">您的实名认证已通过审核</div>
                </div>
            </div>
            <div class="info-section">
                <div class="info-item">
                    <span class="info-label">真实姓名：</span>
                    <span class="info-value">{{ authInfo.realName }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">证件号码：</span>
                    <span class="info-value">{{ formatIdCard(authInfo.idCardNumber) }}</span>
                </div>
                <div class="info-item" v-if="authInfo.authTime">
                    <span class="info-label">认证时间：</span>
                    <span class="info-value">{{ authInfo.authTime }}</span>
                </div>
            </div>
        </div>

        <!-- 待审核状态 -->
        <div v-else-if="authInfo && authInfo.authStatus === 1 && !showForm" class="pending-section">
            <div class="pending-content">
                <div class="pending-icon">
                    <i class="el-icon-time"></i>
                </div>
                <div class="pending-text">
                    <div class="pending-title">实名认证审核中</div>
                    <div class="pending-desc">您的实名认证申请正在审核中，请耐心等待</div>
                </div>
            </div>
            <div class="info-section">
                <div class="info-item">
                    <span class="info-label">真实姓名：</span>
                    <span class="info-value">{{ authInfo.realName }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">证件号码：</span>
                    <span class="info-value">{{ formatIdCard(authInfo.idCardNumber) }}</span>
                </div>
            </div>
            <div class="action-section">
                <el-button type="primary" @click="onResubmit">重新提交</el-button>
            </div>
        </div>

        <!-- 认证失败或未认证状态，或显示表单 -->
        <div v-else>
            <!-- 认证失败提示 -->
            <div v-if="authInfo && authInfo.authStatus === 3" class="fail-section">
                <div class="fail-content">

                    <div class="fail-text">
                        <div class="fail-title">
                            <div class="fail-icon">
                                <i class="el-icon-warning"></i>
                            </div>
                            <span>实名认证失败</span>
                        </div>
                        <div class="fail-desc" v-if="authInfo.failReason">
                            失败原因：{{ authInfo.failReason }}
                        </div>
                        <div class="fail-desc" v-else>
                            您的实名认证申请未通过审核，请重新提交
                        </div>
                    </div>
                </div>
            </div>

            <!-- 友好提示 -->
            <div class="tip-section">
                <div class="tip-content">
                    <div class="tip-title">
                        <i class="el-icon-info"></i>实名认证说明
                    </div>
                    <div class="tip-desc">
                        实名认证可以提高账户安全性，请确保上传的身份证照片清晰可见，信息真实有效
                        <span v-if="authInfo.authStatus === 1" class="resubmit-tip">
                            重新提交将覆盖之前的认证信息
                        </span>
                    </div>
                </div>
            </div>

            <!-- 认证表单 -->
            <div class="form-section">
                <h4 class="section-title">
                    <i class="el-icon-postcard"></i>
                    实名认证
                </h4>
                <el-form :model="dataForm" status-icon :rules="rules" ref="realnameAuthForm" label-width="100px"
                    size="small">
                    <el-form-item label="真实姓名" prop="realName">
                        <el-input v-model="dataForm.realName" placeholder="请输入真实姓名" maxlength="20"></el-input>
                    </el-form-item>
                    <el-form-item label="证件号码" prop="idCardNumber">
                        <el-input v-model="dataForm.idCardNumber" placeholder="请输入身份证号码" maxlength="18"></el-input>
                    </el-form-item>
                    <el-form-item label="身份证正面" prop="idCardFront">
                        <div class="upload-item">
                            <div v-if="dataForm.idCardFront" class="image-preview">
                                <img :src="dataForm.idCardFront" alt="身份证正面" />
                                <div class="image-actions">
                                    <i class="el-icon-view" @click="previewImage(dataForm.idCardFront)"></i>
                                    <i class="el-icon-delete" @click="removeImage('idCardFront')"></i>
                                </div>
                            </div>
                            <file-upload v-else :action="'/image/upload'" :maxSize="5 * 1024 * 1024"
                                :fileTypes="['image/jpeg', 'image/png', 'image/jpg']" :showLoading="true"
                                :isPermanent="true" @success="onIdCardFrontSuccess">
                                <el-button type="primary" plain size="small">
                                    <i class="el-icon-upload"></i> 上传身份证正面
                                </el-button>
                            </file-upload>
                            <div class="upload-tip">请上传清晰的身份证正面照片</div>
                        </div>
                    </el-form-item>
                    <el-form-item label="身份证反面" prop="idCardBack">
                        <div class="upload-item">
                            <div v-if="dataForm.idCardBack" class="image-preview">
                                <img :src="dataForm.idCardBack" alt="身份证反面" />
                                <div class="image-actions">
                                    <i class="el-icon-view" @click="previewImage(dataForm.idCardBack)"></i>
                                    <i class="el-icon-delete" @click="removeImage('idCardBack')"></i>
                                </div>
                            </div>
                            <file-upload v-else :action="'/image/upload'" :maxSize="5 * 1024 * 1024"
                                :fileTypes="['image/jpeg', 'image/png', 'image/jpg']" :showLoading="true"
                                :isPermanent="true" @success="onIdCardBackSuccess">
                                <el-button type="primary" plain size="small">
                                    <i class="el-icon-upload"></i> 上传身份证反面
                                </el-button>
                            </file-upload>
                            <div class="upload-tip">请上传清晰的身份证反面照片</div>
                        </div>
                    </el-form-item>
                </el-form>
                <div class="btn-group">
                    <el-button v-if="authInfo.authStatus === 1 || authInfo.authStatus === 2"
                        @click="cancelResubmit">取消</el-button>
                    <el-button type="primary" @click="submitForm()">
                        {{ authInfo.authStatus != 0 ? '提交认证' : '重新提交' }}
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 图片预览对话框 -->
        <el-dialog :visible.sync="previewVisible" width="600px" :modal="true">
            <img :src="previewImageUrl" style="width: 100%;" alt="预览" />
        </el-dialog>
    </div>
</template>

<script>
import FileUpload from '../common/FileUpload.vue';

export default {
    name: "realnameAuth",
    components: {
        FileUpload
    },
    data() {
        var checkRealName = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请输入真实姓名'));
            }
            if (value.length < 2 || value.length > 20) {
                return callback(new Error('姓名长度应在2-20个字符之间'));
            }
            callback();
        };
        var checkIdCard = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请输入身份证号码'));
            }
            const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            if (!regex.test(value)) {
                return callback(new Error('身份证号码格式错误'));
            }
            callback();
        };
        var checkIdCardFront = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请上传身份证正面照片'));
            }
            callback();
        };
        var checkIdCardBack = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('请上传身份证反面照片'));
            }
            callback();
        };
        return {
            dataForm: {
                realName: '',
                idCardNumber: '',
                idCardFront: '',
                idCardBack: ''
            },
            rules: {
                realName: [{
                    validator: checkRealName,
                    trigger: 'blur'
                }],
                idCardNumber: [{
                    validator: checkIdCard,
                    trigger: 'blur'
                }],
                idCardFront: [{
                    validator: checkIdCardFront,
                    trigger: 'change'
                }],
                idCardBack: [{
                    validator: checkIdCardBack,
                    trigger: 'change'
                }]
            },
            authInfo: {
                authStatus: 0 // 认证状态 0-未认证 1-待审核，2-已认证，3-认证失败
            },
            previewVisible: false,
            previewImageUrl: '',
            showForm: false // 控制是否显示表单（用于已认证或待审核状态下的重新提交）
        };
    },
    methods: {
        init() {
            this.loadAuthInfo();
        },
        loadAuthInfo() {
            this.$http({
                url: "/realname/auth/info",
                method: 'GET'
            }).then((authInfo) => {
                this.authInfo = authInfo;
                this.dataForm.realName = authInfo.realName || '';
                this.dataForm.idCardNumber = authInfo.idCardNumber || '';
                this.dataForm.idCardFront = authInfo.idCardFront || '';
                this.dataForm.idCardBack = authInfo.idCardBack || '';
                // 已认证状态下不允许重新提交，不显示表单
                // 未认证或认证失败时，显示表单
                // 待审核状态下，默认不显示表单，但可以点击重新提交按钮显示
                if (authInfo.authStatus === 2) {
                    this.showForm = false;
                } else if (authInfo.authStatus === 0 || authInfo.authStatus === 3) {
                    this.showForm = true;
                } else {
                    this.showForm = false;
                }
            })
        },
        submitForm() {
            this.$refs.realnameAuthForm.validate((valid) => {
                if (valid) {
                    this.$confirm('审核通过后信息将无法修改，是否确认提交？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$http({
                            url: "/realname/auth/submit",
                            method: 'POST',
                            data: this.dataForm
                        }).then(() => {
                            this.$message.success("实名认证申请已提交，请等待审核");
                            this.showForm = false;
                            this.loadAuthInfo();
                        })
                    })
                }
            });
        },
        onResubmit() {
            this.showForm = true;
        },
        cancelResubmit() {
            this.showForm = false;
        },
        onIdCardFrontSuccess(data) {
            this.dataForm.idCardFront = data.originUrl;
            this.$refs.realnameAuthForm.validateField('idCardFront');
        },
        onIdCardBackSuccess(data) {
            this.dataForm.idCardBack = data.originUrl;
            this.$refs.realnameAuthForm.validateField('idCardBack');
        },
        removeImage(type) {
            this.dataForm[type] = '';
            this.$refs.realnameAuthForm.validateField(type);
        },
        previewImage(url) {
            this.previewImageUrl = url;
            this.previewVisible = true;
        },
        formatIdCard(idCard) {
            if (!idCard) return '';
            if (idCard.length === 18) {
                return idCard.substring(0, 6) + '********' + idCard.substring(14);
            }
            return idCard;
        }
    }
}
</script>

<style scoped lang="scss">
.realname-auth {
    padding: 15px;
    background: #fafbfc;
    min-height: 400px;

    // 成功状态
    .success-section {
        background: white;
        border-radius: 8px;
        padding: 30px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border: 1px solid #f0f0f0;

        .success-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            margin-bottom: 30px;

            .success-icon {
                i {
                    font-size: 48px;
                    color: #67c23a;
                }
            }

            .success-text {
                text-align: center;

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

        .info-section {
            border-top: 1px solid #f0f0f0;
            padding-top: 20px;

            .info-item {
                display: flex;
                align-items: center;
                padding: 12px 0;
                font-size: var(--im-font-size);

                .info-label {
                    color: var(--im-text-color-light);
                    width: 100px;
                    flex-shrink: 0;
                }

                .info-value {
                    color: var(--im-text-color);
                    font-weight: 500;
                }
            }
        }
    }

    // 待审核状态
    .pending-section {
        background: white;
        border-radius: 8px;
        padding: 30px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border: 1px solid #f0f0f0;

        .pending-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            margin-bottom: 30px;

            .pending-icon {
                i {
                    font-size: 48px;
                    color: #e6a23c;
                }
            }

            .pending-text {
                text-align: center;

                .pending-title {
                    font-size: var(--im-font-size-larger);
                    font-weight: 600;
                    color: #e6a23c;
                    margin-bottom: 8px;
                }

                .pending-desc {
                    font-size: var(--im-font-size);
                    color: var(--im-text-color-light);
                }
            }
        }

        .info-section {
            border-top: 1px solid #f0f0f0;
            padding-top: 20px;

            .info-item {
                display: flex;
                align-items: center;
                padding: 12px 0;
                font-size: var(--im-font-size);

                .info-label {
                    color: var(--im-text-color-light);
                    width: 100px;
                    flex-shrink: 0;
                }

                .info-value {
                    color: var(--im-text-color);
                    font-weight: 500;
                }
            }
        }

        .action-section {
            margin-top: 20px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #f0f0f0;
        }
    }

    // 失败状态
    .fail-section {
        display: flex;
        align-items: flex-start;
        padding: 15px;
        margin-bottom: 20px;
        background: #fef0f0;
        border: 1px solid #fbc4c4;
        border-radius: 6px;

        .fail-content {
            flex: 1;

            .fail-icon {
                display: inline-block;
                margin-right: 10px;
                vertical-align: top;

                i {
                    font-size: 20px;
                    color: #f56c6c;
                }
            }

            .fail-text {
                display: inline-block;
                flex: 1;

                .fail-title {
                    font-size: var(--im-font-size);
                    font-weight: 600;
                    color: #f56c6c;
                    margin-bottom: 4px;
                }

                .fail-desc {
                    font-size: var(--im-font-size-small);
                    color: #f56c6c;
                    line-height: 1.4;
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

                .resubmit-tip {
                    display: block;
                    margin-top: 8px;
                    color: #e6a23c;
                    font-weight: 500;
                }
            }
        }
    }

    // 表单区域
    .form-section {
        background: white;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        border: 1px solid #f0f0f0;

        .section-title {
            margin: 0 0 20px 0;
            font-size: var(--im-font-size-larger);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f5f5f5;

            i {
                color: var(--im-color-primary);
                font-size: 18px;
                flex-shrink: 0;
            }
        }

        .upload-item {
            .image-preview {
                position: relative;
                width: 200px;
                height: 120px;
                border: 1px solid #dcdfe6;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 8px;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-actions {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    opacity: 0;
                    transition: opacity 0.3s;

                    i {
                        color: white;
                        font-size: 20px;
                        cursor: pointer;

                        &:hover {
                            color: var(--im-color-primary);
                        }
                    }
                }

                &:hover .image-actions {
                    opacity: 1;
                }
            }

            .upload-tip {
                font-size: var(--im-font-size-small);
                color: var(--im-text-color-light);
                margin-top: 5px;
            }
        }
    }

    .btn-group {
        margin-top: 20px;
        display: flex;
        gap: 12px;
        justify-content: flex-start;

        .el-button {
            padding: 10px 28px;
            font-size: var(--im-font-size);
            font-weight: 600;
        }
    }
}
</style>