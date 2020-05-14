<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 商品分类列表 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        border
        show-index
        index-text
        :show-row-hover="false"
        class="treeTable"
      >
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: green"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" type="primary">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button
            icon="el-icon-edit"
            type="primary"
            size="small"
            @click="showEditDialog(scope.row)"
          >编辑</el-button>
          <el-button
            icon="el-icon-delete"
            type="danger"
            size="small"
            @click="removeCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <span>
        <el-form :model="addForm" :rules="editFormRules" ref="addFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="分类父级">
            <el-cascader
              v-model="cateParentKeys"
              :options="cateParentList"
              :props="cateProp"
              @change="handleChange"
            ></el-cascader>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%">
      <span>
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      queryInfo: {
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt' }
      ],
      editDialogVisible: false,
      editForm: {
        cat_id: '',
        cat_name: ''
      },
      editFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      addForm: {
        cat_name: '',
        // 分类父ID，如果要添加1级分类，则父分类Id应该设置为  `0`
        cat_pid: 0,
        // 0表示一级分类
        cat_level: 0
      },
      addDialogVisible: false,
      // 选择的父级节点数据
      cateParentKeys: [],
      // 父级节点列表
      cateParentList: [],
      cateProp: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.cateList = res.data.result
      this.total = res.data.total
      console.log(this.cateList)
    },
    handleSizeChange(actsize) {
      this.queryInfo.pagesize = actsize
      this.getCateList()
    },
    handleCurrentChange(actpage) {
      this.queryInfo.pagenum = actpage
      this.getCateList()
    },
    async showEditDialog(row) {
      this.editForm.cat_name = row.cat_name
      this.editForm.cat_id = row.cat_id
      this.editDialogVisible = true
    },
    // 确认修改商品分类
    editCate() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请检查后再重新确认')
        // 发送请求修改商品分类
        const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, {
          cat_name: this.editForm.cat_name
        })
        if (res.meta.status !== 200) return this.$message.error('修改分类名称失败')
        this.$message.success('修改成功')
        this.getCateList()
        this.editDialogVisible = false
      })
    },
    removeCate(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('categories/' + id)
          if (res.meta.status !== 200) return this.$message.error('删除角色失败')
          this.getCateList()
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
    // 显示添加分类对话框
    async showAddDialog() {
      // 获取到二级分类的数据
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级列表失败')
      }
      this.cateParentList = res.data
      this.addDialogVisible = true
    },
    // 级联选择器改变的时候
    handleChange() {
      console.log(this.cateParentKeys)

      // 判断是否选中了
      if (this.cateParentKeys.length > 0) {
        // 若选中了
        this.addForm.cat_pid = this.cateParentKeys[this.cateParentKeys.length - 1]
        this.addForm.cat_level = this.cateParentKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // 确认添加
    addCate() {
      // 验证表单是否填写正确
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请按规定填写好内容再提交')
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addDialogVisible = false
      })
    },
    // 添加对话框关闭时
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
      // 同时重置那么这些选项
      this.selectedKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin: 15px 15px 15px 0;
}
</style>
