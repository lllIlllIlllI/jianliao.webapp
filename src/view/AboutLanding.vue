<template>
  <div class="landing-page">
    <section class="hero">
      <h1>关于简聊IM</h1>
      <p>我们专注企业级即时通讯能力建设，围绕安全、可靠、可扩展打造 IM 基础平台，服务协同办公与业务沟通场景。</p>
      <div class="hero-actions">
        <router-link class="go-home" to="/">进入主页</router-link>
      </div>
    </section>

    <section class="content">
      <article class="card">
        <h2>产品定位</h2>
        <p>面向政企、制造、金融、研发等场景，提供可私有化、可集成、可持续演进的即时通讯平台。</p>
      </article>
      <article class="card">
        <h2>核心能力</h2>
        <p>覆盖消息通道、组织通讯录、音视频协同、SDK 接入、开放 API 与安全审计能力。</p>
      </article>
      <article class="card">
        <h2>服务支持</h2>
        <p>提供部署咨询、方案评估、接口对接与上线支持，帮助团队快速完成落地。</p>
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

.hero-actions {
  margin-top: 14px;
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

.go-home {
  text-decoration: none;
  color: var(--im-color-primary);
  font-weight: 700;
}
</style>
