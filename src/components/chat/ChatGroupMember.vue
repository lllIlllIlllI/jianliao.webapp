<template>
    <div class="chat-group-member">
        <div class="member-card-container">
            <div class="header">
                <div class="header-content">
                    <i class="el-icon-back back-btn" @click="onBack()" title="返回"></i>
                    <h3 class="title">群聊成员</h3>
                    <span class="member-count">{{ groupMembers.length }}人</span>
                </div>
            </div>
            
            <div v-show="!group.quit" class="search-section">
                <div class="search-box">
                    <el-input 
                        placeholder="搜索群成员" 
                        v-model="searchText" 
                        size="small"
                        clearable>
                        <i class="el-icon-search el-input__icon" slot="prefix"></i>
                    </el-input>
                </div>
            </div>
            
            <div class="member-list">
                <virtual-scroller class="scroll-box" :items="showMembers">
                    <template v-slot="{ item }">
                        <group-member-item 
                            :member="item" 
                            :group="group" 
                            :groupMembers="groupMembers"
                            @click.native="onShowUserInfo($event, item)">
                        </group-member-item>
                    </template>
                </virtual-scroller>
            </div>
        </div>
    </div>
</template>
<script>
import VirtualScroller from '../common/VirtualScroller.vue';
import GroupMemberItem from '../group/GroupMemberItem.vue';

export default {
    name: "chatGroupMember",
    components: { VirtualScroller, GroupMemberItem },
    props: {
        group: {
            type: Object
        },
        groupMembers: {
            type: Array
        }
    },
    data() {
        return {
            searchText: ""
        }
    },
    methods: {
        onBack() {
            this.$emit('back')
        },
        onShowUserInfo(e, member) {
            this.$http({
                url: `/user/find/${member.userId}`,
                method: 'get'
            }).then(user => {
                let pos = {
                    x: e.x + 30,
                    y: e.y
                }
                this.$eventBus.$emit("openUserInfo", user, pos);
            })
        }
    },
    computed: {
        showMembers() {
            return this.groupMembers.filter(m => m.showNickName.includes(this.searchText))
        }
    }
}
</script>
<style lang="scss" scoped>
.chat-group-member {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

    .member-card-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        box-sizing: border-box;
    }

    .header {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);

        .header-content {
            display: flex;
            align-items: center;
            gap: 12px;

            .back-btn {
                font-size: 18px;
                color: var(--im-color-primary);
                cursor: pointer;
                padding: 12px;
                border-radius: 50%;
                transition: all 0.3s ease;

                &:hover {
                    background: var(--im-background-active);
                    transform: translateX(-2px);
                }
            }

            .title {
                margin: 0;
                font-size: var(--im-font-size-large);
                font-weight: 600;
                color: var(--im-text-color);
                flex: 1;
            }

            .member-count {
                font-size: var(--im-font-size-small);
                color: var(--im-text-color-light);
                background: var(--im-background-active-dark);
                padding: 4px 8px;
                border-radius: 12px;
                font-weight: 500;
            }
        }
    }

    .search-section {
        padding: 16px 20px;
    }

    .member-list {
        flex: 1;
        padding: 0 10px 10px;
        overflow: hidden;

        .scroll-box {
            height: 100%;
        }
    }
}
</style>
