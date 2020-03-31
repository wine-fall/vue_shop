<template>
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
            
        </el-breadcrumb>
        <el-card>
            <!-- 搜索与添加 -->
            <el-row :gutter="50">
                <el-col :span="7">
                    <!-- 注意这里使用双向数据绑定，input中的内容实时绑定到data中的queryInfo.query中，然后点击按钮，再次调用数据请求函数 -->
                        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                        </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addFormVisible=true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 列表区域 -->
            <el-table :data="userList" style="width: 100%" border stripe>
                <el-table-column type="index" label="索引"></el-table-column>
                <el-table-column prop="username" label="姓名" ></el-table-column>
                <el-table-column prop="mobile" label="手机" ></el-table-column>
                <el-table-column prop="email" label="邮箱" ></el-table-column>
                <el-table-column prop="mg_state" label="状态" >
                    <!-- 这里用slot-scope接受作用域的数据，利用了作用域插槽 -->
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column prop="role_name" label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEidtDialog(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
                        <el-tooltip class="item" effect="dark" content="修改角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                        </el-tooltip>                    
                    </template>
                </el-table-column>
            </el-table>
            <!-- 页码区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户名" :visible.sync="addFormVisible" label-width="50%" @close="FormClosed">
            <el-form ref="FormRef" :model="addForm" label-width="80px" :rules="addFormRules">
                <el-form-item label="用户名" prop="username" >
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password" >
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile" >
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email" >
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
            </el-form>
            <!-- 弹出框底部 -->
            <div slot="footer" class="dialog-footer">
                <el-button @click="addFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addFormCheck">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 修改用户对话框 -->
        <el-dialog title="添加用户名" :visible.sync="editFormVisible" label-width="50%" @close="FormClosed">
            <el-form ref="FormRef" :model="editForm" label-width="80px" :rules="editFormRules">
                <el-form-item label="用户名" prop="username" >
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile" >
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email" >
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
            </el-form>
            <!-- 弹出框底部 -->
            <div slot="footer" class="dialog-footer">
                <el-button @click="editFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="editFormCheck">确 定</el-button>
            </div>
        </el-dialog>
        
    </div>
</template>
<script>
export default {
    data(){
        var checkEmail=(rule,value,callback)=>{
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if(regEmail.test(value)){
                return callback();
            }
            callback(new Error('输入邮箱不合法'))  
        }
        var checkMobile=(rule,value,callback)=>{
            const regMobile=/^1[3456789]\d{9}$/
            if(regMobile.test(value)){
                return callback();
            }
            callback(new Error('输入手机号不合法'))
        }
        return{
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:2
            },
            userList:[],
            total:0,
            addFormVisible:false,
            editFormVisible:false,
            //添加用户的表单数据
            addForm:{
                username:'',
                password:'',
                mobile:'',
                email:''
            },
            editForm:{
                username:'',
                mobile:'',
                email:''
            },
            addFormRules:{
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 3, max: 18, message: '长度在 3 到 6 个字符', trigger: 'blur' }
                ],
                mobile:[
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    {validator:checkMobile,trigger:'blur'}
                ],
                email:[
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    {validator:checkEmail,trigger:'blur'}
                ]
            },
            editFormRules:{
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 3, max: 18, message: '长度在 3 到 6 个字符', trigger: 'blur' }
                ],
                mobile:[
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    {validator:checkMobile,trigger:'blur'}
                ],
                email:[
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    {validator:checkEmail,trigger:'blur'}
                ]
            }         

        }
    },
    created(){
        this.getUserList();
    },
    methods:{
        //页面创建期间调用这个ajax请求，并向后台传递参数，注意参数传递一定要写params
        async getUserList(){
           const {data:res}= await this.$http.get('users',{params:this.queryInfo})
           if (res.meta.status!==200) return this.$message.error('获取用户列表失败');
            this.userList=res.data.users;
            this.total=res.data.total;   
        },
        // 监听 pagesize 改变的事件
        handleSizeChange(newsize){
            console.log(newsize);
            
            this.queryInfo.pagesize=newsize;
            this.getUserList();
        },
         // 监听 页码值 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum=newPage;
            this.getUserList();
        },
        async userStateChanged(userState){
            // 对数据库里的数据进行了修改，一般用put方法
            const{data:res}=await this.$http.put(`users/${userState.id}/state/${userState.mg_state}`)
            if(res.meta.status!=200){
                userState.mg_state=!userState.mg_state
                return this.$message.error('请求失败')
            }
            this.$message.success('修改成功') 
        },
        // 监听弹出框关闭事件
        FormClosed(){
            this.$refs.FormRef.resetFields();
        },
        addFormCheck(){
            this.$refs.addFormRef.validate(async valid =>{
                if(!valid) return
                const{data:res}=await this.$http.post('users',this.addForm)
                if(res.meta.status!=201) {
                    this.$message.error('添加失败')
                }
                this.$message.success('添加成功')
                this.addFormVisible=false;
                this.getUserList();

            }) 
        },
        async showEidtDialog(id){
            const {data:res}=await this.$http.get('users/'+id)
            if(res.meta.status!=200) {return this.$message.error('查询用户信息失败！')}
            this.editForm=res.data
            this.editFormVisible=true
        },
        editFormCheck(){
            this.$refs.FormRef.validate(async valid =>{
                if(!valid) return
                const{data:res}=await this.$http.put('users/'+this.editForm.id,{
                    email:this.editForm.email,
                    mobile:this.editForm.mobile
                })
                if(res.meta.status!=200) {
                    return this.$message.error('添加失败')
                }
                this.$message.success('添加成功')
                this.editFormVisible=false;
                this.getUserList();

            }) 
        },
        async deleteUser(id){
            const cofirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(
                err=>err
            )
            if(cofirmResult=='cancel'){return this.$message.info('已经取消删除')}
            const {data:res} = await this.$http.delete('users/' + id)
            if(res.meta.status!=200){return this.$message.error('删除失败')}
            this.$message.success('删除成功')
            this.getUserList();

        }
    }
    
}
</script>
<style lang="less" scoped>
.el-table{
    margin-top: 15px;
}
</style>