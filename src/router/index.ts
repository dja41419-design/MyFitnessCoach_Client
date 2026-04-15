import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'
import Personalnfo from '../views/Personalnfo.vue'
import Login from '../views/Login.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
  { path: '/', component: MyFitnessCoach },
  { path: '/store', component: Store },
  { name:'info', path: '/personalInfo', component: Personalnfo },
  {name:'login',path:'/login',component:Login}
]
})

export default router
