<template >
    <div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 搜索区 -->
            <el-row>
                <el-col>
                    <!-- 注意这里的button是放在inpu标签里头的，所以一定要加slot="append"，不然显示不出来 -->
                    <el-input placeholder="请输入内容" style="width:200px"><el-button slot="append" icon="el-icon-search"></el-button></el-input>
                </el-col>
            </el-row>
            <!-- 表格渲染区 -->
            <el-table :data="goodsList">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" >
                    <template slot-scope="scope" >
                        <el-tag type="danger" v-if="scope.row.pay_status=='0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dataForm}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <el-button type="primary" icon="el-icon-edit" @click="showDialog"></el-button>
                    <el-button type="success" icon="el-icon-map-location" @click="showTimeline"></el-button>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="this.queryInfo.pagenum" :page-sizes="[10, 20, 30, 40]" :page-size="this.queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="this.total"></el-pagination>
        </el-card>
        <!-- 修改地址对话框 -->
        <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressClosed">
            <el-form :model="editAddress" :rules="editAddressRules" ref="editAddressRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader v-model="editAddress.address1" :options="citydata" :props="addressProp" @change="handleChange"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="editAddress.address2"></el-input>
                </el-form-item>
            </el-form>           
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
        
        
        
        </el-dialog>
        <!-- 时间线 -->
        <el-dialog title="物流信息" :visible.sync="arriveVisible" width="50%" >
            <el-timeline>
                <el-timeline-item
                v-for="(item, index) in goodsTime"
                :key="index"
                :timestamp="item.time">
                {{item.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>
<script>
import citydata from './citydata.js'
export default {
    data(){
        return{
         queryInfo:{
             query:'',
             pagenum:1,
             pagesize:10
         },
         total:0,
         goodsList:[],
         citydata,
         addressVisible:false,
         editAddress:{
             address1:[],
             address2:''
         },
         addressProp:{ expandTrigger: 'hover' },
         editAddressRules:{
             address1:[
                 {required: true, message: '请选择省市区/县', trigger: 'blur'}
             ],
             address2:[
                 {required: true, message: '输入详细地址', trigger: 'blur'}
             ]
         },
         arriveVisible:false,
         goodsTime:[]
        }
    },
    created(){
        this.getOrder();
    },
    methods:{
        async getOrder(){
            const{data:res}=await this.$http.get('orders',{
                params:this.queryInfo
            })
            if(res.meta.status!==200) return this.$message.error('获取订单数据失败')
            console.log(res.data);
            this.total=res.data.total,
            this.goodsList=res.data.goods
        },
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize
            this.getOrder();
        },
        handleCurrentChange(newNum){
            this.queryInfo.pagenum=newNum
            this.getOrder();
        },
        showDialog(){
            this.addressVisible=true
        },
        handleChange(){
            console.log('ok');
            
        },
        addressClosed(){
            this.$refs.editAddressRef.resetFields();
        },
        async showTimeline(){
            const {data:res} = await this.$http.get('/kuaidi/1106975712662')
            if (res.meta.status!==200) return this.$message.error('获取物流信息失败！')
            this.goodsTime=res.data      
            this.arriveVisible=true
        }

    }
}
</script>
<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-dialog{
    width: 100px;
}
</style>