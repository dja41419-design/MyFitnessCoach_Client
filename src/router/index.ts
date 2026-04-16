import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'
import Personalnfo from '@/views/Personalnfo.vue'
import AllInstructor from '@/views/AllInstructor.vue'
import Lesson from '@/views/Lesson.vue'
import LessonCart from '@/views/LessonCart.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
  { path: '/', component: MyFitnessCoach },
  { path: '/store', component: Store },
  { name:'info', path: '/personalInfo', component: Personalnfo },
  { name:'AllInstructor', path: '/AllInstructor', component: AllInstructor },
  { name:'Lesson', path: '/lesson', component: Lesson },
  { name:'LessonCart', path: '/lesson-cart', component: LessonCart },
]
})

export default router
