import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'
import Personalnfo from '../views/Personalnfo.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ChangePwd from '../views/ChangePwd.vue'
import ForgotPwd from '../views/ForgotPwd.vue'
import ResetPwd from '../views/ResetPwd.vue'
import ActivateAccount from '../views/ActivateAccount.vue'
import BodyRecord from '../views/BodyRecord.vue'
import FoodRecord from '../views/FoodRecord.vue'



const router = createRouter({
  history: createWebHistory(),
  routes: [
    { name: 'home', path: '/', component: MyFitnessCoach },
    { path: '/store', component: Store },
    { name: 'info', path: '/personalInfo', component: Personalnfo, meta: { requiresAuth: true } },//meta:受保護路由
    { name: 'login', path: '/login', component: Login },
    { name: 'register', path: '/register', component: Register },
    { name: 'changepwd', path: '/changepassword', component: ChangePwd, meta: { requiresAuth: true } },
    { name: 'forgotpwd', path: '/forgotpassword', component: ForgotPwd },
    { name: 'resetpwd', path: '/resetpassword', component: ResetPwd },
    { name: 'activate', path: '/activate', component: ActivateAccount },
    { name: 'bodyrecord', path: '/bodyrecord', component: BodyRecord, meta: { requiresAuth: true } },
    { name: 'foodrecord', path: '/foodrecord', component: FoodRecord, meta: { requiresAuth: true } },

  ]
})


//檢查token是否存在，若不存在則導向登入頁面
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { returnUrl: to.fullPath } }//將原本要訪問的路徑作為參數傳遞，登入成功後可以導回原本的頁面
  }
})

export default router
