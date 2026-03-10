<template>
    <div v-if="show">
        <div class="chat-group-readed-mask" @click.self="close()">
            <div class="chat-group-readed" :style="{ 'left': pos.x + 'px', 'top': pos.y + 'px' }" @click.prevent="">
                <div class="readed-header">
                    <div class="header-title">
                        <i class="el-icon-view"></i>
                        <span>消息已读状态</span>
                    </div>
                    <div class="close-btn" @click="close()">
                        <i class="el-icon-close"></i>
                    </div>
                </div>
                <div class="tabs-container">
                    <tabs :items="tabItems" :current="currentTab" @change="onTabChange"></tabs>
                    <div class="tab-content">
                        <div v-show="currentTab === 0" class="member-list">
                            <div v-if="readedMembers.length === 0" class="empty-state">
                                <i class="el-icon-check"></i>
                                <p>暂无已读成员</p>
                            </div>
                            <virtual-scroller v-else class="scroll-box" :items="readedMembers">
                                <template v-slot="{ item }">
                                    <group-member-bar :member="item" :group="group"></group-member-bar>
                                </template>
                            </virtual-scroller>
                        </div>
                        <div v-show="currentTab === 1" class="member-list">
                            <div v-if="unreadMembers.length === 0" class="empty-state">
                                <i class="el-icon-warning"></i>
                                <p>暂无未读成员</p>
                            </div>
                            <virtual-scroller v-else class="scroll-box" :items="unreadMembers">
                                <template v-slot="{ item }">
                                    <group-member-bar :group="group" :member="item"></group-member-bar>
                                </template>
                            </virtual-scroller>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>


<script>
import VirtualScroller from '../common/VirtualScroller.vue';
import GroupMemberBar from '../group/GroupMemberBar.vue';
import Tabs from '../common/Tabs.vue';

export default {
    name: "chatGroupReaded",
    components: {
        VirtualScroller,
        GroupMemberBar,
        Tabs
    },
    data() {
        return {
            show: false,
            pos: {
                x: 0,
                y: 0,
                arrowY: 0
            },
            readedMembers: [],
            unreadMembers: [],
            currentTab: 0
        }
    },
    props: {
        group: {
            type: Object
        },
        groupMembers: {
            type: Array
        },
        msgInfo: {
            type: Object
        }
    },
    computed: {
        tabItems() {
            return [`已读(${this.readedMembers.length})`, `未读(${this.unreadMembers.length})`];
        }
    },
    methods: {
        close() {
            this.show = false;
        },
        onTabChange(index) {
            this.currentTab = index;
        },
        open(rect) {
            this.show = true;
            this.pos.arrowY = 200;
            // 计算窗口位置
            if (this.msgInfo.selfSend) {
                // 自己发的消息弹出在消息的左边
                this.pos.x = rect.left - 300;
            } else {
                // 别人发的消息弹窗在消息右边
                this.pos.x = rect.right + 20;
            }
            this.pos.y = rect.top + rect.height / 2 - 265;
            // 防止窗口溢出
            if (this.pos.y < 0) {
                this.pos.arrowY += this.pos.y
                this.pos.y = 0;
            }
            this.loadReadedUser()
        },
        loadReadedUser() {
            this.readedMembers = [];
            this.unreadMembers = [];
            this.$http({
                url: "/message/group/findReadedUsers",
                method: 'get',
                params: { groupId: this.msgInfo.groupId, messageId: this.msgInfo.id }
            }).then(userIds => {
                this.groupMembers.forEach(member => {
                    // 发送者和已退群的不显示
                    if (member.userId == this.msgInfo.sendId || member.quit) {
                        return;
                    }
                    // 区分已读还是未读
                    if (userIds.find(userId => member.userId == userId)) {
                        this.readedMembers.push(member);
                    } else {
                        this.unreadMembers.push(member);
                    }
                })
                // 更新已读人数
                let msgInfo = {
                    id: this.msgInfo.id,
                    groupId: this.msgInfo.groupId,
                    readedCount: this.readedMembers.length
                }
                let chatInfo = {
                    type: 'GROUP',
                    targetId: this.msgInfo.groupId
                }
                this.chatStore.updateMessage(msgInfo, chatInfo)
            })
        }
    }
}
</script>

<style lang="scss">
.chat-group-readed-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
}

.chat-group-readed {
    position: fixed;
    width: 280px;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: slideIn 0.3s ease-out;

    .readed-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%);
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);

        .header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: var(--im-text-color-primary);

            i {
                color: var(--im-color-primary);
                font-size: 16px;
            }
        }

        .close-btn {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--im-text-color-light);

            &:hover {
                background: rgba(0, 0, 0, 0.08);
                color: var(--im-text-color-primary);
                transform: scale(1.1);
            }

            i {
                font-size: 14px;
            }
        }
    }

    .tabs-container {
        .tab-content {
            padding: 0;
            background: white;

            .member-list {
                position: relative;
                min-height: 300px;

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 200px;
                    color: var(--im-text-color-light);
                    text-align: center;

                    i {
                        font-size: 32px;
                        margin-bottom: 12px;
                        opacity: 0.6;
                    }

                    p {
                        margin: 0;
                        font-size: 14px;
                        font-weight: 500;
                    }
                }

                .scroll-box {
                    height: 300px;
                    padding: 8px 0;
                }
            }
        }
    }
}

// 弹窗进入动画
@keyframes slideIn {
    0% {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>
