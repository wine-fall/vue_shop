<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-table :data="rightList" border stripe>
                <el-table-column type="index" label="索引" width="80px"></el-table-column>
                <el-table-column prop="authName" label="权限名称"></el-table-column>
                <el-table-column prop="path" label="权限路径"></el-table-column>
                <el-table-column prop="level" label="权限等级">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level==0">一级</el-tag>
                        <el-tag v-else-if="scope.row.level==1" type="success">二级</el-tag>
                        <el-tag v-else type="warning">三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            rightList:[]
        }
    },  
    methods:{
        async getRightList(){
            const {data:res} = await this.$http.get('rights/list')
            if(res.meta.status!==200) return this.$message.error('请求失败')
            this.rightList=res.data
        }
    },
     created(){
        this.getRightList();
    },
    
}
</script>
<style lang="less" scoped>

</style>
