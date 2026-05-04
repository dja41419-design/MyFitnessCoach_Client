import { createRouter, createWebHistory } from 'vue-router'
import MyFitnessCoach from '@/views/MyFitnessCoach.vue'
import Store from '@/views/Store.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Cart from '@/views/Cart.vue'
import PersonalInfo from '@/views/PersonalInfo.vue'
import AllInstructor from '@/views/AllInstructor.vue'
import AllReviews from '@/views/AllReviews.vue'
import Reserve from '@/views/Reserve.vue'
import ReserveDetail from '@/views/ReserveDetail.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ChangePwd from '@/views/ChangePwd.vue'
import ForgotPwd from '@/views/ForgotPwd.vue'
import ResetPwd from '@/views/ResetPwd.vue'
import HealthTracker from '@/views/HealthTracker.vue'
import DailyDiet from '@/views/DailyDiet.vue'
import BodyMetrics from '@/views/BodyMetrics.vue'
import FoodLibrary from '@/views/FoodLibrary.vue'
import Goals from '@/views/Goals.vue'
import HealthTrackerReports from '@/views/HealthTrackerReports.vue'
import ReserveOrders from '@/views/ReserveOrders.vue'
import UserLayout from '@/components/UserLayout.vue'
import Lesson from '@/views/Lesson.vue'
import LessonCart from '@/views/LessonCart.vue'
import LessonPay from '@/views/LessonPay.vue'
import LessonResult from '@/views/LessonResult.vue'
import ActivateAccount from '@/views/ActivateAccount.vue'
import { fetchCurrentUser } from '@/data/login'


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
    {
      path: '/health-tracker',
      component: HealthTracker,
      meta: { requiresAuth: true },
      redirect: '/health-tracker/daily-diet',
      children: [
        { name: 'daily-diet',   path: 'daily-diet',   component: DailyDiet },
        { name: 'body-metrics', path: 'body-metrics',  component: BodyMetrics },
        { name: 'food-library', path: 'food-library',  component: FoodLibrary },
        { name: 'goals',        path: 'goals',         component: Goals },
        { name: 'reports',      path: 'reports',       component: HealthTrackerReports },
      ],
    },
    { name: 'AllInstructor', path: '/AllInstructor', component: AllInstructor },
    { name: 'AllReviews', path: '/AllReviews', component: AllReviews },
    { name: 'Lesson', path: '/lesson', component: Lesson },
    { name: 'LessonCart', path: '/lesson-cart', component: LessonCart },
    { name: 'LessonPay', path: '/lesson-pay', component: LessonPay },
    { name: 'LessonResult', path: '/lesson-result', component: LessonResult },

    // 使用者帳戶相關頁面，共用 UserLayout
    {
      path: '/user',
      component: UserLayout,
      meta: { requiresAuth: true },
      children: [
        { name: 'info', path: '/personalInfo', component: PersonalInfo },
        { name: 'changepwd', path: '/changepassword', component: ChangePwd },
        { name: 'ReserveOrders', path: '/reserveorders', component: ReserveOrders },
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

// 登入狀態以 HttpOnly cookie 為準；localStorage 只作為 UI 快取。
// 若使用者直接開受保護頁面，先用 /api/auth/me 確認 cookie 是否仍有效。
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth || localStorage.getItem('username')) return

  const me = await fetchCurrentUser()
  if (me) {
    localStorage.setItem('username', me.userName)
    localStorage.setItem('imageUrl', me.imageUrl ?? '')
    if (me.memberId != null) localStorage.setItem('memberId', String(me.memberId))
    else localStorage.removeItem('memberId')
    return
  }

  localStorage.removeItem('username')
  localStorage.removeItem('imageUrl')
  localStorage.removeItem('memberId')
  return { name: 'login', query: { returnUrl: to.fullPath } }
})

export default router
