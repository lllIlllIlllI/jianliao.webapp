<template>
  <div class="landing-page">
    <section class="hero">
      <h1>关于简聊IM</h1>
      <p>简聊IM专注即时通讯能力建设，提供安全可靠的消息、音视频与协作能力，帮助团队高效连接。</p>
    </section>

    <section class="content">
      <article class="card">
        <h2>我们的定位</h2>
        <p>面向企业与个人场景，提供稳定、低延迟、可扩展的即时通讯产品体验。</p>
      </article>
      <article class="card">
        <h2>核心能力</h2>
        <p>支持端对端加密、语音视频聊天、好友与群组管理、多端实时同步。</p>
      </article>
      <article class="card">
        <h2>联系我们</h2>
        <p>产品咨询、商务合作与技术支持，请访问官网客服通道。</p>
        <a href="https://www.jianliao.net.cn/" target="_blank" rel="noopener noreferrer">联系官方客服</a>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: "AboutLanding"
}
</script>

<style scoped lang="scss">
.landing-page {
  height: 100%;
  overflow: auto;
  padding: 48px 20px 36px;
  background: linear-gradient(160deg, #f7fcff 0%, #f3f7ff 45%, #ffffff 100%);
}

.hero {
  margin: 0 auto;
  max-width: 900px;
  text-align: center;
}

.hero h1 {
  margin: 0;
  font-size: 34px;
  color: #23364a;
}

.hero p {
  margin: 16px auto 0;
  max-width: 740px;
  color: #4d6379;
}

.content {
  margin: 30px auto 0;
  max-width: 980px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.card {
  background: #fff;
  border: 1px solid #e7eef8;
  border-radius: 12px;
  padding: 18px 14px;
}

.card h2 {
  margin: 0 0 8px;
  color: #2a4158;
}

.card p {
  margin: 0;
  line-height: 1.7;
  color: #5d7286;
}

.card a {
  display: inline-block;
  margin-top: 12px;
  text-decoration: none;
  color: var(--im-color-primary);
  font-weight: 600;
}
</style>
