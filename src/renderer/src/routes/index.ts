import { createRouter, createMemoryHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../views/home.vue')
  },
  {
    path: '/conversation/:id',
    component: () => import('../views/conversation.vue')
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

export default router
