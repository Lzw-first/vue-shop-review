import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'  直接利用懒加载

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () =>
      import(/* webpackChunkName: "login" */ '../components/Login.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
