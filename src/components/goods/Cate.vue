<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 表格渲染区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateVisible">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 列表区域 -->
                <tree-table class="treeTable" :data="categoriesList" :columns="columns" stripe border :selection-type="false" index-text="#" :show-index="true" :show-row-hover="false" :expand-type="false">
                    <!-- 是否有效 -->
                    <template slot="isOk" slot-scope="scope">
                    <i v-if="scope.row.cat_deleted==false" class="el-icon-success" style="color:lightgreen"></i>
                    <i v-else class="el-icon-error" style="color:red"></i>
                    </template>
                    <!-- 商品排序 -->
                    <template slot="order" slot-scope="scope">
                        <el-tag v-if="scope.row.cat_level==0" size="mini" type="primary">一级</el-tag>
                        <el-tag v-else-if="scope.row.cat_level==1" size="mini" type="success">二级</el-tag>
                        <el-tag v-else size="mini" type="warning">三级</el-tag>
                    </template>
                    <!-- 操作 -->
                    <template slot="operate" >
                        <el-button size="mini" type="primary" icon="el-icon-edit">>编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">>删除</el-button>
                    </template>
                </tree-table>
                
            <!-- 页码区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog title="提示" :visible.sync="addCateVisible" width="50%" @close="addCateClose">
            <el-form ref="addCateRef" :model="addCateForm" label-width="100px" :rules="addCateRules">
                <el-form-item label="添加分类" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <el-cascader v-model="selectedKeys" :options="parentList" :props="cascaderProp" clearable size="medium" @change="parentCateChange"></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return{
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:10
            },
            //注意res.data中有一个total，要传过来
            total:0,
            categoriesList:[],
            columns:[
                {
                    label: '商品分类',
                    prop: 'cat_name',
                    width: '200px',
                },{
                    label:'是否有效',
                    // 定义当前列为模板列，注意也是放在tree-table里面
                    type:'template',
                    // 定义当前模板的名称，放在slot属性中
                    template:'isOk'
                },{
                    label:'排序',
                    // 定义当前列为模板列，注意也是放在tree-table里面
                    type:'template',
                    // 定义当前模板的名称，放在slot属性中
                    template:'order'
                },{
                    label:'操作',
                    // 定义当前列为模板列，注意也是放在tree-table里面
                    type:'template',
                    // 定义当前模板的名称，放在slot属性中
                    template:'operate'
                }
                
            ],
            addCateVisible:false,
            addCateForm:{
                cat_name:'',
                cat_level:0,
                cat_pid:0
            },
            addCateRules:{
                cat_name:[
                    {required: true, message: '请输入分类名称', trigger: 'blur'}]
            },
            parentList:[
                //这里的值用后台接口传过来,注意也要是个数组
            ],
            
            cascaderProp:{ //这里的值都是数据源parentList里头的值
                expandTrigger: 'hover', 
                value:'cat_id',
                label:'cat_name',
                children:'children',
                checkStrictly: true,
            },
            //这个selectedKeys设置为空数组就可以
            selectedKeys:[]
        }
    },
    created(){
        this.getcategoriesList();
    },
    methods: {
        async getcategoriesList(){
            const {data:res} = await this.$http.get('/categories',{
                params:this.queryInfo
            })
            if(res.meta.status!==200) return this.$message.error('请求商品分类列表失败')
            this.categoriesList=res.data.result;
            this.total=res.data.total      
        },
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize;
            this.getcategoriesList();
        },
        handleCurrentChange(newNum){
            this.queryInfo.pagenum=newNum;
            this.getcategoriesList();
        },
        showAddCateVisible(){
            this.addCateVisible=true;
            this.getParentCateList();
        },
        async getParentCateList(){
            const { data: res } = await this.$http.get('categories', {
                params: { type: 2 }
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取父级分类数据失败！')
            }
            this.parentList = res.data
                    
        },
        parentCateChange(){
            console.log(this.selectedKeys);
            
            if(this.selectedKeys.length>0){
                //这里一开始用了pop，其实不可以，因为pop会把原数组改变，这里只是要把原数组的值赋给addCateForm.cat_pid，原数组不能改变
                this.addCateForm.cat_pid= this.selectedKeys[
          this.selectedKeys.length - 1];
                this.addCateForm.cat_level=this.selectedKeys.length;
            }else{
                this.addCateForm.cat_pid=0
                this.addCateForm.cat_level=0
            }
        },
        addCate(){
            this.$refs.addCateRef.validate(async valid=>{
                if(!valid) return;
                const {data:res} = await this.$http.post('categories',this.addCateForm);
                if(res.meta.status!==201) return this.$message.error('添加类别失败!');
                this.$message.success('添加类别成功!');
                this.getcategoriesList();
                this.addCateVisible=false;
            })
        },
        addCateClose(){
            this.$refs.addCateRef.resetFields();
            this.selectedKeys=[]
            this.addCateForm.cat_pid=0
            this.addCateForm.cat_level=0
        }
    },
}
</script>
<style lang="less" scoped>
.treeTable{
    margin-top: 15px;
}
.el-cascader {
  width: 100%;
}

</style>