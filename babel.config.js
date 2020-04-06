//发布阶段要使用的babel插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
    prodPlugins.push("transform-remove-console")
}

module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    plugins: [
        [
            'component',
            {
                libraryName: 'element-ui',
                styleLibraryName: 'theme-chalk'
            }
        ],
        //去除所有文件中的console.log，使用展开运算符...导入prodPlugins数组
        ...prodPlugins,
        // 实现懒加载
        '@babel/plugin-syntax-dynamic-import'
    ]
}