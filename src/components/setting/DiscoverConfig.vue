<template>
  <div class="discover-config">
    <div class="form-section">
      <h4 class="section-title">
        <i class="el-icon-s-operation"></i>
        发现页配置
      </h4>

      <div v-if="noPermission" class="no-permission">
        当前账号无权限（请在后端 `im.admin.user-ids` 配置管理员ID）
      </div>

      <div v-else>
        <div class="setting-item">
          <div class="setting-label">
            <i class="el-icon-view"></i>
            <span>显示发现页(tab)</span>
          </div>
          <div class="setting-content">
            <el-switch v-model="form.showDiscover"></el-switch>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <i class="el-icon-link"></i>
            <span>发现页URL</span>
          </div>
          <div class="setting-content url-input">
            <el-input v-model="form.discoverUrl" placeholder="例如：https://example.com/page" clearable></el-input>
          </div>
        </div>

        <div class="actions">
          <el-button type="primary" size="small" :loading="saving" @click="save">保存</el-button>
          <el-button size="small" :disabled="saving" @click="init">刷新</el-button>
        </div>

        <div class="tips">
          <div>说明：</div>
          <div>1) 该配置通过 `/system/config` 下发到 H5/App。</div>
          <div>2) URL 为空时，移动端将使用默认内置地址。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DiscoverConfig",
  data() {
    return {
      noPermission: false,
      saving: false,
      form: {
        showDiscover: true,
        discoverUrl: ''
      }
    }
  },
  methods: {
    init() {
      this.noPermission = false;
      return this.$http({
        url: '/admin/system/config/discover',
        method: 'get'
      }).then((data) => {
        this.form.showDiscover = data && typeof data.showDiscover !== 'undefined' ? data.showDiscover : true;
        this.form.discoverUrl = (data && data.discoverUrl) ? data.discoverUrl : '';
      }).catch(() => {
        this.noPermission = true;
      })
    },
    save() {
      this.saving = true;
      this.noPermission = false;
      const payload = {
        showDiscover: this.form.showDiscover,
        discoverUrl: this.form.discoverUrl
      }
      this.$http({
        url: '/admin/system/config/discover',
        method: 'put',
        data: payload
      }).then(() => {
        this.$message.success('保存成功');
      }).catch(() => {
        this.noPermission = true;
      }).finally(() => {
        this.saving = false;
      })
    }
  }
}
</script>

<style scoped lang="scss">
.discover-config {
  padding: 15px;
  background: #fafbfc;
  min-height: 400px;

  .form-section {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;

    .section-title {
      margin: 0 0 15px 0;
      font-size: var(--im-font-size-larger);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f5f5f5;

      i {
        color: var(--im-color-primary);
        font-size: 16px;
      }
    }
  }

  .no-permission {
    padding: 12px;
    border: 1px solid #fde2e2;
    background: #fef0f0;
    color: #f56c6c;
    border-radius: 6px;
  }

  .setting-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .setting-label {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      width: 140px;
      font-weight: 500;
      color: var(--im-text-color-light);
      font-size: var(--im-font-size);

      i {
        color: var(--im-color-primary);
        font-size: var(--im-font-size-large);
      }
    }

    .setting-content {
      flex: 2;
      display: flex;
      justify-content: flex-end;
    }

    .url-input {
      justify-content: flex-start;
    }
  }

  .actions {
    padding-top: 12px;
    display: flex;
    gap: 10px;
  }

  .tips {
    margin-top: 12px;
    font-size: 12px;
    color: #888;
    line-height: 18px;
  }
}
</style>
