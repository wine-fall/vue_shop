import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//设置全局样式
import './assets/css/global.css'
// 导入阿里样式表
import './assets/fonts/iconfont.css'
// 引入axios
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
//less的组件在可视化界面直接引用就行

//配置默认路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    //设置拦截器
axios.interceptors.request.use(config => {
        config.headers.Authorization = window.sessionStorage.getItem('token')
        return config
    })
    //相当于给Vue的原型中添加了一个自定义属性$http，并赋值axios，这样全局（继承）就可以使用了
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
new Vue({
    router,
    render: h => h(App)
}).$mount('#app')