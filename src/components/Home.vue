<template>
    <!-- 头部 -->
    <el-container class="home_container">     
        <el-header>
            <div>
                <img src="../assets/jdlogo.jpg" alt="">
                <span>后台管理系统</span> 
            </div>
            <el-button type="info" @click="logOut">退出</el-button>
        </el-header>
        <el-container>
            <el-aside :width="isCollapse?'64px':'200px'">
                <!-- 侧栏导航 -->
                <div class="toggleButton" @click.stop="toggle">|||</div>
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b" 
                :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
                    <el-submenu :collapse="false" :index="item.id + '' "  v-for="item in menulist" :key="item.id">
                        <template slot="title">
                            <i :class="iconList[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNaveState('/'+subItem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <!-- 所有的子组件都可以通过这行代码在homepage显示 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data(){
        return{
            // 左侧菜单数据
            menulist:[],
            iconList:{
                '125': 'iconfont icon-user',
                '103': 'iconfont icon-tijikongjian',
                '101': 'iconfont icon-shangpin',
                '102': 'iconfont icon-danju',
                '145': 'iconfont icon-baobiao'
            },
            isCollapse:false,
            //被激活的地址
            activePath:''
        }
    },
    methods:{
        logOut(){
            window.sessionStorage.clear();
            this.$router.push('/login')
        },
        async getMenuList(){
           const {data:res}= await this.$http.get('/menus')
           if(res.meta.status!==200) return this.$message.error(res.meta.msg)
           console.log(res.data);
           
            this.menulist=res.data;
           
        },
        toggle(){
            this.isCollapse=!this.isCollapse
        },
        //保存链接的激活状态
        saveNaveState(val){
            window.sessionStorage.setItem('activePath',val)
            this.activePath=val
        }

    },
    created(){
        this.getMenuList();
        this.activePath=window.sessionStorage.getItem('activePath')
    }
}
</script>
<style lang="less" scoped>
.home_container{
    height: 100%;
}
.el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    font-size: 20px;
    color: #fff;
    >div{
        display: flex;
        align-items: center;
        >img{
            width: 60px;
        }
        span{
            margin-left: 15px;
        }
    }
    
}
.el-aside{
    background-color: #333744;
    .el-menu{border: none;}   
    .iconfont{
        margin-right: 10px;
    }
}
.el-main{
    background-color: #eaedf1;
}
.toggleButton{
    letter-spacing: 2px;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    color: white;
    cursor: pointer;
}

</style>