<template>
  <div class="landing-page">
    <section class="hero">
      <h1>私有化部署 IM 方案</h1>
      <p>适用于对数据安全、合规审计、内网部署有要求的组织，支持专有网络、权限隔离与统一身份认证。</p>
      <div class="actions">
        <router-link class="btn" to="/">进入主页</router-link>
        <a class="btn primary" href="https://www.jianliao.net.cn/" target="_blank" rel="noopener noreferrer">咨询部署方案</a>
      </div>
    </section>
    <section class="grid">
      <article class="card"><h2>专网与内网部署</h2><p>支持私有网络环境部署，降低外网暴露面，提升企业内部通信可控性。</p></article>
      <article class="card"><h2>通信与存储保护</h2><p>支持传输链路加密与文件存储保护，增强消息与附件安全防护。</p></article>
      <article class="card"><h2>权限与审计</h2><p>支持组织级权限控制、登录策略和操作审计，满足合规管理诉求。</p></article>
      <article class="card"><h2>对接企业身份体系</h2><p>支持对接企业身份认证体系与组织架构同步，提升统一管理效率。</p></article>
    </section>
  </div>
</template>

<script>
export default {
  name: "PrivateImLanding"
}
</script>

<style scoped lang="scss">
.landing-page { height: 100%; overflow: auto; padding: 48px 20px 36px; background: linear-gradient(165deg, #f8fbff 0%, #f1f7ff 45%, #ffffff 100%); }
.hero { margin: 0 auto; max-width: 920px; text-align: center; }
.hero h1 { margin: 0; font-size: 34px; color: #24394f; }
.hero p { margin: 16px auto 0; max-width: 760px; color: #4f6479; line-height: 1.75; }
.actions { margin-top: 20px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.btn { text-decoration: none; border-radius: 8px; border: 1px solid #cfe0f4; color: #2e4d6f; background: #fff; padding: 9px 16px; font-weight: 600; }
.btn.primary { background: var(--im-color-primary); border-color: var(--im-color-primary); color: #fff; }
.grid { margin: 28px auto 0; max-width: 980px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
.card { background: #fff; border: 1px solid #e6eef9; border-radius: 12px; padding: 16px 14px; }
.card h2 { margin: 0 0 8px; font-size: 18px; color: #2a4158; }
.card p { margin: 0; color: #5d7085; line-height: 1.7; }
</style>
