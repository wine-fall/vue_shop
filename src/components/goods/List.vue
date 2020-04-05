<template>
    <div>
         <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图 -->
        <el-card>
            <!-- 搜索区 -->
            <el-row>
                <el-col :span="8" >
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodList">           
                        <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4"><el-button type="primary" @click="goAddPage">添加商品</el-button></el-col>
            </el-row>
            <!-- 表格渲染区 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称" ></el-table-column>
                <el-table-column prop="goods_price" label="商品价格（元）" width="95px"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
                <el-table-column prop="add_time" label="创建时间" width="180px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dataForm}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleList(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>
<script>
export default {
    data(){
        return{
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:5
            },
            total:0,
            goodsList:[]
            
        }
    },
    created(){
        this.getGoodList();
    },
    methods:{
        async getGoodList(){
            const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
            if(res.meta.status!==200) return this.$message.error('请求商品列表失败')
            this.goodsList=res.data.goods
            this.total=res.data.total
        },
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize;
            this.getGoodList();
        },
        handleCurrentChange(newNum){
            this.queryInfo.pagenum=newNum
            this.getGoodList();
        },
        async deleList(id){
            const confirmResult=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=>err)
            if (confirmResult=='cancel') return this.$message.info('已经取消删除')
            const {data:res}= await this.$http.delete(`goods/${id}`)
            if(res.meta.status!==200) return this.$message.error('删除商品失败')
            this.getGoodList()
        },
        goAddPage(){
            // 前面省略的路径是当前的路径，也就是home（goods之类的路径都是home的子路径）
            this.$router.push('/goods/add')
        }
    }
}
</script>
<style lang="less" scoped>
    .el-col{
        margin-right: 15px;
    }
    .el-table{
        margin-top: 15px;
    }
</style>