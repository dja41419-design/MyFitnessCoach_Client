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
    { name: 'home', path: '/', component: MyFitnessCoach },
    { path: '/store', component: Store },
    { name: 'info', path: '/personalInfo', component: Personalnfo, meta: { requiresAuth: true } },//meta:受保護路由
    { name: 'login', path: '/login', component: Login },
    { name: 'register', path: '/register', component: Register },
    { name: 'resetpwd', path: '/resetpassword', component: ResetPwd },
    { name: 'forgetpwd', path: '/forgetpassword', component: ForgetPwd }
  ]
})


//檢查token是否存在，若不存在則導向登入頁面
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { returnUrl: to.fullPath } }
  }
})

export default router
