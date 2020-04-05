<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <el-form ref="formLoginRef" :rules="formLoginRules" :model="formlogin" label-width="0px" class="login_form">
                <!-- username -->
                <!-- 注意这个验证规则是加给item而非文本框 -->
                <el-form-item prop="username">
                    <!-- 注意这里如何双向绑定username和password -->
                    <el-input  v-model="formlogin.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- password -->
                <el-form-item prop="password">
                    <el-input v-model="formlogin.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
                </el-form-item>
                <!-- button -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登入</el-button>
                    <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        
    </div>
</template>
<script>
export default {
    data(){
        return{
            formlogin:{
                username:'admin',
                password:'123456'
            },
            formLoginRules:{
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
            }
        }
    },
    methods:{
        reset(){
         this.$refs.formLoginRef.resetFields();
        },
        login(){
            //注意，这里的valid直接验证上述rules中制定的规则，符合则为true否则为false
            this.$refs.formLoginRef.validate(async valid=>{
                if(!valid) return;
                //注意这里要加this
                //这里本来返回的是promise对象，用await后可简化，注意之前的函数要加async
                //这里使用解构的方法，把返回的对象中的data属性解构出来，赋值给res，注意这里的写法，对象解构是根据属性名解构。
                const {data:res}=await this.$http.post("login",this.formlogin)
                if(res.meta.status!=200) return this.$message.error('错误')
                this.$message.success('正确')
                window.sessionStorage.setItem('token',res.data.token)
                this.$router.push('/home')
            });
        }
    }
    
}
</script>
<style lang="less" scoped>
.login_container{
    background-color:#2b4b6b;
    height: 100%;
}
.login_box{
    position: absolute;
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    left:50%;
    top:50%;
    transform: translate(-50%,-50%);
    .avatar_box{
        width: 130px;
        height: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        background-color: #eee;
        position: absolute;
        left:50%;
        transform: translate(-50%,-50%);
        img{
            width: 100%;
            height: 100%;
            border-radius: 50%;
        }
    }
}
.btns{
    display: flex;
    justify-content: flex-end;
}
.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 30px;
    box-sizing: border-box;
}
</style>