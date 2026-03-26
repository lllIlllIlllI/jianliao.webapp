<template>
  <div class="landing-page">
    <section class="hero">
      <h1>IM SDK 与开放接口</h1>
      <p>提供 IM SDK、REST API、Webhook 能力，支持企业将即时通讯集成到业务系统，快速搭建消息与协同能力。</p>
      <div class="actions">
        <router-link class="btn" to="/">进入主页</router-link>
        <router-link class="btn primary" to="/register">申请体验</router-link>
      </div>
    </section>
    <section class="grid">
      <article class="card"><h2>SDK 集成</h2><p>支持多端 SDK 接入，覆盖消息、会话、群组、联系人、推送等能力。</p></article>
      <article class="card"><h2>REST API</h2><p>提供标准接口，便于与 OA、CRM、工单、审批系统进行数据打通。</p></article>
      <article class="card"><h2>Webhook</h2><p>支持消息事件回调，便于构建机器人、自动化流程与业务通知能力。</p></article>
      <article class="card"><h2>可扩展架构</h2><p>支持模块化演进与按场景扩展，满足从中小团队到大型组织的建设需求。</p></article>
    </section>
  </div>
</template>

<script>
export default {
  name: "ImSdkLanding"
}
</script>

<style scoped lang="scss">
.landing-page { height: 100%; overflow: auto; padding: 48px 20px 36px; background: linear-gradient(165deg, #f8fbff 0%, #f1f7ff 45%, #ffffff 100%); }
.hero { margin: 0 auto; max-width: 920px; text-align: center; }
.hero h1 { margin: 0; font-size: 34px; color: #24394f; }
.hero p { margin: 16px auto 0; max-width: 760px; color: #4f6479; line-height: 1.75; }
.actions { margin-top: 20px; display: flex; justify-content: center; gap: 12px; }
.btn { text-decoration: none; border-radius: 8px; border: 1px solid #cfe0f4; color: #2e4d6f; background: #fff; padding: 9px 16px; font-weight: 600; }
.btn.primary { background: var(--im-color-primary); border-color: var(--im-color-primary); color: #fff; }
.grid { margin: 28px auto 0; max-width: 980px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
.card { background: #fff; border: 1px solid #e6eef9; border-radius: 12px; padding: 16px 14px; }
.card h2 { margin: 0 0 8px; font-size: 18px; color: #2a4158; }
.card p { margin: 0; color: #5d7085; line-height: 1.7; }
</style>
