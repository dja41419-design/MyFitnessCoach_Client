import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'

const routes = [
  { path: '/', component: MyFitnessCoach },
  { path: '/store', component: Store },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
