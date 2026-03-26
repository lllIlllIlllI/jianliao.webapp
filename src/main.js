import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import './assets/style/im.scss';
import './assets/iconfont/iconfont.css';
import { createPinia, PiniaVuePlugin } from 'pinia'
import httpRequest from './api/httpRequest';
import * as socketApi from './api/wssocket';
import * as messageType from './api/messageType';
import emotion from './api/emotion.js';
import url from './api/url.js';
import str from './api/str.js';
import element from './api/element.js';
import * as  enums from './api/enums.js';
import * as dict from './api/dict.js';
import * as  date from './api/date.js';
import './utils/directive/dialogDrag';
import useChatStore from './store/chatStore.js'
import useFriendStore from './store/friendStore.js'
import useGroupStore from './store/groupStore.js'
import useUserStore from './store/userStore.js'
import useConfigStore from './store/configStore.js'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()
// element-ui
Vue.use(ElementUI);
// 挂载全局
Vue.prototype.$wsApi = socketApi;
Vue.prototype.$msgType = messageType
Vue.prototype.$date = date;
Vue.prototype.$http = httpRequest // http请求方法
Vue.prototype.$emo = emotion; // emo表情
Vue.prototype.$url = url; // url转换
Vue.prototype.$str = str; // 字符串相关
Vue.prototype.$elm = element; // 元素操作
Vue.prototype.$enums = enums; // 枚举
Vue.prototype.$dict = dict; // 字典
Vue.prototype.$eventBus = new Vue(); // 全局事件
Vue.config.productionTip = false;

const DEFAULT_SEO = {
  title: '简聊IM - 安全稳定的即时通讯软件',
  description: '简聊IM是一款安全、稳定的即时通讯软件，支持端对端加密、语音视频聊天与多端同步，适用于社交沟通与企业协作。',
  keywords: '简聊IM,即时通讯,IM即时通讯软件,即时聊天软件,企业即时通讯软件,企业即时通信软件,语音聊天软件,语音视频聊天,端对端加密,多端同步,私有化部署,聊天应用',
  robots: 'index,follow'
}

function upsertMetaByName(name, content) {
  if (!content) return;
  let node = document.head.querySelector(`meta[name="${name}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute('name', name);
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
}

function upsertMetaByProperty(property, content) {
  if (!content) return;
  let node = document.head.querySelector(`meta[property="${property}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute('property', property);
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
}

router.afterEach((to) => {
  const seoMeta = [...to.matched]
    .reverse()
    .find(route => route.meta && route.meta.seo)?.meta?.seo || {};
  const seo = { ...DEFAULT_SEO, ...seoMeta };

  document.title = seo.title;
  upsertMetaByName('description', seo.description);
  upsertMetaByName('keywords', seo.keywords);
  upsertMetaByName('robots', seo.robots);
  upsertMetaByProperty('og:type', 'website');
  upsertMetaByProperty('og:title', seo.title);
  upsertMetaByProperty('og:description', seo.description);
});


new Vue({
  el: '#app',
  // 配置路由
  router,
  pinia,
  render: h => {
    // 挂载全局的pinia
    Vue.prototype.chatStore = useChatStore();
    Vue.prototype.friendStore = useFriendStore();
    Vue.prototype.groupStore = useGroupStore();
    Vue.prototype.userStore = useUserStore();
    Vue.prototype.configStore = useConfigStore();

    return h(App)
  }
})

