<template>
    <div class="electron-menu" v-if="configStore.electronMode">
        <div class="drag-ctrl"></div>
        <div class="icon iconfont icon-minimize" @click="onMinimize()"> </div>
        <div v-if="isShowMaximize && isFullScreen" class="icon iconfont icon-unmaximize" @click="onUnmaximize()"></div>
        <div v-if="isShowMaximize && !isFullScreen" class="icon iconfont icon-maximize" @click="onMaximize()"></div>
        <div class="icon iconfont icon-close" @click="onClose()"> </div>
    </div>
</template>
<script>
import configStore from '../../store/configStore';
import useConfigStore from '../../store/configStore'
export default {
    name: "electronMenu",
    data() {
        return {
        }
    },
    methods: {
        sendEvent(eventName) {
            if (window.electronAPI && window.electronAPI.sendEvent) {
                try {
                    window.electronAPI.sendEvent(eventName);
                    console.log(`[ElectronMenu] Sent event: ${eventName}`);
                } catch (error) {
                    console.error(`[ElectronMenu] Failed to send event "${eventName}":`, error);
                }
            } else {
                console.error(`[ElectronMenu] window.electronAPI not available! Cannot send "${eventName}"`);
                console.error('[ElectronMenu] window.electronAPI:', window.electronAPI);
                console.error('[ElectronMenu] navigator.userAgent:', navigator.userAgent);
            }
        },
        onMinimize() {
            this.sendEvent('minimize');
        },
        onUnmaximize() {
            this.configStore.setFullScreen(false);
            this.sendEvent('unmaximize');
        },
        onMaximize() {
            this.configStore.setFullScreen(true);
            this.sendEvent('maximize');
        },
        onClose() {
            this.sendEvent('close');
        }
    },
    computed: {
        isFullScreen() {
            return useConfigStore().fullScreen;
        },
        isShowMaximize() {
            // 登录和注册也不需要最大化按钮
            return this.$route.name != 'Login' && this.$route.name != 'Register' && this.$route.name != 'ResetPwd'
        }
    }
}
</script>
<style scoped lang="scss">
.electron-menu {
    position: fixed;
    top: 0;
    display: flex;
    width: 100%;
    height: 25px;
    z-index: 9;
    align-items: center;


    .drag-ctrl {
        flex: 1;
        height: 100%;
        -webkit-app-region: drag;
        cursor: move;
    }

    .icon {
        margin: 0 8px;
        color: var(--im-text-color);
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        padding: 2px;
        border-radius: 5px;
        &:hover {
            background: #ddd;
        }
    }
}
</style>
