import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [

]

const router = new VueRouter({
        routes: [
            { path: '/', redirect: '/login' },
            { path: '/login', component: Login },
            { path: '/home', component: Home }
        ]
    })
    //导航守卫beforeEach
router.beforeEach((to, from, next) => {
    //to表示要访问的地址
    // from从哪个路劲跳转过来的
    // next执行下一步
    if (to.path == '/login') return next();
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) return next('/login')
    next();
})

export default router