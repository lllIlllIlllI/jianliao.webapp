<template>
  <div class="landing-page">
    <section class="hero">
      <h1>行业即时通讯解决方案</h1>
      <p>围绕政企协同、制造业协作、研发沟通、金融服务等场景，提供可落地的企业即时通讯建设方案。</p>
      <div class="actions">
        <router-link class="btn" to="/">进入主页</router-link>
      </div>
    </section>
    <section class="grid">
      <article class="card"><h2>政企单位</h2><p>强调数据可控、统一协同与组织管理，满足内部沟通和信息发布场景。</p></article>
      <article class="card"><h2>制造业</h2><p>支持生产、质检、仓储等多角色协作，减少跨系统沟通成本。</p></article>
      <article class="card"><h2>研发与互联网</h2><p>支持项目群组、机器人通知、接口集成，提高研发协作效率。</p></article>
      <article class="card"><h2>金融与服务业</h2><p>通过权限管控、会话留痕和策略配置，提升业务沟通的合规性与稳定性。</p></article>
    </section>
  </div>
</template>

<script>
export default {
  name: "ImSolutionLanding"
}
</script>

<style scoped lang="scss">
.landing-page { height: 100%; overflow: auto; padding: 48px 20px 36px; background: linear-gradient(165deg, #f8fbff 0%, #f1f7ff 45%, #ffffff 100%); }
.hero { margin: 0 auto; max-width: 920px; text-align: center; }
.hero h1 { margin: 0; font-size: 34px; color: #24394f; }
.hero p { margin: 16px auto 0; max-width: 760px; color: #4f6479; line-height: 1.75; }
.actions { margin-top: 20px; display: flex; justify-content: center; gap: 12px; }
.btn { text-decoration: none; border-radius: 8px; border: 1px solid #cfe0f4; color: #2e4d6f; background: #fff; padding: 9px 16px; font-weight: 600; }
.grid { margin: 28px auto 0; max-width: 980px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
.card { background: #fff; border: 1px solid #e6eef9; border-radius: 12px; padding: 16px 14px; }
.card h2 { margin: 0 0 8px; font-size: 18px; color: #2a4158; }
.card p { margin: 0; color: #5d7085; line-height: 1.7; }
</style>
