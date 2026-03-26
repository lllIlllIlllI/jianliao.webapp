<template>
  <div class="landing-page">
    <section class="hero">
      <h1>企业即时通讯平台（私有化IM）</h1>
      <p>简聊IM聚焦“安全可控、轻量部署、稳定连接”，支持私有化部署、消息与文件加密、多端同步与开放集成，帮助企业构建自有通信底座。</p>
      <div class="actions">
        <router-link class="btn" to="/">进入主页</router-link>
        <router-link class="btn primary" to="/register">立即注册</router-link>
        <router-link class="btn" to="/login">登录体验</router-link>
      </div>
    </section>

    <section class="grid">
      <article class="card">
        <h2>私有部署与数据主权</h2>
        <p>支持私有化部署与专网接入，消息、文件、组织数据可由企业自主管理，满足高安全与合规场景。</p>
      </article>
      <article class="card">
        <h2>安全通信能力</h2>
        <p>支持通信链路加密、文件存储保护、登录风控与权限控制，降低敏感信息泄露风险。</p>
      </article>
      <article class="card">
        <h2>稳定可靠与弱网可用</h2>
        <p>针对高并发和弱网环境优化消息通道，支持消息送达与多终端漫游，保障沟通连续性。</p>
      </article>
      <article class="card">
        <h2>开放集成能力</h2>
        <p>提供 SDK、REST API 与 Webhook，可对接OA、CRM、工单、审批等业务系统，实现统一协同入口。</p>
      </article>
    </section>

    <section class="topics">
      <router-link class="topic-link" to="/im-sdk">IM SDK 与开放接口</router-link>
      <router-link class="topic-link" to="/private-im">私有化部署方案</router-link>
      <router-link class="topic-link" to="/im-solution">行业解决方案</router-link>
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

.topics {
  margin: 18px auto 0;
  max-width: 980px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.topic-link {
  text-decoration: none;
  border-radius: 999px;
  border: 1px solid #d6e3f3;
  color: #2d4b6a;
  background: #fff;
  padding: 8px 14px;
  font-size: 14px;
}
</style>
