<template>
    <div>
         <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 步骤区 -->
             <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>
             <el-steps  :active="activeNum-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
             </el-steps>
             <!-- 表单渲染区 -->
             <!-- 注意这里form必须放在tabs之外 -->
             <el-form  :model="addCate" :rules="addCateRules" ref="addCateRef" label-position="top">
                <el-tabs v-model="activeNum" :tab-position="'left'" :before-leave="tabChange" @tab-click="tabClicked">
                    <el-tab-pane  name="0" label="基本信息">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addCate.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addCate.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addCate.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addCate.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat" > 
                            <!-- 这里v-model绑定的值要传入addCate中，并且api里定义了该值的名称，所以这里直接调用比较好 -->
                            <el-cascader v-model="addCate.goods_cat" :options="cateList" :props="cateProp" @change="selectCate" clearable></el-cascader>
                        </el-form-item>    
                    </el-tab-pane>
                    <el-tab-pane name="1" label="商品参数">
                        <el-form-item v-for="item in catePrams" :key="item.attr_id" :label="item.attr_name">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for="(cb,id) in item.attr_vals" :key="id" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane name="2" label="商品属性">
                        <el-form label-width="100%" label-position="top" v-for="item in cateAttr" :key="item.attr_id">
                            <el-form-item :label="item.attr_name">
                                <el-input v-model="item.attr_vals"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                    <el-tab-pane name="3" label="商品图片">
                        <el-upload :action="uploadPath" :on-preview="handlePreview" :on-remove="uploadRemove" list-type="picture" :headers="authorToken" :on-success="uploadSuccess"> 
                            <el-button size="small" type="primary">点击上传 </el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane name="4" label="商品内容">
                        <!-- 富文本编辑器导入 -->
                          <quill-editor v-model="addCate.goods_introduce">
                         </quill-editor>
                        <!-- 添加按钮 -->
                        <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
             </el-form>
        </el-card>
        <el-dialog title="提示" :visible.sync="previewVisible" width="50%">
            <img :src="previewPath" style="width:100%">
        </el-dialog>
    </div>
</template>
<script>
//注意这里导入lodash插件，必须在export之前，这应该算局部引用？这里的_相当于jq中的$,可以更改，但没必要，最好用官方推荐的。
import _ from 'lodash'
export default {
    data(){
        return {
            activeNum:'0',
            addCate:{
                goods_name:'',
                goods_price:0,
                goods_number:0,
                goods_weight:0,
                goods_introduce:'',
                goods_cat:[],
                pics:[],
                goods_introduce:'',
                attrs:[]
            },
            addCateRules:{
                goods_name:[
                    {required: true, message: '请输入商品名称', trigger: 'blur'}
                ],
                goods_price:[
                    {required: true, message: '请输入商品价格', trigger: 'blur'}
                ],
                goods_number:[
                    {required: true, message: '请输入商品数量', trigger: 'blur'}
                ],
                goods_weight:[
                    {required: true, message: '请输入商品重量', trigger: 'blur'}
                ],
                goods_cat:[
                    {required: true, message: '请选择商品分类', trigger: 'blur'}
                ]
            },
            cateList:[],
            cateProp:{ 
                expandTrigger: 'hover',
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            selectKey:[],
            catePrams:[],
            cateAttr:[],
            uploadPath:'http://127.0.0.1:8888/api/private/v1/upload',
            authorToken:{//注意，这里要定义authorization，upload里头的自带axios并不包含这个属性，注意定义的方法和main.js中一样。
                Authorization : window.sessionStorage.getItem('token')
            },
            previewVisible:false,
            previewPath:''
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        async getCateList(){
            const {data:res} = await this.$http.get('/categories')
            if(res.meta.status!==200) return this.$message.error('获取商品分类信息失败！')
            this.cateList=res.data
        },
        selectCate(){
            if(this.addCate.goods_cat.length!==3){
                this.addCate.goods_cat=''
                return 
            }
        },
        tabChange(activeName, oldActiveName){
            if(oldActiveName=='0' && this.addCate.goods_cat.length!==3){
                this.$message.error('请选择商品分类！')
                return false
            }
        },
        tabClicked(){
            if(this.activeNum==1){
                 this.getCatePrams()    
            }else if(this.activeNum==2){
                this.getCateAttr()
            }
        },
        async getCatePrams(){
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{
                    sel:'many'
                }})
                if(res.meta.status!==200) return this.$message.error('获取商品参数信息失败！')
                //data是一个大数组，attr_vals是其中某个属性的属性，所以要先循环
                res.data.forEach(element => {
                    element.attr_vals=element.attr_vals.length==0? []: element.attr_vals.split(' ')
                });  
                this.catePrams=res.data 
        },
        async getCateAttr(){
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{
                    sel:'only'
            }})
            if(res.meta.status!==200) return this.$message.error('获取商品属性信息失败！')
            this.cateAttr=res.data
            console.log(this.cateAttr);
            
        },
        handlePreview(file){
            this.previewPath=file.response.data.url
            
            this.previewVisible=true
        },
        uploadSuccess(res){
            //注意这里pics里头存的是对象，所以这里的temPath应该是一个对象
            //这里的res直接是一个返回对象，不需要定义
            // console.log(res)
            const temPath = {pic:res.data.tmp_path}
            this.addCate.pics.push(temPath)
        },
        uploadRemove(file){
            console.log(this.addCate);
            
            console.log(file);
            const picPath=file.response.data.tmp_path
            const i=this.addCate.pics.findIndex(x=>x.pic==picPath)
            this.addCate.pics.splice(i,1)
        },
        add(){
            this.$refs.addCateRef.validate(async valid=>{
                if(!valid) return this.$message.error('请输入必填项!')
                // 注意这里要做深拷贝，因为添加商品对于goods_cat要求是一个字符串，而级联选择器对goods_cat的要求是一个空数组，冲突了。做了深拷贝以后，则两者不再干扰
                const form = _.cloneDeep(this.addCate)
                form.goods_cat=form.goods_cat.join(',')
                // 循环动态参数中的相关属性，注意这里的attr_vals中存的是数组
                this.catePrams.forEach(element=>{
                    const newInfo={
                        attr_id:element.attr_id,
                        attr_value:element.attr_vals.join(' ')
                    }
                    this.addCate.attrs.push(newInfo)
                })
                // 循环静态参数中的相关属性，注意这里的attr_vals中存的是字符串
                this.cateAttr.forEach(element=>{
                    const newInfo={
                        attr_id : element.attr_id,
                        attr_value : element.attr_vals
                    }
                    this.addCate.attrs.push(newInfo)
                })
                form.attrs=this.addCate.attrs
                console.log(form);
                const {data:res} = await this.$http.post('goods',form)
                console.log(res);
                
                if(res.meta.status!=201) return this.$message.error('添加失败')
                this.$message.success('添加成功')
                this.$router.push('/goods')
            })
           
           
        }
    },
    computed:{
        cateId(){
            if(this.addCate.goods_cat.length===3){
                return this.addCate.goods_cat[2]
            }
            return null
        }
    }
}
</script>
<style lang="less" scoped>
.el-checkbox{
    margin: 0 10px 0 0 !important; 
}
.btnAdd{
    margin-top: 15px;
}
</style>