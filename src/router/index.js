import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'  直接利用懒加载
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/',
    redirect: '/login'
  },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})

export default router
