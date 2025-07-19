import { createRouter, createWebHistory } from 'vue-router'
import { isElectron } from '@/utils'

// const modules = import.meta.glob('../views/apps/*.vue');

export const constantRoutes = [
  {
    path: "/",
    component: () => import("@/views/apps/index.vue"),
  },
  {
    path: "/market",
    component: () => import("@/views/market/index.vue"),
  },
  {
    path: "/web",
    component: () => import("@/views/web/index.vue"),
  },
  {
    path: "/batch",
    component: () => import("@/views/batch/index.vue"),
  },
  {
    path: "/about",
    component: () => import("@/views/about/index.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/views/404/index.vue"),
  },
];

// for (const path in modules) {
//   const name = path.replace(/^..\/views\//, '').replace(/\.vue$/, '');
//   const route = {
//     path: `/${name}`,
//     name: name.replace(/\//g, '-'), // 替换斜杠为短横线，避免路由名称冲突
//     component: modules[path],
//   };
//   constantRoutes.push(route);
// }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/market') {

    if (!isElectron) {
      next('/');
      return;
    }
  }

  next();
});

export default router;
