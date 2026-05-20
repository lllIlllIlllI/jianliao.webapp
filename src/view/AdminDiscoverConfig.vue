<template>
  <div class="admin-discover-config-page">
    <div class="page-header">
      <div class="title">系统配置 / 发现页</div>
      <div class="desc">控制移动端底部“发现”菜单是否显示，以及发现页打开的 URL。</div>
    </div>
    <discover-config ref="discoverConfig"></discover-config>
  </div>
</template>

<script>
import DiscoverConfig from '../components/setting/DiscoverConfig.vue';

export default {
  name: "AdminDiscoverConfigPage",
  components: {
    DiscoverConfig
  },
  mounted() {
    if (this.$refs.discoverConfig && this.$refs.discoverConfig.init) {
      this.$refs.discoverConfig.init();
    }
  }
}
</script>

<style scoped lang="scss">
.admin-discover-config-page {
  padding: 15px;

  .page-header {
    background: white;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 12px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .title {
      font-weight: 600;
      font-size: 16px;
      color: #333;
      margin-bottom: 6px;
    }

    .desc {
      font-size: 12px;
      color: #888;
      line-height: 18px;
    }
  }
}
</style>
