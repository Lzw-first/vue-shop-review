import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/public.css'
import axios from 'axios'
// 导入外部字体库
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false

// 设置默认请求地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 将axios添加为Vue对象添加了一个原型属性   组件中就可以用 this.$http 来调用axios
Vue.prototype.$http = axios
// 获取完token值后给每次请求都携带token值，相当于设置了用户权限
// http request 拦截器
axios.interceptors.request.use(
  function(config) {
    // 通过拦截request请求,主动为 请求头,追加新属性 Authorization,等于 token 值
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  },
  function(error) {
    // 请求发送失败时候
    return Promise.reject(error)
  }
)

// 添加路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
  }
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
