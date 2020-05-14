<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <!-- 进度条 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Tabs栏 -->
      <el-form :model="goodForm" :rules="goodFormRules" ref="goodFormRef" label-width="100px" label-position="top">
        <el-tabs tab-position="left" :before-leave="tabBeforeLeave" v-model="activeIndex" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="goodForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="goodForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="goodForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader
                v-model="cateKeys"
                :options="cateList"
                :props="cateProp"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 直接绑定的是attr_vals 这个数组，所以一点消失那么选中的就没了 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item2" v-for="(item2, k) in item.attr_vals" :key="k" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input type="text" v-model="item.attr_vals" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccess"
              :headers="headersObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4" class="textTab">
            <quill-editor v-model="goodForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <span>
        <img :src="previewPath" class="previewImg" />
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 导入 lodash 依赖，进行深拷贝，防止直接改变
// import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      goodForm: {
        goods_name: '',
        // 级联选择器选中的
        goods_cat: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      goodFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, message: '最少输入两个字符', trigger: 'blur' }
        ],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }]
      },
      cateList: [],
      // 级联选择器选中的id值
      cateKeys: [],
      cateProp: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 保存动态参数的数组
      manyTableData: [],
      onlyTableData: [],
      // 文件上传到的默认地址，入口文件中设置的默认地址后面加 upload
      upload: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传的文件列表
      fileList: [],
      // 上传的请求头 这个上传组件会自动上传到对应的默认地址，不经过axios
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewDialogVisible: false,
      // 存放预览图片的地址
      previewPath: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.cateList = res.data
    },
    handleChange() {
      if (this.cateKeys.length !== 3) {
        this.$message.error('只能选中第三级分类')
        this.cateKeys = []
      }
    },
    // 离开当前标签页时候的函数
    tabBeforeLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.cateKeys.length !== 3) {
        this.$message.error('请选择三级分类后再往下')
        return false
      }
    },
    // tab 被选中时触发
    async tabClicked() {
      // 选中商品参数
      if (this.activeIndex === '1') {
        // 发送请求获取动态参数
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
        // 将其中的 attr_vals 变成数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        // 选中商品属性
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 结合 el-checkbox 标签的@change="showGoodFormAttrs" 验证了每次采用这样数组的形式每次添加的
    // showGoodFormAttrs() {
    //   console.log(this.goodForm.attrs)
    // }
    // :on-preview="handlePreview" 点击文件列表中已上传的文件时的钩子 浏览图片时候用
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.url
      this.previewDialogVisible = true
    },
    // :on-remove="handleRemove" 文件列表移除文件时的钩子
    handleRemove(file) {
      console.log(file)
      // 1、保存要删除的地址
      const removePath = file.response.data.tmp_path
      // 2、在 goodForm 中的 pics 找到要删除的 Index
      const index = this.goodForm.pics.findIndex(item => item.pic === removePath)
      // 3、删除
      this.goodForm.pics.splice(index, 1)
      console.log(this.goodForm.pics)
    },
    // :on-success="handleSuccess" 文件上传成功时的钩子
    handleSuccess(response) {
      // 拼接好路径
      const picInfo = { pic: response.data.tmp_path }
      // 添加到 goodForm 中
      this.goodForm.pics.push(picInfo)
      console.log(this.goodForm)
    },
    // 正式添加商品
    addGoods() {
      // 先检查是否满足规则
      this.$refs.goodFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请检查好是否都按规则填写，再重新提交')
        // 编辑好商品参数的格式并添加
        this.manyTableData.forEach(item => {
          const attrInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.goodForm.attrs.push(attrInfo)
        })
        // 编辑添加商品属性
        this.onlyTableData.forEach(item => {
          const attrInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.goodForm.attrs.push(attrInfo)
        })
        // 添加分类id 转化为字符串格式
        this.goodForm.goods_cat = this.cateKeys.join(',')
        console.log(this.goodForm)
        // 发送请求添加商品
        const { data: res } = await this.$http.post('goods', this.goodForm)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.cateKeys.length === 3) {
        return this.cateKeys[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.previewImg {
  width: 100%;
}
.textTab {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.addBtn {
  margin-top: 15px;
}
</style>
