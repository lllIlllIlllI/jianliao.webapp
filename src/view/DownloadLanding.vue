<template>
  <div class="landing-page">
    <section class="hero">
      <h1>简聊IM 下载中心</h1>
      <p>支持 Web、iOS、Android 多端登录与消息同步，适配企业办公与移动沟通场景，开箱即用。</p>
      <div class="hero-actions">
        <router-link class="btn" to="/">进入主页</router-link>
      </div>
    </section>

    <section class="download-grid">
      <article class="download-card">
        <h2>iOS</h2>
        <p>适用于 iPhone 和 iPad，支持实时消息、文件传输、语音视频与消息漫游。</p>
        <a class="btn" href="https://www.jianliao.net.cn/" target="_blank" rel="noopener noreferrer">前往下载</a>
      </article>
      <article class="download-card">
        <h2>Android</h2>
        <p>适用于主流 Android 设备，支持群聊协同、消息同步、弱网重连与通知提醒。</p>
        <a class="btn" href="https://www.jianliao.net.cn/" target="_blank" rel="noopener noreferrer">前往下载</a>
      </article>
      <article class="download-card">
        <h2>Web</h2>
        <p>浏览器即开即用，适合企业外部访问、临时协作和跨设备办公。</p>
        <router-link class="btn" to="/login">立即使用</router-link>
      </article>
    </section>
  </div>
</template>

<script>
export default {
  name: "DownloadLanding"
}
</script>

<style scoped lang="scss">
.landing-page {
  height: 100%;
  overflow: auto;
  padding: 48px 20px 36px;
  background: linear-gradient(170deg, #f6fcff 0%, #f0f7ff 40%, #ffffff 100%);
  color: #2c3e50;
}

.hero {
  margin: 0 auto;
  max-width: 900px;
  text-align: center;
}

.hero h1 {
  margin: 0;
  font-size: 34px;
}

.hero p {
  margin: 16px auto 0;
  max-width: 740px;
  color: #4c6075;
}

.hero-actions {
  margin-top: 14px;
}

.download-grid {
  margin: 30px auto 0;
  max-width: 980px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.download-card {
  background: #fff;
  border: 1px solid #e7eef8;
  border-radius: 12px;
  padding: 18px 14px;
}

.download-card h2 {
  margin: 0 0 8px;
}

.download-card p {
  margin: 0 0 14px;
  color: #5f7388;
  line-height: 1.7;
}

.btn {
  display: inline-block;
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid var(--im-color-primary);
  color: var(--im-color-primary);
  padding: 8px 14px;
  font-weight: 600;
}
</style>
