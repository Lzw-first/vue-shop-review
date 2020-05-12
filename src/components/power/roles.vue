<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
      </el-row>

      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item, k) in scope.row.children"
              :key="item.id"
              :class="['bd_bottom', k === 0 ? 'bd_top' : '', 'v_center']"
            >
              <!-- 这是放一级标签的 -->
              <el-col :span="5">
                <el-tag closable @close="rightTagClose(scope.row, item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 这是放二三级标签的 -->
              <el-col :span="19">
                <!-- 二级标签 -->
                <el-row
                  v-for="(item2, k2) in item.children"
                  :key="item2.id"
                  :class="[k2 !== 0 ? 'bd_top' : '', 'v_center']"
                >
                  <el-col :span="5">
                    <el-tag
                      type="success"
                      closable
                      @close="rightTagClose(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="19">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="rightTagClose(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRole(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightsDialog(scope.row)"
            >分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <span>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleItem">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%">
      <span>
        <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleItem">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRighrsDialogClose"
    >
      <span>
        <el-tree
          :props="setProp"
          :data="rightsList"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="checkedKeys"
          ref="treeRef"
        ></el-tree>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '请输入2~10个字符的名称', trigger: 'blur' }
        ],
        roleDesc: [{ max: 100, message: '请控制再100个字符内', trigger: 'blur' }]
      },
      editDialogVisible: false,
      editForm: {},
      setRightsDialogVisible: false,
      rightsList: [],
      // 默认选中的项
      checkedKeys: [],
      // 设置tree显示规则
      setProp: {
        label: 'authName',
        children: 'children'
      },
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      console.log(res)
      this.rolesList = res.data
    },
    addRoleItem() {
      // 先验证表单信息是否正确
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请正确填写内容后重新提交')
        // 发送请求添加角色
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        this.getRolesList()
        this.addDialogVisible = false
      })
    },
    // 关闭添加框时重置
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 显示编辑页面并获取数据
    async showEditDialog(id) {
      // 根据id获取数据
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询角色数据失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑提交角色
    editRoleItem() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请正确填写内容后重新提交')
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('修改角色失败')
        this.$message.success('修改角色成功')
        this.getRolesList()
        this.editDialogVisible = false
        this.editForm = {}
      })
    },
    // 删除角色
    removeRole(id) {
      // 弹出确认信息
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // 发送请求删除角色
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) return this.$message.error('角色删除失败')
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getRolesList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },

    // 删除角色指定权限
    rightTagClose(role, rightId) {
      this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // 发送请求删除角色
          const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          // 更新当前角色取得权限
          role.children = res.data
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },

    // 显示分配角色框
    async showSetRightsDialog(row) {
      // 保持当前角色的id
      this.roleId = row.id
      // 发送请求获取权限信息
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }
      this.rightsList = res.data
      // 通过递归查询到默认的三级权限
      this.getLeafKeys(row, this.checkedKeys)
      this.setRightsDialogVisible = true
    },
    // 获取三级权限的递归函数
    getLeafKeys(rights, arr) {
      if (!rights.children) {
        return arr.push(rights.id)
      }
      rights.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 关闭设置权限对话框时清空默认的选中项
    setRighrsDialogClose() {
      this.checkedKeys = []
    },
    // 确定授权
    async setRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const keyString = keys.join(',')
      const { data: res } = await this.$http.post('roles/' + this.roleId + '/rights', {
        rids: keyString
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      }

      this.$message.success('更新角色成功')

      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bd_bottom {
  border-bottom: 1px solid #eee;
}
.bd_top {
  border-top: 1px solid #eee;
}
.v_center {
  display: flex;
  align-items: center;
}
</style>
