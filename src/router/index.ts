import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'
import Personalnfo from '../views/Personalnfo.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ResetPwd from '../views/ResetPwd.vue'
import ForgetPwd from '../views/ForgetPwd.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MyFitnessCoach },
    { path: '/store', component: Store },
    { name: 'info', path: '/personalInfo', component: Personalnfo },
    { name: 'login', path: '/login', component: Login },
    { name: 'register', path: '/register', component: Register },
    { name: 'resetpwd', path: '/resetpassword', component: ResetPwd },
    { name: 'forgetpwd', path: '/forgetpassword', component: ForgetPwd }
  ]
})

export default router
