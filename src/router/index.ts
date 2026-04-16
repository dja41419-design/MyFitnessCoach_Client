import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'
import Personalnfo from '@/views/Personalnfo.vue'
import AllInstructor from '@/views/AllInstructor.vue'
import AllReviews from '@/views/AllReviews.vue'
import Reserve from '@/views/Reserve.vue'
import ReserveDetail from '@/views/ReserveDetail.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
  { path: '/', component: MyFitnessCoach },
  { path: '/store', component: Store },
  { name:'info', path: '/personalInfo', component: Personalnfo },
  { name:'AllInstructor', path: '/AllInstructor', component: AllInstructor },
  { name:'AllReviews', path: '/AllReviews', component: AllReviews },
  { 
    path: '/reserve', 
    component: Reserve,
    children: [
      { path: '', redirect: '/reserve/1' },
      { name: 'ReserveDetail', path: ':id', component: ReserveDetail }
    ]
  },
]
})

export default router
