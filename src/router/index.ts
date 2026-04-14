import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'
import Personalnfo from '@/views/Personalnfo.vue'
import AllInstructor from '@/views/AllInstructor.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
  { path: '/', component: MyFitnessCoach },
  { path: '/store', component: Store },
  { name:'info', path: '/personalInfo', component: Personalnfo },
  { name:'AllInstructor', path: '/AllInstructor', component: AllInstructor },
]
})

export default router
