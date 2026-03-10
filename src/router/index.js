import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../view/Login'
import Register from '../view/Register'
import ResetPwd from '../view/ResetPwd.vue'
import Home from '../view/Home'
// 安装路由
Vue.use(VueRouter);

// 配置导出路由
const router = new VueRouter({
  routes: [{
    path: "/",
    redirect: "/login"
  },
  {
    name: "Login",
    path: '/login',
    component: Login
  },
  {
    name: "Register",
    path: '/register',
    component: Register
  },
    {
    name: "ResetPwd",
    path: '/password/reset',
    component: ResetPwd
  },
  {
    name: "Home",
    path: '/home',
    component: Home,
    children: [
      {
        name: "Chat",
        path: "/home/chat",
        component: () => import("../view/Chat"),
      },
      {
        name: "Friend",
        path: "/home/friend",
        component: () => import("../view/Friend"),
      },
      {
        name: "GROUP",
        path: "/home/group",
        component: () => import("../view/Group"),
      },
      {
        name: "Setting",
        path: "/home/setting",
        component: () => import("../view/Setting"),
      },
      {
        name: "Website",
        path: "/home/website",
        component: () => import("../view/Website.vue"),
      }
    ]
  }
  ]
});

export default router;
