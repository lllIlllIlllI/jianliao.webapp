<template>
  <el-container class="setting-page">
    <!-- 左侧导航 -->
    <el-aside width="230px" class="setting-aside" :class="{ fullscreen: configStore.fullScreen }">
      <div class="nav-menu" >
        <div v-for="(item, index) in visibleMenuItems" :key="index" class="nav-item"
          :class="{ active: currentTab === index }" @click="switchTab(index)">
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </el-aside>

    <!-- 右侧内容区域 -->
    <el-container class="setting-main">
      <div class="content-wrapper" :class="configStore.electronMode ? 'header-menu-wrap' : ''">
        <!-- 个人资料 -->
        <div v-show="currentTab === 0" class="tab-content">
          <personal-info ref="personalInfo" @switch-tab="onSwitchTab"></personal-info>
        </div>

        <!-- 用户设置 -->
        <div v-show="currentTab === 1" class="tab-content">
          <user-config ref="userConfig"></user-config>
        </div>

        <!-- 绑定手机 -->
        <div v-show="currentTab === 2" class="tab-content">
          <bind-phone ref="bindPhone"></bind-phone>
        </div>

        <!-- 绑定邮箱 -->
        <div v-show="currentTab === 3" class="tab-content">
          <bind-email ref="bindEmail"></bind-email>
        </div>

        <!-- 修改密码 -->
        <div v-show="currentTab === 4" class="tab-content">
          <modify-password ref="modifyPassword"></modify-password>
        </div>

        <!-- 实名认证 -->
        <div v-show="currentTab === 5" class="tab-content">
          <realname-auth ref="realnameAuth"></realname-auth>
        </div>
      </div>
    </el-container>
  </el-container>
</template>

<script>
import ModifyPassword from '../components/setting/ModifyPassword.vue';
import PersonalInfo from '../components/setting/PersonalInfo.vue';
import UserConfig from '../components/setting/UserConfig.vue';
import BindPhone from '../components/setting/BindPhone.vue';
import BindEmail from '../components/setting/BindEmail.vue';
import RealnameAuth from '../components/setting/RealnameAuth.vue';

export default {
  name: "SettingPage",
  components: {
    PersonalInfo,
    UserConfig,
    BindPhone,
    BindEmail,
    ModifyPassword,
    RealnameAuth
  },
  data() {
    return {
      currentTab: 0,
      menuItems: [
        {
          label: '个人资料',
          icon: 'el-icon-user',
          component: 'personalInfo'
        },
        {
          label: '用户设置',
          icon: 'el-icon-setting',
          component: 'userConfig'
        },
        {
          label: '绑定手机',
          icon: 'el-icon-mobile-phone',
          component: 'bindPhone'
        },
        {
          label: '绑定邮箱',
          icon: 'el-icon-message',
          component: 'bindEmail'
        },         {
          label: '修改密码',
          icon: 'el-icon-lock',
          component: 'modifyPassword'
        },
        {
          label: '实名认证',
          icon: 'el-icon-postcard',
          component: 'realnameAuth'
        }
        
      ]
    }
  },
  computed: {
    visibleMenuItems() {
      return this.menuItems.filter(item => !item.show || item.show());
    }
  },
  mounted() {
    this.init();
    // 监听来自UserProfileCard的切换事件
    this.$eventBus.$on('switchToPersonalInfo', () => {
      this.switchTab(0); // 切换到个人资料tab (index 0)
    });
  },
  methods: {
    init() {
      // 根据路由参数设置当前tab
      const tab = this.$route.query.tab;
      if (tab) {
        this.currentTab = parseInt(tab);
      }
      this.$nextTick(() => this.onClickTab());
    },
    switchTab(index) {
      this.currentTab = index;
      this.$nextTick(() => this.onClickTab());
    },
    onClickTab() {
      const componentMap = {
        0: 'personalInfo',
        1: 'userConfig',
        2: 'bindPhone',
        3: 'bindEmail',
        4: 'modifyPassword',
        5: 'realnameAuth'
      };

      const componentName = componentMap[this.currentTab];
      if (componentName && this.$refs[componentName] && this.$refs[componentName].init) {
        this.$refs[componentName].init();
      }
    },
    onSwitchTab(tabIndex) {
      this.currentTab = parseInt(tabIndex);
      this.$nextTick(() => this.onClickTab());
    }
  },
  beforeDestroy() {
    // 移除事件监听，避免内存泄漏
    this.$eventBus.$off('switchToPersonalInfo');
  }
}
</script>

<style lang="scss" scoped>
.setting-page {
  height: 100vh;
  background: #f5f6fa;

  .setting-aside {
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
    background: white;

    &.fullscreen {
      width: 260px !important;

      @media (min-width: 1200px) {
        width: 290px !important;
      }
    }

    .nav-menu {

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #666;
        font-weight: 500;
        border-left: 3px solid transparent;
        margin: 2px 0;

        &:hover {
          background: var(--im-background-active);
          color: var(--im-color-primary);
        }

        &.active {
          background: var(--im-background-active-dark);
          color: var(--im-color-primary);
          border-left-color: var(--im-color-primary);
          font-weight: 600;
        }

        i {
          font-size: 18px;
          width: 20px;
          text-align: center;
        }

        span {
          font-size: 14px;
        }
      }
    }
  }

  .setting-main {
    background: #fcfdff;
    overflow: hidden;

    .content-wrapper {
      height: 100%;
      overflow-y: auto;
      width: 100%;

      .tab-content {
        height: 100%;
        overflow-y: auto;
        padding: 0;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
