import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'  直接利用懒加载
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

const Rights = () => import(/* webpackChunkName: "Power" */ '../components/power/rights.vue')
const Roles = () => import(/* webpackChunkName: "Users" */ '../components/power/roles.vue')

const Users = () => import(/* webpackChunkName: "Users" */ '../components/users/Users.vue')

const Goods = () => import(/* webpackChunkName: "good" */ '../components/good/Goods.vue')
const Params = () => import(/* webpackChunkName: "good" */ '../components/good/Params.vue')
const Categories = () => import(/* webpackChunkName: "good" */ '../components/good/Categories.vue')
const Add = () => import(/* webpackChunkName: "good" */ '../components/good/Add.vue')

const Order = () => import(/* webpackChunkName: "order" */ '../components/order/Order.vue')

const Report = () => import(/* webpackChunkName: "report" */ '../components/report/Reports.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/goods', component: Goods },
      { path: '/params', component: Params },
      { path: '/categories', component: Categories },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
