<template>
    <div class="group-video-call-banner" :class="{ 'expanded': isExpanded }">
        <!-- 折叠状态：显示logo、通话人数、下拉箭头 -->
        <div class="banner-header" @click.stop="switchExpand">
            <div class="banner-left">
                <div class="call-icon">
                    <i class="el-icon-video-camera"></i>
                </div>
                <div class="header-avatars">
                    <head-image v-for="(user, index) in headerUsers" :key="user.id" :id="user.id" :url="user.headImage"
                        :name="user.nickName" :size="28" @click.native.stop="showUserInfo($event, user.id)"
                        :class="['header-avatar-item', { 'avatar-overlap': index > 0 }]"></head-image>
                    <div v-if="hasMoreUsers" class="avatar-more">
                        <span>+{{ moreCount }}</span>
                    </div>
                </div>
                <div class="call-text">{{ callText }}</div>
            </div>
            <div class="arrow-icon" :class="{ 'expanded': isExpanded }">
                <i :class="isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
            </div>
        </div>

        <!-- 展开状态：显示头像和加入按钮 -->
        <div v-if="isExpanded" class="banner-content">
            <div class="user-avatars">
                <head-image v-for="user in displayUsers" :key="user.id" :id="user.id" :url="user.headImage"
                    :name="user.nickName" :size="48" @click.native.stop="showUserInfo($event, user.id)"
                    class="avatar-item"></head-image>
            </div>
            <el-button class="bottom-btn" type="primary" @click.stop="onJoin">加入</el-button>
        </div>
    </div>
</template>

<script>
import HeadImage from '../common/HeadImage.vue';

export default {
    name: "ChatGroupRtcBanner",
    components: {
        HeadImage
    },
    props: {
        rtcInfo: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isExpanded: false
        }
    },
    computed: {
        displayUsers() {
            // 显示所有通话中的用户
            return this.rtcInfo.userInfos || [];
        },
        headerUsers() {
            // header中显示的用户列表，最多显示3个
            return (this.rtcInfo.userInfos || []).slice(0, 3);
        },
        hasMoreUsers() {
            return this.moreCount > 0;
        },
        moreCount() {
            return (this.rtcInfo.userInfos || []).length - 3;
        },
        callText() {
            return `${this.rtcInfo.userInfos.length}人正在语音通话`;
        }
    },
    methods: {
        switchExpand() {
            this.isExpanded = !this.isExpanded;
        },
        onJoin() {
            this.$emit('join');
        },
        showUserInfo(e, userId) {
            this.$http({
                url: `/user/find/${userId}`,
                method: 'get'
            }).then((user) => {
                let pos = {
                    x: e.x + 30,
                    y: e.y
                }
                this.$eventBus.$emit("openUserInfo", user, pos);
            })
        }
    }
}
</script>

<style scoped lang="scss">
.group-video-call-banner {
    margin: 0 2px;
    border-radius: 8px;
    transition: all 0.3s ease;

    .banner-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 15px;
        cursor: pointer;
        background: var(--im-background-active);
        transition: background 0.2s ease;


        &:hover {
            background: var(--im-background-active-dark);
        }

        .banner-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;

            .call-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                flex-shrink: 0;
                position: relative;

                i {
                    font-size: 20px;
                    color: var(--im-color-primary);
                    animation: pulse 3s ease-in-out infinite;
                    position: relative;
                    z-index: 1;
                }

                // 脉冲波纹效果
                &::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--im-color-primary);
                    opacity: 0.15;
                    animation: ripple 3s ease-out infinite;
                }

                &::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--im-color-primary);
                    opacity: 0.1;
                    animation: ripple 3s ease-out 1.5s infinite;
                }
            }

            @keyframes pulse {

                0%,
                100% {
                    transform: scale(1);
                }

                50% {
                    transform: scale(1.03);
                }
            }

            @keyframes ripple {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.3;
                }

                100% {
                    transform: translate(-50%, -50%) scale(1.5);
                    opacity: 0;
                }
            }

            .header-avatars {
                display: flex;
                align-items: center;
                flex-shrink: 0;
                position: relative;

                .header-avatar-item {
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    transition: transform 0.2s ease;
                    position: relative;
                    z-index: 1;
                    cursor: pointer;

                    &.avatar-overlap {
                        margin-left: -8px;
                    }

                    &:hover {
                        transform: scale(1.1);
                        z-index: 10;
                    }

                    &:first-child {
                        z-index: 1;
                    }

                    &:nth-child(2) {
                        z-index: 2;
                    }

                    &:nth-child(3) {
                        z-index: 3;
                    }
                }

                .avatar-more {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.08);
                    border: 2px solid #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: -8px;
                    font-size: 12px;
                    color: #666;
                    font-weight: 500;
                    position: relative;
                    z-index: 4;
                }
            }

            .call-text {
                flex: 1;
                font-size: var(--im-font-size);
                color: #333;
                font-weight: 400;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-left: 8px;
            }
        }

        .arrow-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            transition: transform 0.3s ease;

            &.expanded {
                transform: rotate(180deg);
            }

            i {
                font-size: 14px;
                color: #999;
            }
        }
    }

    .banner-content {
        padding: 16px;
        background: white;
        border-top: 1px solid #e9ecef;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        animation: slideDown 0.3s ease;

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .user-avatars {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;

            .avatar-item {
                transition: transform 0.2s ease;

                &:hover {
                    transform: scale(1.05);
                }
            }
        }

        .bottom-btn {
            width: 300px;
            padding: 10px 20px;
        }
    }
}
</style>
