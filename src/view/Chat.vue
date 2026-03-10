<template>
  <el-container class="chat-page">
    <resizable-aside :default-width="260" :min-width="200" :max-width="500" storage-key="chat-aside-width">
      <div class="header" :class="configStore.electronMode ? 'header-menu-wrap' : ''">
        <el-input class="search-text" size="small" placeholder="搜索" v-model="searchText">
          <i class="el-icon-search el-input__icon" slot="prefix"> </i>
        </el-input>
      </div>
      <div class="chat-loading" v-if="loading" v-loading="true" element-loading-text="消息接收中..."
        element-loading-spinner="el-icon-loading" element-loading-background="#F9F9F9" element-loading-size="24">
      </div>
      <virtual-scroller class="scroll-box" :items="showChats">
        <template v-slot="{ item }">
          <chat-item :chat="item" @click.native="onActiveItem(item)" @delete="onDelItem(item)"
            @info="onShowInfo(item)" @dnd="onDnd(item)" @top="onTop(item)"
            :active="item === chatStore.activeChat"></chat-item>
        </template>
      </virtual-scroller>
    </resizable-aside>
    <el-container class="chat-box">
      <chat-box v-if="activeChat && activeChat.type != 'SYSTEM'" :chat="activeChat"></chat-box>
      <chat-system-box v-if="activeChat && activeChat.type == 'SYSTEM'" :chat="activeChat"></chat-system-box>
    </el-container>
  </el-container>
</template>

<script>
import ChatItem from "../components/chat/ChatItem.vue";
import ChatBox from "../components/chat/ChatBox.vue";
import ChatSystemBox from "../components/chat/ChatSystemBox.vue";
import ResizableAside from "../components/common/ResizableAside.vue";
import VirtualScroller from "../components/common/VirtualScroller.vue";
export default {
  name: "chat",
  components: {
    ChatItem,
    ChatBox,
    ChatSystemBox,
    ResizableAside,
    VirtualScroller
  },
  data() {
    return {
      searchText: "",
      messageContent: "",
      group: {},
      groupMembers: []
    }
  },
  methods: {
    onActiveItem(chat) {
      this.chatStore.setActiveChat(chat);
    },
    onDelItem(chat) {
      this.chatStore.removeChat(chat);
    },
    onShowInfo(chat) {
      if (chat.type == 'PRIVATE') {
        this.$router.push("/home/friend?id=" + chat.targetId);
      } else if (chat.type == 'GROUP') {
        if (!this.groupStore.isGroup(chat.targetId)) {
          this.$message.error("您已不在群聊中，无法查看群资料")
          return;
        }
        this.$router.push("/home/group?id=" + chat.targetId);
      }
    },
    onDnd(chat) {
      if (chat.type == 'PRIVATE') {
        this.setFriendDnd(chat, chat.targetId, !chat.isDnd)
      } else {
        this.setGroupDnd(chat, chat.targetId, !chat.isDnd)
      }
    },
    setFriendDnd(chat, friendId, isDnd) {
      let formData = {
        friendId: friendId,
        isDnd: isDnd
      }
      this.$http({
        url: '/friend/dnd',
        method: 'put',
        data: formData
      }).then(() => {
        this.friendStore.setDnd(friendId, isDnd)
        this.chatStore.setDnd(chat, isDnd)
      })
    },
    setGroupDnd(chat, groupId, isDnd) {
      let formData = {
        groupId: groupId,
        isDnd: isDnd
      }
      this.$http({
        url: '/group/dnd',
        method: 'put',
        data: formData
      }).then(() => {
        this.groupStore.setDnd(groupId, isDnd)
        this.chatStore.setDnd(chat, isDnd)
      })
    },
    onTop(chat) {
      if (chat.type == 'PRIVATE') {
        this.setFriendTop(chat, chat.targetId, !chat.isTop)
      } else {
        this.setGroupTop(chat, chat.targetId, !chat.isTop)
      }
    },
    setFriendTop(chat, friendId, isTop) {
      let formData = {
        friendId: friendId,
        isTop: isTop
      }
      this.$http({
        url: '/friend/top',
        method: 'put',
        data: formData
      }).then(() => {
        this.friendStore.setTop(friendId, isTop)
        this.chatStore.setTop(chat, isTop)
      })
    },
    setGroupTop(chat, groupId, isTop) {
      let formData = {
        groupId: groupId,
        isTop: isTop
      }
      this.$http({
        url: '/group/top',
        method: 'put',
        data: formData
      }).then(() => {
        this.groupStore.setTop(groupId, isTop)
        this.chatStore.setTop(chat, isTop)
      })
    },
    isShowChat(chat) {
      return !this.searchText || chat.showName.includes(this.searchText)
    },
  },
  computed: {
    activeChat() {
      return this.chatStore.activeChat;
    },
    loading() {
      return this.chatStore.loading
    },
    showChats() {
      return this.chatStore.chats.filter(chat => this.isShowChat(chat));
    }
  }
}
</script>

<style lang="scss">
.chat-page {
  .header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 12px;
  }

  .chat-loading {
    height: 50px;
    background-color: #eee;

    .el-icon-loading {
      font-size: 24px;
      color: var(--im-text-color-light);
    }

    .el-loading-text {
      color: var(--im-text-color-light);
    }

    .chat-loading-box {
      height: 100%;
    }
  }

  .chat-items {
    flex: 1;
  }
}
</style>
