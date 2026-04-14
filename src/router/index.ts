import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
  { path: '/', component: MyFitnessCoach },
  { path: '/store', component: Store },
]
})

export default router
