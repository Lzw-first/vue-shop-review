<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框及添加用户 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="searchSomeUser"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddUser">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 在谷歌浏览器中会出现边线对不齐的情况-->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showAssignRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="isAddUserVisible" width="50%" @close="addUserClose">
      <span>
        <el-form :model="addUserForm" :rules="UserRules" ref="addUserFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isAddUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserItem">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <span>
        <el-form :model="editUserForm" :rules="UserRules" ref="editUserFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editUserForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserItem">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配橘色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="assignDialogVisible"
      width="50%"
      @close="assignDialogClose"
    >
      <div>
        <p>当前的用户: {{userInfo.username}}</p>
        <p>当前的角色: {{userInfo.role_name}}</p>
        <p>
          变更角色为:
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的规则
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (!regEmail.test(value)) {
        return cb(new Error('请输入合法的邮箱'))
      }
      cb()
    }
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的规则
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (!regMobile.test(value)) {
        return cb(new Error('请输入合法的手机号'))
      }
      cb()
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      // 控制添加用户的对话框
      isAddUserVisible: false,
      UserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '请输入3~10个字符的用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '请输入6~16位的密码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editDialogVisible: false,
      editUserForm: {},
      userId: 0,
      // 分配角色对话框
      assignDialogVisible: false,
      // 存放当前要分配角色的信息
      userInfo: {},
      // 获取的角色列表
      rolesList: [],
      // 选择的角色id
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 请求用户列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 查询用户
    searchSomeUser() {
      this.getUserList()
    },
    // 改变用户状态
    async changeUserState(user) {
      const { data: res } = await this.$http.put(`users/${user.id}/state/${user.mg_state}`)
      if (res.meta.status !== 200) {
        return this.$message.error('修改用户信息失败')
      }
      this.$message.success('修改用户信息成功')
    },
    // 显示添加用户对话框
    showAddUser() {
      this.isAddUserVisible = true
    },
    // 确认添加用户
    addUserItem() {
      // 验证内容是否填写正确
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请按要求正确填写后再提交')
        }
        // 发送请求添加用户
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.getUserList()
        this.isAddUserVisible = false
      })
    },
    // 关闭对话框前都清空内容
    addUserClose() {
      this.$refs.addUserFormRef.resetFields()
    },

    // 显示修改用户信息
    async editUser(id) {
      // 显示对话框
      this.editDialogVisible = true
      // 发送请求获取对应id的用户信息
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.message.error('获取用户信息失败')
      }
      this.editUserForm = res.data
      this.userId = res.data.id
    },
    // 修改用户
    editUserItem() {
      this.$confirm('是否确认修改用户？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 先验证变单信息
          this.$refs.editUserFormRef.validate(async valid => {
            if (!valid) return this.$message.error('请填写正确的格式再重新确认')
            // 发送请求修改对应用户
            const { data: res } = await this.$http.put('users/' + this.userId, {
              email: this.editUserForm.email,
              mobile: this.editUserForm.mobile
            })
            if (res.meta.status !== 200) {
              return this.$message.error('修改失败')
            }
            this.getUserList()
            this.editDialogVisible = false
            return this.$message({
              type: 'success',
              message: '修改成功!'
            })
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消修改'
          })
        })
    },
    editDialogClose() {
      this.$refs.editUserFormRef.resetFields()
    },
    // 删除用户
    deleteUser(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // 发送请求删除对应用户
          const { data: res } = await this.$http.delete('users/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          this.getUserList()
          return this.$message({
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
    // 弹出分配角色功能
    async showAssignRole(userinfo) {
      this.userInfo = userinfo
      // 获取角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      console.log(res)
      this.rolesList = res.data
      this.assignDialogVisible = true
    },
    // 分配角色
    async assignRole() {
      const { data: res } = await this.$http.put('users/' + this.userInfo.id + '/role', { rid: this.selectRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('修改用户角色失败')
      }
      this.$message.success('修改用户角色成功')
      this.getUserList()
      this.assignDialogVisible = false
    },
    // 分配角色框关闭时
    assignDialogClose() {
      this.userInfo = {}
      this.selectRoleId = ''
    },
    // 分页功能
    handleSizeChange(activeSize) {
      this.queryInfo.pagesize = activeSize
      this.getUserList()
    },
    // 改变当前页
    handleCurrentChange(activePage) {
      this.queryInfo.pagenum = activePage
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
