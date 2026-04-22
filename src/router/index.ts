import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Personalnfo from '@/views/Personalnfo.vue'
import AllInstructor from '@/views/AllInstructor.vue'
import AllReviews from '@/views/AllReviews.vue'
import Reserve from '@/views/Reserve.vue'
import ReserveDetail from '@/views/ReserveDetail.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ChangePwd from '@/views/ChangePwd.vue'
import ForgotPwd from '@/views/ForgotPwd.vue'
import ResetPwd from '@/views/ResetPwd.vue'
import BodyRecord from '@/views/BodyRecord.vue'
import FoodRecord from '@/views/FoodRecord.vue'
import ReserveOrders from '@/views/ReserveOrders.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { name: 'home', path: '/', component: MyFitnessCoach },
    { path: '/store', component: Store },
    { name: 'ProductDetail', path: '/store/:id', component: ProductDetail },
    { name: 'info', path: '/personalInfo', component: Personalnfo, meta: { requiresAuth: true } },
    { name: 'login', path: '/login', component: Login },
    { name: 'register', path: '/register', component: Register },
    { name: 'changepwd', path: '/changepassword', component: ChangePwd, meta: { requiresAuth: true } },
    { name: 'forgotpwd', path: '/forgotpassword', component: ForgotPwd },
    { name: 'resetpwd', path: '/resetpassword', component: ResetPwd },
    { name: 'bodyrecord', path: '/bodyrecord', component: BodyRecord, meta: { requiresAuth: true } },
    { name: 'foodrecord', path: '/foodrecord', component: FoodRecord, meta: { requiresAuth: true } },
    { name: 'AllInstructor', path: '/AllInstructor', component: AllInstructor },
    { name: 'AllReviews', path: '/AllReviews', component: AllReviews },
    { name: 'ReserveOrders', path: '/reserveorders', component: ReserveOrders },
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

//檢查token是否存在，若不存在則導向登入頁面
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { returnUrl: to.fullPath } }
  }
})

export default router
