<template>
  <div class="landing-page">
    <section class="hero">
      <h1>简聊IM 产品能力</h1>
      <p>面向社交沟通与企业协作的即时通讯平台，支持端对端加密、语音视频、群组与多端同步。</p>
      <div class="actions">
        <router-link class="btn primary" to="/register">立即注册</router-link>
        <router-link class="btn" to="/login">登录体验</router-link>
      </div>
    </section>

    <section class="grid">
      <article class="card">
        <h2>安全通信</h2>
        <p>支持端对端加密与多重账号安全机制，保障消息传输与账号访问安全。</p>
      </article>
      <article class="card">
        <h2>高效沟通</h2>
        <p>支持私聊、群聊、消息回执与会话管理，满足日常协作与业务沟通场景。</p>
      </article>
      <article class="card">
        <h2>音视频能力</h2>
        <p>支持语音视频聊天与多人互动，覆盖远程协作、客户沟通与在线交流。</p>
      </article>
      <article class="card">
        <h2>多端同步</h2>
        <p>覆盖 Web 与多终端接入，消息实时同步，随时随地保持在线。</p>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: "ProductLanding"
}
</script>

<style scoped lang="scss">
.landing-page {
  height: 100%;
  overflow: auto;
  padding: 48px 20px 36px;
  background: linear-gradient(160deg, #f8fbff 0%, #eef5ff 45%, #ffffff 100%);
  color: #2c3e50;
}

.hero {
  margin: 0 auto;
  max-width: 920px;
  text-align: center;
}

.hero h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
}

.hero p {
  margin: 16px auto 0;
  max-width: 760px;
  font-size: 16px;
  color: #4d5f73;
}

.actions {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn {
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid #c9d9ec;
  color: #2d4b6a;
  background: #fff;
  padding: 10px 18px;
  font-weight: 600;
}

.btn.primary {
  background: var(--im-color-primary);
  border-color: var(--im-color-primary);
  color: #fff;
}

.grid {
  margin: 28px auto 0;
  max-width: 980px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.card {
  background: #fff;
  border: 1px solid #e6eef9;
  border-radius: 12px;
  padding: 16px 14px;
  box-shadow: 0 8px 20px rgba(18, 60, 110, 0.06);
}

.card h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

.card p {
  margin: 0;
  color: #5d7085;
  line-height: 1.7;
}
</style>
