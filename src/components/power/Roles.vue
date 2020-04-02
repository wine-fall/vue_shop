<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table :data="roleList">
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <!-- 注意这里的for循环加在什么地方 以及为什么要加el-row-->
                        <el-row :class="['ibottom',i1==0?'itop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <el-col :span="6" >
                                <el-tag closable @close="removeRightsById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="18">
                                <el-row :class="[i2==0?'':'itop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <el-col :span="6" >
                                        <el-tag type="warning" closable @close="removeRightsById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="12" >
                                        <el-tag v-for="item3 in item2.children" :key="item3.id" type="success" closable @close="removeRightsById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                    
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEidtDialog(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row.id)"></el-button>
                        <el-tooltip class="item" effect="dark" content="设置权限" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightsDialog(scope.row)"></el-button>
                        </el-tooltip>  
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 编辑角色弹出框 -->
        <el-dialog title="编辑角色" :visible.sync="editRolesVisible" label-width="50%" @close="FormClosed">
            <el-form ref="FormRef" :model="editForm" label-width="80px">
                <el-form-item label="角色名称" prop="roleName" >
                    <el-input v-model="editForm.roleName" disabled></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc" >
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 弹出框底部 -->
            <div slot="footer" class="dialog-footer">
                <el-button @click="editRolesVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoles">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 设置权限弹出框 -->
        <el-dialog title="设置权限" :visible.sync="editRightsVisible" width="50%" @close="setRightsDialogClosed">
            <el-tree :data="rightList" :props="rightsProps" show-checkbox default-expand-all :default-checked-keys="defKeys" node-key="id" ref="rightsRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRightsVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            roleList:[],
            editRolesVisible:false,
            editForm:{

                roleName:'',
                roleDesc:''
            },
            editRightsVisible:false,
            rightList:[],
            rightsProps:{
                label:'authName',
                children:'children'
            },
            defKeys:[],
            roleId:''
        }
    },
    methods:{
        async getRoleList(){
            const {data:res}=await this.$http.get('roles');
            if(res.meta.status!==200) return this.$message.error('获取角色列表失败')
            this.roleList=res.data
        },
        async showEidtDialog(id){
            const {data:res}=await this.$http.get('roles/'+id);
            if(res.meta.status!=200) return this.$message.error('查询失败');
            this.editRolesVisible=true;
            this.editForm=res.data;
        },
        FormClosed(){
            this.$refs.FormRef.resetFields();
        },
        async editRoles(){
            const {data:res}=await this.$http.put('roles/'+this.editForm.roleId,this.editForm);
            if(res.meta.status!=200) return this.$message.error('修改失败');
            this.$message.success('修改成功');
            this.getRoleList();
            this.editRolesVisible=false;
        },
        async deleteRole(id){
            const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(
                err=>err
            )
            if(confirmResult=='cancel'){return this.$message.info('已经取消删除')}
            const {data:res}=await this.$http.delete('roles/'+id);
            if(res.meta.status!=200) return this.$message.error('删除失败');
            this.$message.success('删除成功')
            this.getRoleList();

        },
        async removeRightsById(role,rightId){
            const delConfirm=await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err=>err); 
            if(delConfirm=='cancel') {return this.$message.info('取消了删除')}
            const {data:res}=await this.$http.delete('roles/'+role.id+'/rights/'+rightId);
            if(res.meta.status!=200){return this.$message.error('删除失败')}
            this.$message.success('删除成功');
            console.log(res.data);
            
            role.children=res.data;
            // 如果要重新获取角色的话，那么会重新渲染页面，会强制关闭展开行，所以最好用上面这种办法
            // this.getRoleList();
            
        },
        getDefaultsKey(node,arr){
            if(!node.children){
                return arr.push(node.id);
            }
            node.children.forEach(element => {
                this.getDefaultsKey(element,arr)
            });
        },
        async showSetRightsDialog(role){
            this.roleId=role.id;
            const { data: res } = await this.$http.get('rights/tree')

            if (res.meta.status !== 200) {
                return this.$message.error('获取权限数据失败！')
            }
            this.rightList = res.data
            this.getDefaultsKey(role,this.defKeys)
            console.log(this.defKeys);
            
            this.editRightsVisible=true;
        },
        setRightsDialogClosed(){
            this.defKeys=[]
        },
        async editRights(){
            const treeKey=[
                ...this.$refs.rightsRef.getCheckedKeys(),
                ...this.$refs.rightsRef.getHalfCheckedKeys()
            ]
            console.log(treeKey);
            
            const idStr=treeKey.join(',') 
            console.log(idStr);
            
            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{
                rids:idStr
            });
            if (res.meta.status!==200) return this.$message.error('授权失败！')
            this.getRoleList();
            this.editRightsVisible=false;
        }
        
    },
    created(){
        this.getRoleList();
    }
    
}
</script>
<style lang="less" scoped>
    .ibottom{
        border-bottom: 1px solid #eee;
    }
    .itop{
        border-top: 1px solid #eee;
    }
    .el-tag{
        margin: 10px;
    }

    .vcenter{
        display: flex;
        align-items: center;
    }
</style>