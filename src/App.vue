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
    const configStore = useConfigStore();

    // 方式1: 直接通过 electronAPI 检测（正常路径）
    if (window.electronAPI) {
      console.log('[App] electronAPI available');
      configStore.setElectronMode(true)
      window.electronAPI.invoke('isFullScreen').then(fullScreen => {
        configStore.setFullScreen(fullScreen);
      })
    }
    // 方式2: 兜底方案 - 通过 userAgent 检测是否在 Electron 中
    else if (/electron/i.test(navigator.userAgent)) {
      console.warn('[App] Electron detected via userAgent, but window.electronAPI not available');
      configStore.setElectronMode(true)
      // 尝试延迟再次检查 electronAPI（可能是加载延迟）
      setTimeout(() => {
        if (window.electronAPI && window.electronAPI.invoke) {
          console.log('[App] electronAPI available after delay');
          window.electronAPI.invoke('isFullScreen').then(fullScreen => {
            configStore.setFullScreen(fullScreen);
          })
        } else {
          console.warn('[App] electronAPI still not available after delay');
        }
      }, 500)
    } else {
      console.log('[App] Not in Electron environment');
    }

    // 监听路由变化，通知主进程调整窗口大小
    this.$router.afterEach((to) => {
      const routeName = to.name || '';
      const routePath = to.path || '';
      const routeFullPath = to.fullPath || '';

      console.log('[App] Route changed:', { name: routeName, path: routePath, fullPath: routeFullPath });

      // 通过IPC通知主进程
      if (window.electronAPI && window.electronAPI.sendEvent) {
        try {
          window.electronAPI.sendEvent('routeChange', routePath);
          console.log('[App] ✓ Sent routeChange event:', routePath);
        } catch (error) {
          console.error('[App] ✗ Failed to send routeChange:', error);
        }
      } else {
        console.warn('[App] electronAPI not available for routeChange');
      }
    });
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
