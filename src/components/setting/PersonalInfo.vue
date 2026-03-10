<template>
    <div class="personal-info">
        <!-- 个人信息卡片 -->
        <div class="profile-card">
            <div class="profile-header">
                <div class="avatar-section">
                    <div class="avatar-container">
                        <file-upload class="avatar-uploader" action="/image/upload?thumbSize=20" :isPermanent="true"
                            :showLoading="true" :maxSize="maxSize" @success="onUploadSuccess"
                            :fileTypes="['image/jpeg', 'image/png', 'image/jpg', 'image/webp']">
                            <head-image class="avatar" :size="60" :url="userInfo.headImageThumb" radius="50%"
                                :name="userInfo.nickName || userInfo.userName">
                            </head-image>
                        </file-upload>
                        <!-- 悬浮提示涂层 -->
                        <div class="upload-overlay">
                            <i class="el-icon-camera"></i>
                            <span>更换头像</span>
                        </div>
                    </div>
                </div>
                <div class="user-basic-info">
                    <h3 class="user-name">
                        {{ userInfo.nickName || userInfo.userName || '未设置昵称' }}
                        <span class="company-tag" v-if="userInfo.companyName">@{{ userInfo.companyName }}</span>
                    </h3>
                    <p class="user-id">ID: {{ userInfo.userName || '未知用户' }}</p>
                </div>
            </div>
        </div>

        <!-- 详细信息表单 -->
        <div class="form-section">
            <h4 class="section-title">
                <i class="el-icon-user"></i>
                基本信息
            </h4>
            <el-form :model="userInfo" label-width="80px" :rules="rules" ref="personalForm" size="small">
                <el-form-item label="企业" v-if="userInfo.companyName">
                    <span class="company-text">{{ userInfo.companyName }}</span>
                </el-form-item>
                <el-form-item prop="nickName" label="昵称">
                    <el-input v-model="userInfo.nickName" autocomplete="off" size="small" maxlength="32" show-word-limit
                        placeholder="请输入昵称"></el-input>
                </el-form-item>
                <el-form-item label="性别">
                    <el-radio-group v-model="userInfo.sex">
                        <el-radio :label="0">
                            <i class="el-icon-male"></i>
                            男
                        </el-radio>
                        <el-radio :label="1">
                            <i class="el-icon-female"></i>
                            女
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </div>

        <!-- 联系方式 -->
        <div class="form-section">
            <h4 class="section-title">
                <i class="el-icon-phone"></i>
                联系方式
            </h4>
            <div class="contact-items">
                <div class="contact-item">
                    <div class="contact-label">
                        <i class="el-icon-mobile-phone"></i>
                        <span>手机号</span>
                    </div>
                    <div class="contact-content">
                        <el-input v-if="userInfo.phone" disabled v-model="userInfo.phone" autocomplete="off"
                            size="small"></el-input>
                        <div v-else class="bind-section">
                            <span class="no-bind-text">未绑定手机号</span>
                            <div type="text" @click="onBindPhone" class="bind-btn">
                                <i class="el-icon-link"></i>
                                去绑定
                            </div>
                        </div>
                    </div>
                </div>

                <div class="contact-item">
                    <div class="contact-label">
                        <i class="el-icon-message"></i>
                        <span>邮箱</span>
                    </div>
                    <div class="contact-content">
                        <el-input v-if="userInfo.email" disabled v-model="userInfo.email" autocomplete="off"
                            size="small"></el-input>
                        <div v-else class="bind-section">
                            <span class="no-bind-text">未绑定邮箱</span>
                            <div type="text" @click="onBindEmail" class="bind-btn">
                                <i class="el-icon-link"></i>
                                去绑定
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 个性签名 -->
        <div class="form-section">
            <h4 class="section-title">
                <i class="el-icon-edit"></i>
                个性签名
            </h4>
            <el-form :model="userInfo" ref="personalForm" size="small">
                <el-form-item>
                    <el-input type="textarea" v-model="userInfo.signature" :rows="3" maxlength="64" show-word-limit
                        placeholder="分享你的心情和想法..."></el-input>
                </el-form-item>
            </el-form>
        </div>
        <div class="btn-group">
            <el-button type="primary" @click="onSubmit()">提 交</el-button>
        </div>
    </div>
</template>

<script>
import FileUpload from "../common/FileUpload.vue";
import HeadImage from "../common/HeadImage.vue";
export default {
    name: "personalInfo",
    components: {
        FileUpload,
        HeadImage
    },
    data() {
        return {
            userInfo: {},
            maxSize: 5 * 1024 * 1024,
            action: "/image/upload",
            rules: {
                nickName: [{
                    required: true,
                    message: '请输入昵称',
                    trigger: 'blur'
                }]
            }
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            let mine = this.userStore.userInfo;
            if (!mine || !mine.id) {
                // 防止当前页面原地刷新，没来得及加载用户信息
                setTimeout(() => this.init(), 100)
            } else {
                this.userInfo = JSON.parse(JSON.stringify(mine));
            }
        },
        onSubmit() {
            this.$refs.personalForm.validate((valid) => {
                if (!valid) {
                    return false;
                }
                this.$http({
                    url: "/user/update",
                    method: "put",
                    data: this.userInfo
                }).then(() => {
                    this.userStore.loadUser();
                    this.$message.success("修改成功");
                })
            });
        },
        onUploadSuccess(data) {
            this.userInfo.headImage = data.originUrl;
            this.userInfo.headImageThumb = data.thumbUrl;
            // 更新 userStore 中的用户信息
            this.userStore.userInfo.headImage = data.originUrl;
            this.userStore.userInfo.headImageThumb = data.thumbUrl;
        },
        onBindPhone() {
            // 跳转到绑定手机tab页
            this.$emit('switch-tab', '2');
        },
        onBindEmail() {
            // 跳转到绑定邮箱tab页
            this.$emit('switch-tab', '3');
        }
    }

}
</script>

<style lang="scss" scoped>
.personal-info {
    padding: 15px;
    background: #fafbfc;
    min-height: 400px;

    // 个人信息卡片
    .profile-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 12px;
        padding: 20px 25px;
        margin-bottom: 16px;
        color: var(--im-text-color);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(0, 0, 0, 0.06);
        backdrop-filter: blur(10px);

        .profile-header {
            display: flex;
            align-items: center;
            gap: 25px;

            .avatar-section {
                .avatar-container {
                    position: relative;
                    width: 60px;
                    height: 60px;

                    .avatar-uploader {
                        --width: 60px;

                        .el-upload {
                            border: 2px dashed rgba(0, 0, 0, 0.1) !important;
                            border-radius: 50%;
                            cursor: pointer;
                            position: relative;
                            overflow: hidden;
                            transition: all 0.3s ease;
                            width: var(--width);
                            height: var(--width);

                            &:hover {
                                border-color: var(--im-color-primary) !important;
                                transform: scale(1.05);
                            }
                        }

                        .avatar {
                            width: var(--width);
                            height: var(--width);
                            display: block;
                            border-radius: 50%;
                        }
                    }

                    // 悬浮提示涂层
                    .upload-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 60px;
                        height: 60px;
                        background: rgba(0, 0, 0, 0.5);
                        border-radius: 50%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 12px;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        pointer-events: none;
                        z-index: 10;

                        i {
                            font-size: 18px;
                            margin-bottom: 2px;
                        }
                    }

                    &:hover .upload-overlay {
                        opacity: 1;
                    }
                }
            }

            .user-basic-info {
                flex: 1;
                text-align: left;

                .user-name {
                    margin: 0 0 6px 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--im-text-color-primary);
                }

                .user-id {
                    margin: 0;
                    font-size: 14px;
                    color: var(--im-text-color-light);
                    font-family: 'Courier New', monospace;
                }
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

        .company-text {
            font-size: var(--im-font-size);
            color: var(--im-text-color-light);
        }

    }

    // 联系方式区域
    .contact-items {
        .contact-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f5f5f5;

            &:last-child {
                border-bottom: none;
            }

            .contact-label {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100px;
                font-weight: 500;

                font-size: var(--im-font-size);

                i {
                    color: var(--im-color-primary);
                    font-size: var(--im-font-size-large);
                }
            }

            .contact-content {
                flex: 1;

                .bind-section {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    .no-bind-text {
                        color: var(--im-text-color-light);
                        font-size: var(--im-font-size);
                    }

                    .bind-btn {
                        color: var(--im-color-primary);
                        padding: 0;
                        font-size: var(--im-font-size);
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        cursor: pointer;

                        &:hover {
                            color: var(--im-color-primary-light-2);
                        }

                        i {
                            font-size: 12px;
                        }
                    }
                }
            }
        }
    }

    // 按钮组
    .btn-group {
        margin-top: 20px;

        .el-button {
            padding: 10px 28px;
            font-size: 14px;
            font-weight: 600;
        }
    }
}
</style>
