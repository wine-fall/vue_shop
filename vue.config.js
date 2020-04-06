module.exports = {
    chainWebpack: config => {
        // 注意这里调用config的when方法，判断是否为发布/开发模式，判定条件为固定写法
        config.when(process.env.NODE_ENV === 'production', config => {
            // 自定义打包路径entry中是默认路径，这里的操作是：先清空默认路径；在添加新的路径
            config.entry('app').clear().add('./src/main-prod.js')
                //设置external节点，这样在发布过程中，以下被申明的依赖项不会整合到同一文件中，而是有需要的时候会到windows对象下去找
            config.set('externals', {
                    vue: 'Vue',
                    'vue-router': 'VueRouter',
                    axios: 'axios',
                    lodash: '_',
                    echarts: 'echarts',
                    nprogress: 'NProgress',
                    'vue-quill-editor': 'VueQuillEditor'
                })
                // 调用html插件，判断当前是否为发布/开发模式，以便按需更改首页名
            config.plugin('html').tap(args => {
                args[0].isProd = true
                return args
            })
        })
        config.when(process.env.NODE_ENV === 'development', config => {
            // entry中是默认路径，这里的操作是：先清空默认路径；在添加新的路径
            config.entry('app').clear().add('./src/main-dev.js')
            config.plugin('html').tap(args => {
                args[0].isProd = false
                return args
            })
        })
    },
    lintOnSave: false
}