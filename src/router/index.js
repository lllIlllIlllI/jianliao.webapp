import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../view/Login'
import Register from '../view/Register'
import ResetPwd from '../view/ResetPwd.vue'
import Home from '../view/Home'
import ProductLanding from '../view/ProductLanding.vue'
import DownloadLanding from '../view/DownloadLanding.vue'
import AboutLanding from '../view/AboutLanding.vue'
import ImSdkLanding from '../view/ImSdkLanding.vue'
import PrivateImLanding from '../view/PrivateImLanding.vue'
import ImSolutionLanding from '../view/ImSolutionLanding.vue'
// 安装路由
Vue.use(VueRouter);

// 配置导出路由
const router = new VueRouter({
  routes: [{
    path: "/",
    redirect: "/login"
  },
  {
    name: "ProductLanding",
    path: '/product',
    component: ProductLanding,
    meta: {
      seo: {
        title: "简聊IM产品 - 即时通讯软件与企业沟通平台",
        description: "简聊IM产品页，提供即时通讯、端对端加密、语音视频聊天、多端同步等能力介绍。",
        keywords: "简聊IM,即时通讯软件,IM即时通讯软件,企业即时通讯软件,语音视频聊天,端对端加密,多端同步",
        robots: "index,follow"
      }
    }
  },
  {
    name: "DownloadLanding",
    path: '/download',
    component: DownloadLanding,
    meta: {
      seo: {
        title: "简聊IM下载 - 即时聊天软件客户端下载",
        description: "简聊IM下载中心，获取 iOS、Android 与 Web 端即时通讯产品入口。",
        keywords: "简聊IM下载,即时聊天软件,语音聊天软件,IM下载,聊天应用下载",
        robots: "index,follow"
      }
    }
  },
  {
    name: "AboutLanding",
    path: '/about',
    component: AboutLanding,
    meta: {
      seo: {
        title: "关于简聊IM - 安全可靠的即时通讯服务",
        description: "了解简聊IM的发展定位、核心能力与产品服务，支持企业与个人高效沟通。",
        keywords: "关于简聊IM,即时通讯服务,企业即时通信软件,聊天平台",
        robots: "index,follow"
      }
    }
  },
  {
    name: "ImSdkLanding",
    path: '/im-sdk',
    component: ImSdkLanding,
    meta: {
      seo: {
        title: "IM SDK - 即时通讯SDK与API接口平台 | 简聊IM",
        description: "简聊IM提供即时通讯SDK、REST API、Webhook能力，支持企业快速集成消息与协同功能。",
        keywords: "IM SDK,即时通讯SDK,IM API,Webhook,消息推送,企业IM集成",
        robots: "index,follow"
      }
    }
  },
  {
    name: "PrivateImLanding",
    path: '/private-im',
    component: PrivateImLanding,
    meta: {
      seo: {
        title: "私有化IM部署 - 企业即时通讯私有部署方案 | 简聊IM",
        description: "支持私有化部署、专网接入、权限审计与数据可控，适合对安全与合规要求较高的组织。",
        keywords: "私有化IM,企业即时通讯私有化部署,内网IM,专网通讯,数据安全",
        robots: "index,follow"
      }
    }
  },
  {
    name: "ImSolutionLanding",
    path: '/im-solution',
    component: ImSolutionLanding,
    meta: {
      seo: {
        title: "行业IM解决方案 - 政企制造研发金融协同 | 简聊IM",
        description: "面向政企、制造、研发与金融等行业，提供可落地的即时通讯协同解决方案。",
        keywords: "IM解决方案,企业协同平台,政企即时通讯,制造业IM,金融行业通讯",
        robots: "index,follow"
      }
    }
  },
  {
    name: "Login",
    path: '/login',
    component: Login,
    meta: {
      seo: {
        title: "简聊IM登录 - 安全稳定的即时通讯软件",
        description: "登录简聊IM，体验端对端加密、语音视频聊天和多端同步的即时通讯服务。",
        keywords: "简聊IM,即时通讯,IM即时通讯软件,即时聊天软件,端对端加密,语音视频聊天,多端同步",
        robots: "index,follow"
      }
    }
  },
  {
    name: "Register",
    path: '/register',
    component: Register,
    meta: {
      seo: {
        title: "简聊IM注册 - 即时通讯与企业沟通平台",
        description: "注册简聊IM，快速开启安全聊天、语音视频沟通和高效协作。",
        keywords: "简聊IM注册,即时通讯,聊天应用,语音聊天软件,企业即时通讯软件",
        robots: "index,follow"
      }
    }
  },
    {
    name: "ResetPwd",
    path: '/password/reset',
    component: ResetPwd,
    meta: {
      seo: {
        title: "找回密码 - 简聊IM",
        description: "通过手机或邮箱快速找回简聊IM账号密码，安全恢复访问。",
        keywords: "简聊IM,找回密码,重置密码,即时通讯账号",
        robots: "noindex,nofollow"
      }
    }
  },
  {
    name: "Home",
    path: '/home',
    component: Home,
    meta: {
      seo: {
        title: "简聊IM - 即时通讯工作台",
        description: "简聊IM即时通讯工作台，支持私聊、群聊、联系人与系统设置。",
        keywords: "简聊IM,即时通讯,聊天软件,私聊,群聊",
        robots: "noindex,nofollow"
      }
    },
    children: [
      {
        name: "Chat",
        path: "/home/chat",
        component: () => import("../view/Chat"),
        meta: {
          seo: {
            title: "消息会话 - 简聊IM",
            description: "简聊IM消息会话页面，支持私聊、群聊与多种消息类型实时沟通。",
            keywords: "简聊IM,即时通讯,消息会话,私聊,群聊,实时聊天",
            robots: "noindex,nofollow"
          }
        }
      },
      {
        name: "Friend",
        path: "/home/friend",
        component: () => import("../view/Friend"),
        meta: {
          seo: {
            title: "联系人 - 简聊IM",
            description: "管理好友与联系人，快速发起即时聊天与沟通协作。",
            keywords: "简聊IM,联系人管理,好友,即时聊天",
            robots: "noindex,nofollow"
          }
        }
      },
      {
        name: "GROUP",
        path: "/home/group",
        component: () => import("../view/Group"),
        meta: {
          seo: {
            title: "群组 - 简聊IM",
            description: "简聊IM群组页面，支持群成员管理、群会话与多人协作沟通。",
            keywords: "简聊IM,群聊,群组管理,企业沟通,团队协作",
            robots: "noindex,nofollow"
          }
        }
      },
      {
        name: "Setting",
        path: "/home/setting",
        component: () => import("../view/Setting"),
        meta: {
          seo: {
            title: "账号设置 - 简聊IM",
            description: "管理简聊IM账号信息、安全设置与个性化配置。",
            keywords: "简聊IM,账号设置,安全设置,即时通讯",
            robots: "noindex,nofollow"
          }
        }
      },
      {
        name: "Website",
        path: "/home/website",
        component: () => import("../view/Website.vue"),
        meta: {
          seo: {
            title: "简聊官网 - 简聊IM",
            description: "访问简聊官网，了解产品能力、功能介绍与服务支持。",
            keywords: "简聊官网,简聊IM,即时通讯软件",
            robots: "noindex,nofollow"
          }
        }
      }
    ]
  }
  ]
});

export default router;
