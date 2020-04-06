<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品参数</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-alert title="注意！只允许选择第三季分类相关参数！" type="warning" show-icon :closable="false"></el-alert>
            <!-- 级连选择器 -->
            <el-row class="cate_bottom">
                  <el-cascader v-model="cateKeys" :options="cateList" :props="cateProps" @change="selectCates"></el-cascader>
            </el-row>
            
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 动态参数 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" :disabled="isDisabled" @click="addFormVisible=true">添加参数</el-button>
                     <el-table :data="manyParamsData" style="width: 100%">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item,id) in scope.row.attr_vals" :key="id" closable @close="deleteAtrr(id,scope.row)" > {{item}}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column prop="attr_name" label="属性名称" ></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 静态属性 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" :disabled="isDisabled" @click="addFormVisible=true">添加属性</el-button>
                    <el-table :data="onlyParamsData" style="width: 100%">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item,id) in scope.row.attr_vals" :key="id" closable @close="deleteAtrr(id,scope.row)" > {{item}}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column prop="attr_name" label="属性名称" ></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数/属性对话框 -->
        <el-dialog :title="'添加'+titleText" :visible.sync="addFormVisible" width="50%" @close="resetForm">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑参数/属性对话框 -->
        <el-dialog :title="'修改'+titleText" :visible.sync="editFormVisible" width="50%" @close="resetEditForm">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>
export default {
    data(){
        return{
            cateList:[],
            cateKeys:[],
            cateProps:{ 
                expandTrigger: 'hover',
                value:'cat_id',
                label:'cat_name',
                children:'children',
                checkStrictly: true 
            },
            // 被激活的tab名称
            activeName:"many",
            manyParamsData:[],
            onlyParamsData:[],
            addForm:{
                attr_name:''
            },
            addFormVisible:false,
            editFormVisible:false,
            addFormRules:{
                attr_name:[
                    { required: true, message: '请输入添加参数名称', trigger: 'blur' }
                ]
            },
            editForm:{},
            editFormRules:{
                attr_name:[
                    { required: true, message: '请输入修改参数名称', trigger: 'blur' }
                ]
            }
        
            
        }
    },
    created(){
        this.getCateList();
    },
    methods: {
        async getCateList(){
            const{data:res}=await this.$http.get('/categories')
            if (res.meta.status!==200) return this.$message.error('请求商品分类列表失败')
            this.cateList=res.data
        },
        selectCates(){
           this.getParamsData()
              
        },
        handleTabClick(){
            this.getParamsData()
            
        },
        async getParamsData(){
             if(this.cateKeys.length<3){
                this.cateKeys=[]
                this.manyParamsData=[]
                this.onlyParamsData=[]
                return
            }
            const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,{
                params:{sel:this.activeName}
            })
            if(res.meta.status!==200)return this.$message.error('请求动态参数列表失败')
            res.data.forEach(element => {
                element.attr_vals=element.attr_vals? element.attr_vals.split(' ') : [];
                //注意这里还需要给每个tag分别绑定（动态绑定）
                element.inputVisible=false
                element.inputValue=''
            });
            if(this.activeName=='many'){
                this.manyParamsData=res.data
            }else{
                this.onlyParamsData=res.data
            }
        },
        resetForm(){
            this.$refs.addFormRef.resetFields();
        },
        addParams(){
            this.$refs.addFormRef.validate( async valid=>{
                if(!valid) return
                const{data:res}=await this.$http.post(`categories/${this.cateId}/attributes`,{
                    attr_name:this.addForm.attr_name,
                    attr_sel:this.activeName
                }) 
                if(res.meta.status!==201) return this.$message.error(`添加${this.titleText}失败`);
                this.$message.success(`添加${this.titleText}成功`);
                this.getParamsData();
                this.addFormVisible=false;
            })
        },
        resetEditForm(){
            this.$refs.editFormRef.resetFields();
        },
        // 注意这种自填充的操作都要从当前行取值，所以应该传过来
        async showEditDialog(id){
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,{params:{
                attr_sel:this.activeName
            }})
            if(res.meta.status!==200) return this.$message.error(`获取${this.titleText}失败`);
            this.editForm=res.data
            this.editFormVisible=true;            
        },
        editParams(){
            this.$refs.editFormRef.validate(async valid=>{
                if(!valid) return
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                        attr_name:this.editForm.attr_name,
                        attr_sel:this.activeName
                })
                if(res.meta.status!==200) return this.$message.error(`更新${this.titleText}失败`);
                this.$message.success(`更新${this.titleText}成功`);
                this.editForm=res.data
                this.getParamsData()
                this.editFormVisible=false;
            })
        },
        async deleteParams(id){
            const deleteCofirm=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err=>err)
            console.log(deleteCofirm);
            
            if(deleteCofirm=='cancel') return this.$message.info(`已取消删除`);
            const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`);
            if(res.meta.status!=200) return this.$message.error(`删除失败`);
            this.$message.success(`删除成功`);
            this.getParamsData();
        },
        handleInputConfirm(role){
            //判断输入的字符是否为空
            if(role.inputValue.trim().length==0){
                role.inputValue=''
                role.inputVisible=false
                return
            }
            role.attr_vals.push(role.inputValue)
            role.inputValue=''
            role.inputVisible=false
            this.updateParams(role)
        },
        async updateParams(role){
            const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${role.attr_id}`,{
                attr_name:role.attr_name,
                attr_sel:role.attr_sel,
                attr_vals:role.attr_vals.join(' ')
            })
            if(res.meta.status!=200) return this.$message.error('修改属性失败')
            this.$message.success('修改属性成功')
        },
        showInput(role){
            role.inputVisible=true
            //注意这里nextTick的应用，是在页面重新渲染完成后执行回调函数，因为即使role.inputVisible=true了，也不能确保页面渲染完毕，所以要用$nextTick来调用函数。
            this.$nextTick(_ => {
                //这行代码就是自动获取焦点
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        deleteAtrr(id,role){
            role.attr_vals.splice(id,1)
            this.updateParams(role)
        }
    },
    computed:{
        // 是否禁用按钮
        isDisabled(){
            if(this.cateKeys.length<3){
                return true
            }else{
                return false
            }
        },
        // 获取分类id
        cateId(){
            if(this.cateKeys.length==3){
                return this.cateKeys[2]
            }
            return null
        },
        titleText(){
            if(this.activeName=='many'){
                return '动态参数'
            }else{
                return '静态属性'
            }
        }
    }
    
}
</script>
<style lang="less" scoped>
    .cate_bottom{
        margin-top: 15px;
    }
    .input-new-tag{
        width: 180px;
    }
</style>