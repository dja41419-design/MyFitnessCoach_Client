import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Cart from '@/views/Cart.vue'
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
import PointCheck from '@/views/PointCheck.vue'
import UserLayout from '@/components/UserLayout.vue'
import Lesson from '@/views/Lesson.vue'
import LessonCart from '@/views/LessonCart.vue'
import LessonPay from '@/views/LessonPay.vue'
import LessonResult from '@/views/LessonResult.vue'
import ActivateAccount from '@/views/ActivateAccount.vue'

import GoogleCallback from '@/views/GoogleCallback.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { name: 'home', path: '/', component: MyFitnessCoach },
    { path: '/store', component: Store },
    { name: 'ProductDetail', path: '/store/:id', component: ProductDetail },
    { name: 'Cart', path: '/cart', component: Cart },
    { name: 'login', path: '/login', component: Login },
    { name: 'register', path: '/register', component: Register },
    { name: 'forgotpwd', path: '/forgotpassword', component: ForgotPwd },
    { name: 'resetpwd', path: '/resetpassword', component: ResetPwd },
    { name: 'activate', path: '/activate', component: ActivateAccount },
    { name: 'bodyrecord', path: '/bodyrecord', component: BodyRecord, meta: { requiresAuth: true } },
    { name: 'foodrecord', path: '/foodrecord', component: FoodRecord, meta: { requiresAuth: true } },
    { name: 'AllInstructor', path: '/AllInstructor', component: AllInstructor },
    { name: 'AllReviews', path: '/AllReviews', component: AllReviews },
    { name: 'Lesson', path: '/lesson', component: Lesson },
    { name: 'LessonCart', path: '/lesson-cart', component: LessonCart },
    { name: 'LessonPay', path: '/lesson-pay', component: LessonPay },
    { name: 'LessonResult', path: '/lesson-result', component: LessonResult },

    { name: 'google-callback', path: '/google-callback', component: GoogleCallback },
    
    // 使用者帳戶相關頁面，共用 UserLayout
    {
      path: '/user',
      component: UserLayout,
      meta: { requiresAuth: true },
      children: [
        { name: 'info', path: '/personalInfo', component: Personalnfo },
        { name: 'changepwd', path: '/changepassword', component: ChangePwd },
        { name: 'ReserveOrders', path: '/reserveorders', component: ReserveOrders },
        { name: 'points', path: '/points', component: PointCheck },
      ]
    },

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
