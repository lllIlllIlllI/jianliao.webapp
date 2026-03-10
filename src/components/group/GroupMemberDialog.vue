<template>
  <el-dialog title="群成员" :visible.sync="isShow" width="70%" :close-on-click-modal="false" @close="onClose">
    <div class="members-dialog-content">
      <div class="member-tools-bar">
        <div class="member-tools">
          <div class="tool-btn" title="邀请好友进群聊" @click="onInviteMember">
            <i class="el-icon-plus"></i>
          </div>
          <div class="tool-text">邀请</div>
        </div>
        <div class="member-tools" v-if="isOwner || isManager">
          <div class="tool-btn" title="选择成员移出群聊" @click="onRemoveMember">
            <i class="el-icon-minus"></i>
          </div>
          <div class="tool-text">移除</div>
        </div>
        <div class="member-tools" v-if="isOwner || isManager">
          <div class="tool-btn" title="禁言" @click="onMuted">
            <span class="icon iconfont icon-chat-muted" style="font-size: 16px"></span>
          </div>
          <div class="tool-text">禁言</div>
        </div>
        <div class="member-tools" v-if="isOwner || isManager">
          <div class="tool-btn" title="解除禁言" @click="onUnmuted">
            <span class="icon iconfont icon-chat-unmuted" style="font-size: 16px"></span>
          </div>
          <div class="tool-text">解除禁言</div>
        </div>
      </div>
      <div class="member-list-container" @scroll="onScroll">
        <div class="member-items">
          <div v-for="(member, idx) in showMembers" :key="member.id">
            <group-member-item v-if="idx < showMaxIdx" class="member-item" :group="group" :groupMembers="groupMembers"
              :member="member" type="card"></group-member-item>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import GroupMemberItem from './GroupMemberItem.vue';

export default {
  name: "GroupMemberDialog",
  components: {
    GroupMemberItem
  },
  props: {
    group: {
      type: Object,
      required: true
    },
    groupMembers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isShow: false,
      showMaxIdx: 50
    };
  },
  computed: {
    mine() {
      return this.userStore.userInfo;
    },
    isOwner() {
      return this.group.ownerId == this.mine.id;
    },
    isManager() {
      let userId = this.mine.id;
      let m = this.groupMembers.find((m) => m.userId == userId);
      return m && m.isManager;
    },
    showMembers() {
      return this.groupMembers.filter((m) => !m.quit);
    }
  },
  methods: {
    open() {
      this.isShow = true;
    },
    close() {
      this.isShow = false;
    },
    onClose() {
      this.$emit('close');
    },
    onScroll(e) {
      const container = e.target;
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 30) {
        this.loadMoreMembers();
      }
    },
    onInviteMember() {
      this.$emit('invite-member');
    },
    onRemoveMember() {
      this.$emit('remove-member');
    },
    onMuted() {
      this.$emit('muted');
    },
    onUnmuted() {
      this.$emit('unmuted');
    },
    loadMoreMembers() {
      if (this.showMaxIdx < this.showMembers.length) {
        this.showMaxIdx += 50;
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.members-dialog-content {
  .member-tools-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-bottom: 20px;
    padding: 16px;
    background: var(--im-background-active);
    border-radius: 8px;

    .member-tools {
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.3s ease;
      cursor: pointer;
      padding: 8px;
      border-radius: 12px;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
        transform: translateY(-2px);
      }

      .tool-btn {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--im-background-active);
        border: none;
        font-size: 20px;
        cursor: pointer;
        border-radius: 12px;
        transition: all 0.3s ease;
        color: var(--im-color-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        &:hover {
          background: var(--im-color-primary-light-2);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
      }

      .tool-text {
        font-size: 12px;
        text-align: center;
        margin-top: 8px;
        color: var(--im-text-color-secondary);
        font-weight: 500;
        white-space: nowrap;
      }
    }
  }

  .member-list-container {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .member-items {
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 16px;

    .member-item {
      transition: all 0.3s ease;
      border-radius: 8px;
      padding: 6px;
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(255, 255, 255, 0.9);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border-color: var(--im-color-primary-light-3);
      }
    }
  }
}
</style>
