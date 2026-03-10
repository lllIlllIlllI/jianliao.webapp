<template>
  <div id="app">
    <electron-menu></electron-menu>
    <router-view></router-view>
  </div>
</template>

<script>
import ElectronMenu from './components/common/ElectronMenu.vue';
import useConfigStore from './store/configStore';


export default {
  name: 'App',
  components: { ElectronMenu },
  mounted() {
    if (window.electronAPI) {
      const configStore = useConfigStore();
      // 标记是否客户端模式
      configStore.setElectronMode(true)
      // 监听客户端的全屏/退出事件
      window.electronAPI.invoke('isFullScreen').then(fullScreen => {
        configStore.setFullScreen(fullScreen);
      })
    }
  }
}
</script>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: absolute;
  height: 100%;
  width: 100%;
  color: var(--im-text-color);
  font-family: var(--im-font-family);
}
</style>
