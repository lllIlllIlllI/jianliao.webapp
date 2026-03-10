<template>
    <el-dialog :visible.sync="isShow" v-dialogDrag :modal="true" :close-on-click-modal="true"
        :close-on-press-escape="true" :show-close="true" width="420px" custom-class="user-profile-dialog"
        :before-close="close" title="个人资料">
        <div class="user-profile-card">
            <!-- 用户头像和基本信息 -->
            <div class="profile-header">
                <div class="avatar-section">
                    <head-image :size="80" :url="userInfo.headImageThumb" radius="50%"
                        :name="userInfo.nickName"></head-image>
                </div>
                <div class="user-info-content">
                    <h3 class="user-name">{{ userInfo.nickName }}</h3>
                    <p class="user-id">ID: {{ userInfo.userName }}</p>
                    <div class="user-status">
                        <span class="status-dot online"></span>
                        <span class="status-text">在线</span>
                    </div>
                </div>
            </div>

            <!-- 详细信息 -->
            <div class="profile-details">
                <div class="detail-item" v-if="userInfo.companyName">
                    <div class="detail-label">
                        <i class="el-icon-office-building"></i>
                        <span>企业</span>
                    </div>
                    <div class="detail-value">
                        {{ userInfo.companyName }}
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">
                        <i class="el-icon-user"></i>
                        <span>性别</span>
                    </div>
                    <div class="detail-value">
                        {{ userInfo.sex === 0 ? '男' : userInfo.sex === 1 ? '女' : '未设置' }}
                    </div>
                </div>

                <div class="detail-item" v-if="userInfo.phone">
                    <div class="detail-label">
                        <i class="el-icon-phone"></i>
                        <span>手机号</span>
                    </div>
                    <div class="detail-value">
                        {{ userInfo.phone }}
                    </div>
                </div>

                <div class="detail-item" v-if="userInfo.email">
                    <div class="detail-label">
                        <i class="el-icon-message"></i>
                        <span>邮箱</span>
                    </div>
                    <div class="detail-value">
                        {{ userInfo.email }}
                    </div>
                </div>

                <div class="detail-item signature-item">
                    <div class="signature-label">
                        <i class="el-icon-edit"></i>
                        <span>个性签名</span>
                    </div>
                    <div class="signature-content" v-if="userInfo.signature">
                        {{ userInfo.signature }}
                    </div>
                    <div class="signature-empty" v-else @click="goToPersonalSettings">
                        <div class="empty-icon">
                            <i class="el-icon-edit-outline"></i>
                        </div>
                        <div class="empty-text">
                            <p class="empty-title">还没有个性签名</p>
                            <p class="empty-desc">去个人设置中编辑你的个性签名吧</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </el-dialog>
</template>

<script>
import HeadImage from './HeadImage.vue';

export default {
    name: "UserProfileCard",
    components: {
        HeadImage
    },
    data() {
        return {
            isShow: false,
        }
    },
    methods: {
        open() {
            this.isShow = true;
        },
        close() {
            this.isShow = false;
        },
        goToPersonalSettings() {
            this.close();
            // 检查当前路由，避免重复跳转
            if (this.$route.path !== '/home/setting') {
                this.$router.push('/home/setting');
            } else {
                // 如果已经在设置页面，切换到个人资料tab
                this.$nextTick(() => {
                    // 通过事件总线通知Setting组件切换到个人资料tab
                    this.$eventBus.$emit('switchToPersonalInfo');
                });
            }
        }
    },
    computed: {
        userInfo() {
            return this.userStore.userInfo || {};
        }
    }
}
</script>

<style scoped lang="scss">
.user-profile-card {
    padding: 0;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    overflow: hidden;
    animation: fadeInUp 0.4s ease-out;

    .profile-header {
        padding: 20px 10px;
        display: flex;
        align-items: center;
        gap: 20px;
        position: relative;
        border-radius: 15px;

        .avatar-section {
            flex-shrink: 0;
            position: relative;
            z-index: 10;
        }

        .user-info-content {
            flex: 1;
            position: relative;
            z-index: 10;

            .user-name {
                margin: 0 0 8px 0;
                font-size: 22px;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                line-height: 1.2;
                display: block;
                opacity: 1;
            }

            .user-id {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.3;
                display: block;
                opacity: 1;
            }

            .user-status {
                display: flex;
                align-items: center;
                gap: 8px;

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;

                    &.online {
                        background-color: var(--im-color-success);
                        box-shadow: 0 0 8px rgba(103, 194, 58, 0.6);
                    }
                }

                .status-text {
                    font-size: 13px;
                    font-weight: 500;
                }
            }
        }
    }

    .profile-details {
        margin: 10px 0;
        padding: 0 5px;

        .detail-item {
            display: flex;
            align-items: flex-start;
            padding: 16px 0;
            border-bottom: 1px solid #f0f0f0;
            transition: all 0.3s ease;
            border-radius: 8px;
            margin-bottom: 4px;

            &:hover {
                background: var(--im-background-active);
                transform: translateX(2px);
            }

            &:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }

            .detail-label {
                display: flex;
                align-items: center;
                gap: 10px;
                width: 90px;
                font-weight: 600;
                color: #555;
                font-size: 14px;
                flex-shrink: 0;

                i {
                    color: var(--im-color-primary);
                    font-size: 18px;
                    width: 20px;
                    text-align: center;
                }
            }

            .detail-value {
                flex: 1;
                font-size: 14px;
                color: #333;
                word-break: break-all;
                font-weight: 500;
                line-height: 1.4;
            }
        }

        // 个性签名特殊样式
        .signature-item {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px 0;

            .signature-label {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                color: #555;
                font-size: 14px;
                margin-bottom: 12px;

                i {
                    color: var(--im-color-primary);
                    font-size: 18px;
                    width: 20px;
                    text-align: center;
                }
            }

            .signature-content {
                width: 100%;
                font-size: 14px;
                color: #666;
                line-height: 1.6;
                font-style: italic;
                padding: 10px;
                border-radius: 12px;
                word-break: break-word;
                position: relative;
                box-sizing: border-box;
            }

            .signature-empty {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 16px;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                border: 1px dashed #d0d0d0;
                transition: all 0.3s ease;
                cursor: pointer;
                box-sizing: border-box;

                &:hover {
                    border-color: #999;
                    background: #f0f0f0;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .empty-icon {
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    background: #e9ecef;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    i {
                        font-size: 20px;
                        color: #6c757d;
                    }
                }

                .empty-text {
                    flex: 1;

                    .empty-title {
                        margin: 0 0 6px 0;
                        font-size: 15px;
                        font-weight: 500;
                        color: #666;
                    }

                    .empty-desc {
                        margin: 0;
                        font-size: 13px;
                        color: #999;
                        line-height: 1.4;
                    }
                }
            }
        }
    }
}

// 添加动画效果
@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(103, 194, 58, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
