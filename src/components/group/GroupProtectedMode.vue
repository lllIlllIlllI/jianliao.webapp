<template>
  <div class="group-protected-mode">
    <div class="section-title">保护模式</div>
    <div class="setting-item">
      <div class="setting-label">
        <span class="label-text">启用保护模式</span>
        <span class="label-desc">启用后，普通成员无法邀请新成员</span>
      </div>
      <el-switch v-model="isProtectedMode" @change="onProtectedModeChange" :disabled="!isOwner"></el-switch>
    </div>

    <!-- 白名单管理 -->
    <div v-if="isProtectedMode && isOwner" class="whitelist-section">
      <div class="whitelist-header">
        <span class="whitelist-title">白名单成员</span>
        <el-button type="primary" size="small" @click="onAddWhitelist">添加</el-button>
      </div>
      <div v-if="whitelist.length > 0" class="whitelist-items">
        <div v-for="item in whitelist" :key="item.id" class="whitelist-item">
          <img :src="item.headImage" class="avatar" :alt="item.userNickName">
          <span class="nickname">{{ item.userNickName }}</span>
          <i class="el-icon-close" @click="onRemoveWhitelist(item.id)"></i>
        </div>
      </div>
      <div v-else class="empty-tip">暂无白名单成员</div>
    </div>

    <!-- 添加白名单对话框 -->
    <el-dialog title="添加白名单成员" :visible.sync="showAddWhitelistDialog" width="500px">
      <div class="add-whitelist-dialog">
        <el-input placeholder="搜索成员" v-model="searchText" size="small">
          <i class="el-icon-search el-input__icon" slot="suffix"></i>
        </el-input>
        <el-scrollbar style="height: 300px; margin-top: 10px;">
          <div v-for="member in filterMembers" :key="member.userId">
            <div class="member-item" @click="onSelectMember(member)">
              <img :src="member.headImage" class="avatar" :alt="member.showNickName">
              <span class="nickname">{{ member.showNickName }}</span>
              <el-checkbox v-model="member.checked" @click.native.stop=""></el-checkbox>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddWhitelistDialog = false">取消</el-button>
        <el-button type="primary" @click="onConfirmAddWhitelist">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GroupProtectedMode',
  props: {
    group: {
      type: Object,
      required: true
    },
    groupMembers: {
      type: Array,
      default: () => []
    },
    isOwner: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isProtectedMode: false,
      whitelist: [],
      showAddWhitelistDialog: false,
      searchText: '',
      selectedMembers: []
    }
  },
  computed: {
    filterMembers() {
      return this.groupMembers
        .filter(m => !m.quit && m.userId !== this.group.ownerId)
        .filter(m => m.showNickName.includes(this.searchText))
        .map(m => ({
          ...m,
          checked: this.selectedMembers.some(sm => sm.userId === m.userId)
        }))
    }
  },
  watch: {
    group: {
      handler(newVal) {
        if (newVal) {
          this.isProtectedMode = newVal.isProtectedMode || false
          this.loadWhitelist()
        }
      },
      immediate: true
    }
  },
  methods: {
    onProtectedModeChange(value) {
      const data = {
        groupId: this.group.id,
        isProtectedMode: value
      }
      this.$http({
        url: '/group/protectedMode',
        method: 'PUT',
        data: data
      }).then(() => {
        this.$message.success(value ? '已启用保护模式' : '已关闭保护模式')
        this.$emit('update', { isProtectedMode: value })
      }).catch(() => {
        this.isProtectedMode = !value
        this.$message.error('操作失败，请重试')
      })
    },
    loadWhitelist() {
      this.$http({
        url: `/group/whitelist/${this.group.id}`,
        method: 'GET'
      }).then(data => {
        this.whitelist = data || []
      }).catch(() => {
        this.whitelist = []
      })
    },
    onAddWhitelist() {
      this.searchText = ''
      this.selectedMembers = []
      this.showAddWhitelistDialog = true
    },
    onSelectMember(member) {
      const index = this.selectedMembers.findIndex(m => m.userId === member.userId)
      if (index > -1) {
        this.selectedMembers.splice(index, 1)
      } else {
        this.selectedMembers.push(member)
      }
    },
    onConfirmAddWhitelist() {
      if (this.selectedMembers.length === 0) {
        this.$message.warning('请选择要添加的成员')
        return
      }
      const data = {
        groupId: this.group.id,
        userIds: this.selectedMembers.map(m => m.userId)
      }
      this.$http({
        url: '/group/whitelist/add',
        method: 'POST',
        data: data
      }).then(() => {
        this.$message.success('添加成功')
        this.showAddWhitelistDialog = false
        this.loadWhitelist()
      }).catch(() => {
        this.$message.error('添加失败，请重试')
      })
    },
    onRemoveWhitelist(whitelistId) {
      const item = this.whitelist.find(w => w.id === whitelistId)
      if (!item) return

      this.$confirm(`确认移除 ${item.userNickName} 的白名单吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = {
          groupId: this.group.id,
          userIds: [item.userId]
        }
        this.$http({
          url: '/group/whitelist/remove',
          method: 'DELETE',
          data: data
        }).then(() => {
          this.$message.success('移除成功')
          this.loadWhitelist()
        }).catch(() => {
          this.$message.error('移除失败，请重试')
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.group-protected-mode {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 20px;

  .section-title {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    .setting-label {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .label-text {
        font-size: 14px;
        color: #333;
      }

      .label-desc {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .whitelist-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;

    .whitelist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .whitelist-title {
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
    }

    .whitelist-items {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .whitelist-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #f5f5f5;
        border-radius: 4px;
        font-size: 12px;

        .avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .nickname {
          color: #333;
        }

        .el-icon-close {
          cursor: pointer;
          color: #999;
          font-size: 12px;

          &:hover {
            color: #f56c6c;
          }
        }
      }
    }

    .empty-tip {
      color: #999;
      font-size: 12px;
      text-align: center;
      padding: 20px;
    }
  }
}

.add-whitelist-dialog {
  .member-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .nickname {
      flex: 1;
      font-size: 14px;
      color: #333;
    }
  }
}
</style>
