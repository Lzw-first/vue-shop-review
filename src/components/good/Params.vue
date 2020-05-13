<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告信息 -->
      <el-alert title="注意:只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>
      <!-- 选择商品分类框 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProp"
            @change="handleChange"
            size="medium"
            style="width: 250px"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数部分 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加按钮 -->
          <el-button type="primary" @click="showDialog" size="small" :disabled="isBtnVisable">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, k) in scope.row.attr_vals"
                  :key="k"
                  class="paramsTag"
                  closable
                  @close="handleClose(scope.row, k)"
                >{{item}}</el-tag>
                <!-- 添加新tag -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加按钮 -->
          <el-button type="primary" @click="showDialog" size="small" :disabled="isBtnVisable">添加参数</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, k) in scope.row.attr_vals"
                  :key="k"
                  class="paramsTag"
                  closable
                  @close="handleClose(scope.row, k)"
                >{{item}}</el-tag>
                <!-- 添加新tag -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 共用 -->
    <el-dialog
      :title="'添加' + activeTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <span>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="activeTitle" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数对话框 -->
    <el-dialog :title="'编辑' + activeTitle" :visible.sync="editDialogVisible" width="50%">
      <span>
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="activeTitle" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      catelist: [],
      cateProp: {
        // 还需要设置选中的值 是 id值 组成的数组
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedCateKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      // 添加信息
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{ required: true, message: '请输入对应名称', trigger: 'blur' }]
      },
      editDialogVisible: false,
      editForm: {},
      editRules: {
        attr_name: [{ required: true, message: '请输入对应名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCatelist()
  },
  methods: {
    async getCatelist() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器控制
    handleChange() {
      console.log(this.selectedCateKeys)
      this.getParamsData()
    },
    // 标签页控制函数
    handleClick() {
      // 获取对应数据
      this.getParamsData()
    },
    // 获取动态参数/静态属性数据
    async getParamsData() {
      // 先验证是不是选中三级分类标签
      if (this.selectedCateKeys.length !== 3) {
        // 清空数据
        this.manyTableData = []
        this.onlyTableData = []
        this.selectedCateKeys = []
        return this.$message.error('只能选择第三级分类')
      }
      // 如果获取成功 向服务器发送请求获取对应数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      // 为什么这个的attr_vals也是显示数组
      console.log(res.data)
      // 将res.data中的attr_vals 变成字符串 好渲染
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 同时分别添加对应的显示和对应的值
        item.inputVisible = false
        item.inputValue = ''
      })
      // 再根据具体的active赋值
      console.log(res.data)

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },

    // 显示添加对话框
    showDialog() {
      this.addDialogVisible = true
    },
    // 确认添加参数
    addItem() {
      // 先验证表单信息
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写要添加的名称后再确认添加')
        // 发送添加请求
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error(`添加${this.activeTitle}失败`)
        this.$message.success(`添加${this.activeTitle}成功`)
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    // 添加对话框关闭时
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 删除tag
    handleClose(row, k) {
      row.attr_vals.splice(k, 1)
      this.saveAttrVals(row)
    },
    // 修改完tag后向系统保存发送
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },

    // 显示添加新参数的文本框   直接在button中设置 还要设置文本框获取焦点，所以不能直接写在标签内
    showInput(row) {
      row.inputVisible = true
      // 点击显示输入框并获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 回车或者失去焦点 自动保存
    handleInputConfirm(row) {
      // 先判断是否输入了内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        // 直接隐藏
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },

    // 显示编辑参数对话框
    showEditDialog(row) {
      this.editForm = row
      console.log(this.editForm)

      this.editDialogVisible = true
    },
    // 确认修改参数名称
    editItem() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请检查填写是否符合规范，再重新提交')
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error(`修改${this.activeTitle}失败`)
        this.$message.success(`修改${this.activeTitle}成功`)
        this.getParamsData()
        this.editDialogVisible = false
        this.editForm = {}
      })
    },

    // 删除参数
    async removeParams(row) {
      const confirmRes = await this.$confirm('确定继续删除该属性?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)
      if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getParamsData()
    }
  },
  computed: {
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    activeTitle() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
    isBtnVisable() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 20px 0;
  span {
    margin-right: 15px;
  }
}
.paramsTag {
  margin-right: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
