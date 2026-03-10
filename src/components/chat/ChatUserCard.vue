<template>
    <div class="chat-user-card" @click.stop="onShowUserInfo">
        <div class="card-body">
            <head-image :url="cardInfo.headImage" :name="cardInfo.nickName" radius="10%"></head-image>
            <div class="nick-name">
                {{ cardInfo.nickName }}
            </div>
        </div>
        <div class="card-tip">个人名片</div>
    </div>
</template>
<script>
import HeadImage from '../common/HeadImage.vue';

export default {
    name: "chatUserCard",
    components: {
        HeadImage
    },
    props: {
        cardInfo: {
            type: Object
        }
    },
    data() {
        return {}
    },
    methods: {
        onShowUserInfo(e) {
            this.$http({
                url: `/user/find/${this.cardInfo.userId}`,
                method: 'get'
            }).then(user => {
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
.chat-user-card {
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

    .card-tip {
        margin-top: 6px;
        color: var(--im-text-color-light);
        font-size: 12px;
        text-align: left;
        font-weight: 500;
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
</style>
