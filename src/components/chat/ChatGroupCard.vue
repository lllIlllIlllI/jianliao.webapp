<template>
    <div class="chat-group-card" @click.stop="onShowGroupInfo">
        <div class="card-body">
            <head-image :url="cardInfo.headImage" :name="cardInfo.groupName" radius="10%"></head-image>
            <div class="nick-name">
                {{ cardInfo.groupName }}
            </div>
        </div>
        <div class="card-footer">
            <div class="tip">群名片</div>
            <el-tag v-if="isExpired" type="warning">已过期</el-tag>
        </div>
    </div>
</template>
<script>
import HeadImage from '../common/HeadImage.vue'

export default {
    name: "chatUserCard",
    components: {
        HeadImage
    },
    props: {
        sendTime: {
            type: Number,
            default: null
        },
        cardInfo: {
            type: Object
        }
    },
    data() {
        return {}
    },
    methods: {
        onShowGroupInfo(e) {
            if (this.isExpired) {
                this.$message.warning("该名片已过期")
                return;
            }
            this.$http({
                url: `/group/find/${this.cardInfo.groupId}`,
                method: 'get'
            }).then(group => {
                let pos = {
                    x: e.x + 30,
                    y: e.y
                }
                this.$eventBus.$emit("openGroupInfo", group, pos);
            })
        }
    },
    computed: {
        isExpired() {
            // 7天后过期
            return new Date().getTime() - this.sendTime > 7 * 24 * 3600 * 1000
        }
    }
}
</script>
<style scoped lang="scss">
.chat-group-card {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    background: white;
    border-radius: 12px;
    padding: 12px 16px;
    height: 90px;
    width: 200px;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    text-align: left;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: rgba(64, 158, 255, 0.2);
    }

    .card-body {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        padding-bottom: 8px;

        .nick-name {
            flex: 1;
            font-weight: 600;
            font-size: 15px;
            color: var(--im-text-color-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
        }
    }

    .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 6px;
        width: 100%;
        color: var(--im-text-color-light);
        font-size: 12px;
        text-align: left;

        .tip {
            flex: 1;
            font-weight: 500;
            color: var(--im-text-color-light);
            display: flex;
            align-items: center;
            gap: 4px;

            &::before {
                content: '';
                width: 4px;
                height: 4px;
                background: var(--im-color-primary);
                border-radius: 50%;
                opacity: 0.6;
            }
        }
    }
}
</style>
