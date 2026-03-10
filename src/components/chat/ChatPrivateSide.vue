<template>
    <div class="chat-private-side">
        <!-- 好友信息展示区域 -->
        <div class="friend-info-section" v-if="userInfo">
            <!-- 好友基本信息卡片 -->
            <div class="friend-card">
                <div class="friend-avatar">
                    <head-image :size="80" :url="userInfo.headImageThumb" radius="50%" :name="userInfo.nickName">
                    </head-image>
                </div>

                <div class="friend-details">
                    <div class="friend-name-row">
                        <h4 class="friend-name">{{ userInfo.nickName }}</h4>
                        <div class="gender-icons">
                            <i v-if="userInfo.sex == 0" class="el-icon-male gender-icon male"></i>
                            <i v-if="userInfo.sex == 1" class="el-icon-female gender-icon female"></i>
                        </div>
                    </div>
                    <div class="friend-company-row company-tag" v-if="userInfo.companyName">
                        @{{ userInfo.companyName }}
                    </div>
                    <div class="friend-id-row">
                        <span class="friend-id">ID: {{ userInfo.userName }}</span>
                        <i class="el-icon-copy-document copy-btn" @click="copyUserName" title="复制用户ID"></i>
                    </div>
                </div>
            </div>

            <!-- 个人设置区域 -->
            <div class="personal-setting">
                <div class="switch-item">
                    <div class="label">
                        <i class="el-icon-bell"></i>
                        <span>消息免打扰</span>
                    </div>
                    <el-switch v-model="isDnd" @change="onDndChange"></el-switch>
                </div>
                <div class="switch-item">
                    <div class="label">
                        <i class="el-icon-top"></i>
                        <span>置顶聊天</span>
                    </div>
                    <el-switch v-model="isTop" @change="onTopChange"></el-switch>
                </div>
                <div class="switch-item">
                    <div class="label">
                        <i class="el-icon-warning"></i>
                        <span>加入黑名单</span>
                    </div>
                    <el-switch v-model="isInBlacklist" @change="onBlacklistChange"></el-switch>
                </div>
            </div>

            <!-- 好友信息区域 -->
            <div class="friend-info-section-card">
                <!-- 备注名 -->
                <div class="info-item">
                    <div class="info-label">
                        <i class="el-icon-edit"></i>
                        <span>备注名</span>
                    </div>
                    <div class="info-content">
                        <el-input v-if="isEditingRemark" v-model="remarkValue" size="small" placeholder="请输入备注名"
                            maxlength="32" show-word-limit @blur="saveRemark" @keyup.enter="saveRemark"
                            ref="remarkInput">
                        </el-input>
                        <div v-else class="info-display" @click="startEditRemark">
                            <span v-if="friend.remarkNickName">{{ friend.remarkNickName }}</span>
                            <span v-else class="info-placeholder">点击设置备注名</span>
                            <i class="el-icon-edit-outline"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作按钮区域 -->
            <div class="btn-group">
                <div class="text-btn" @click="onCleanMessage">
                    清空聊天记录
                </div>
                <div class="text-btn" @click="onDeleteFriend">
                    删除好友
                </div>
            </div>
            <div class="complaint-tip" @click="onComplaint">
                <span>被骚扰了？投诉该用户</span>
            </div>
        </div>
        <complaint ref="complaint"></complaint>
    </div>
</template>

<script>
import HeadImage from '../common/HeadImage.vue';
import Complaint from '../common/Complaint.vue';

export default {
    name: "ChatPrivateSide",
    components: {
        HeadImage,
        Complaint
    },
    data() {
        return {
            isDnd: false,
            isTop: false,
            isInBlacklist: false,
            isEditingRemark: false,
            remarkValue: ''
        }
    },
    props: {
        userInfo: {
            type: Object,
            default: null
        },
        chat: {
            type: Object,
            default: null
        }
    },
    methods: {
        // 免打扰开关变化
        onDndChange(value) {
            const data = {
                friendId: this.userInfo.id,
                isDnd: value
            };
            this.$http({
                url: '/friend/dnd',
                method: 'PUT',
                data: data
            }).then(() => {
                this.friendStore.setDnd(this.userInfo.id, value);
                this.chatStore.setDnd(this.chat, value)
                this.$message.success(value ? '已开启免打扰' : '已关闭免打扰');
            }).catch(() => {
                this.$message.error('操作失败，请重试');
                this.isDnd = !value;
            })
        },
        // 置顶开关变化
        onTopChange(value) {
            const data = {
                friendId: this.userInfo.id,
                isTop: value
            };
            this.$http({
                url: '/friend/top',
                method: 'PUT',
                data: data
            }).then(() => {
                this.friendStore.setTop(this.userInfo.id, value);
                this.chatStore.setTop(this.chat, value)
                this.$message.success(value ? '已置顶聊天' : '已取消置顶');
            }).catch(() => {
                this.$message.error('操作失败，请重试');
                this.isTop = !value;
            })
        },
        // 拉黑开关变化
        onBlacklistChange(value) {
            if (value) {
                this.$confirm(`您将不再收到对方的消息,确认将 '${this.userInfo.nickName}'加入黑名单吗?`, '加入黑名单', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.updateBlacklistSetting(true);
                }).catch(() => {
                    this.isInBlacklist = false;
                });
            } else {
                this.updateBlacklistSetting(false);
            }
        },
        // 更新黑名单设置
        updateBlacklistSetting(value) {
            let url = '';
            let method = '';
            if (value) {
                url = `/blacklist/add?userId=${this.userInfo.id}`;
                method = 'POST';
            } else {
                url = `/blacklist/remove?userId=${this.userInfo.id}`;
                method = 'DELETE';
            }
            this.$http({
                url: url,
                method: method
            }).then(() => {
                // 更新本地状态
                this.isInBlacklist = value;
                this.userInfo.isInBlacklist = value;
                // 显示成功消息
                const tip = value ? `已将'${this.userInfo.nickName}'加入黑名单` : `已解除'${this.userInfo.nickName}'的黑名单`;
                this.$message.success(tip);
            }).catch(() => {
                this.$message.error('操作失败，请重试');
                // 恢复开关状态
                this.isInBlacklist = !value;
            })
        },
        // 清空聊天记录
        onCleanMessage() {
            this.$confirm(`确定要清空与'${this.userInfo.nickName}'的所有聊天记录吗？`, '清空聊天记录', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.chatStore.cleanMessage(this.chat);
                this.$message.success(`您清空了'${this.userInfo.nickName}'的聊天记录`);
            }).catch(() => {
                // 用户取消操作
            });
        },
        // 开始编辑备注
        startEditRemark() {
            this.isEditingRemark = true;
            this.remarkValue = this.friend.remarkNickName || '';
            this.$nextTick(() => {
                this.$refs.remarkInput.focus();
            });
        },
        // 保存备注
        saveRemark() {
            const newRemark = this.remarkValue.trim();
            // 如果备注没有变化，直接退出编辑模式
            if (newRemark === (this.friend.remarkNickName || '')) {
                this.isEditingRemark = false;
                return;
            }

            // 参考Friend.vue的API调用逻辑
            let data = {
                friendId: this.userInfo.id,
                remarkNickName: newRemark
            };
            this.$http({
                url: '/friend/update/remark',
                method: 'PUT',
                data: data
            }).then((friend) => {
                // 更新本地数据，参考Friend.vue的更新逻辑
                this.friendStore.updateFriend(friend);
                this.chatStore.updateChatFromFriend(friend);
                // 显示成功消息
                this.$message.success(newRemark ? '备注设置成功' : '备注已清除');
            }).finally(() => {
                // 退出编辑模式
                this.isEditingRemark = false;
            });
        },
        // 删除好友
        onDeleteFriend() {
            this.$confirm(`确定要删除好友 '${this.userInfo.nickName}' 吗？删除后将无法恢复。`, '删除好友', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$http({
                    url: `/friend/delete/${this.userInfo.id}`,
                    method: 'DELETE'
                }).then(() => {
                    // 删除成功后，从好友列表中移除
                    this.friendStore.removeFriend(this.userInfo.id);
                    // 从聊天列表中移除
                    this.chatStore.removePrivateChat(this.userInfo.id);
                    this.$message.success(`已删除好友 '${this.userInfo.nickName}'`);
                    // 关闭侧边栏
                    this.$emit('close');
                }).catch(() => {
                    this.$message.error('删除失败，请重试');
                });
            }).catch(() => {
                // 用户取消操作
            });
        },
        // 投诉用户
        onComplaint() {
            this.$refs.complaint.open(1, this.userInfo.id, this.userInfo.nickName)
        },

        // 复制用户名
        copyUserName() {
            const userName = this.userInfo.userName;
            // 使用现代浏览器的 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(userName).then(() => {
                    this.$message.success(`内容'${userName}'已复制到剪贴板`);
                }).catch(() => {
                    this.$message.error('复制失败，请手动复制');
                });
            } else {
                this.$message.error('复制失败，请手动复制');
            }
        }
    },
    computed: {
        friend() {
            return this.friendStore.findFriend(this.userInfo.id) || {}
        }
    },
    watch: {
        userInfo: {
            handler() {
                // 从store或聊天信息中获取当前设置状态
                this.isDnd = this.friend.isDnd;
                this.isTop = this.friend.isTop;
                this.isInBlacklist = this.userInfo.isInBlacklist;
            },
            immediate: true
        }
    }
}
</script>

<style scoped lang="scss">
.chat-private-side {
    padding: 10px;
    position: relative;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;

    // 公共卡片样式
    %card-style {
        padding: 5px 16px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 10px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .friend-info-section {
        .friend-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            margin-bottom: 12px;
            @extend %card-style;

            .friend-avatar {
                flex-shrink: 0;
            }

            .friend-details {
                flex: 1;

                .friend-name-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;

                    .friend-name {
                        margin: 0;
                        font-size: var(--im-font-size-larger);
                        font-weight: 600;
                        color: var(--im-text-color);
                    }

                    .gender-icons {
                        .gender-icon {
                            font-size: 16px;
                            border-radius: 50%;
                            padding: 2px;
                            transition: all 0.3s ease;

                            &.male {
                                color: #1890ff;
                                background: rgba(24, 144, 255, 0.1);
                            }

                            &.female {
                                color: #f5222d;
                                background: rgba(245, 34, 45, 0.1);
                            }
                        }
                    }
                }

                .friend-company-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    margin-left: 0;
                }

                .friend-id-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .friend-id {
                        margin: 0;
                        font-size: var(--im-font-size);
                        color: var(--im-text-color-light);
                        text-align: left;
                    }

                    .copy-btn {
                        font-size: 14px;
                        color: var(--im-color-primary);
                        cursor: pointer;
                        padding: 4px;
                        border-radius: 4px;
                        transition: all 0.3s ease;
                        opacity: 0.8;

                        &:hover {
                            background: rgba(64, 158, 255, 0.1);
                            opacity: 1;
                            transform: scale(1.1);
                        }
                    }
                }
            }
        }

        .personal-setting {
            margin-bottom: 12px;
            @extend %card-style;

            .switch-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.08);
                transition: all 0.2s ease;

                &:last-child {
                    border-bottom: none;
                }

                &:hover {
                    background: var(--im-background-active);
                    border-radius: 8px;
                    padding: 12px 8px;
                    margin: 0 -8px;
                }

                .label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--im-text-color-primary);

                    i {
                        color: var(--im-color-primary);
                        font-size: 16px;
                        width: 18px;
                        text-align: center;
                    }
                }
            }
        }

        .friend-info-section-card {
            margin-bottom: 12px;
            @extend %card-style;

            .info-item {


                .info-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin: 6px 0;
                    font-weight: 500;
                    color: var(--im-text-color-primary);
                    font-size: var(--im-font-size);

                    i {
                        color: var(--im-color-primary);
                        font-size: 13px;
                        width: 20px;
                        text-align: center;
                    }
                }

                .info-content {
                    .info-display {
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        padding: 6px 3px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        min-height: 32px;
                        border-radius: 8px;

                        &:hover {
                            background: var(--im-background-active);
                        }

                        span {
                            font-size: var(--im-font-size);
                            color: var(--im-text-color);
                            word-break: break-all;

                            &.info-placeholder {
                                color: var(--im-text-color-light);
                                font-style: italic;
                            }
                        }

                        i {
                            color: var(--im-text-color-light);
                            font-size: 11px;
                            opacity: 0.6;
                            margin-left: auto;
                        }
                    }
                }
            }
        }

        .btn-group {
            text-align: center;
            @extend %card-style;

            .text-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                padding: 12px 16px;
                font-size: var(--im-font-size);
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border-radius: 6px;
                color: var(--im-color-danger);
                background: transparent;
                border: none;
                box-sizing: border-box;
                border-bottom: 1px solid rgba(0, 0, 0, 0.08);

                &:last-child {
                    border-bottom: none;
                }

                &:hover {
                    background: var(--im-background-active);
                }
            }
        }

        .complaint-tip {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px 12px;
            font-size: var(--im-font-size-smaller);
            color: var(--im-color-primary-light-2);
            cursor: pointer;
            margin-top: 8px;

            &:hover {
                color: var(--im-color-primary);
            }
        }
    }
}
</style>
