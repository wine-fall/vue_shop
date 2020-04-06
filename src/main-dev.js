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
import VueQuillEditor from 'vue-quill-editor'
//less的组件在可视化界面直接引用就行
// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入NProgress包对应的js和css
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'
//配置默认路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    //设置请求拦截器
axios.interceptors.request.use(config => {
        config.headers.Authorization = window.sessionStorage.getItem('token')
        Nprogress.start()
        return config
    })
    //设置回复拦截器
axios.interceptors.response.use(config => {
        Nprogress.done()
        return config
    })
    //相当于给Vue的原型中添加了一个自定义属性$http，并赋值axios，这样全局（继承）就可以使用了
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
Vue.filter('dataForm', function(originValue) {
    const dt = new Date(originValue)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
    return `${y}-${m}-${d}  ${hh}:${mm}:${ss}`
})
Vue.use(VueQuillEditor)
new Vue({
    router,
    render: h => h(App)
}).$mount('#app')