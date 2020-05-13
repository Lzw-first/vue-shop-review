<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/MyLogoTr.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout" class="logoutBtn" size="small">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '60px' : '200px'">
        <!-- 只保持一个子菜单展开unique-opened -->
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          router
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="activePath"
        >
          <div class="toggle_button" @click="toggleCollapse">|||</div>
          <!-- 一级菜单 index 是需要填写的字符串，但是获取的id是数字，所以需要转化为字符串-->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + item2.path"
              v-for="item2 in item.children"
              :key="item2.id"
              @click="savePath('/' + item2.path)"
            >
              <i class="el-icon-menu"></i>
              {{item2.authName}}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      // 建立一个对象对应好各列表的图标
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 控制侧边栏缩放
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    async logout() {
      // 弹出款确认是否退出
      await this.$confirm('是否退出当前用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          window.sessionStorage.clear()
          this.$router.push('/login')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 获取导航菜单列表
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    savePath(actpath) {
      window.sessionStorage.setItem('activePath', actpath)
      this.activePath = actpath
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  display: flex;
  background-color: #373d41;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 0;
  > div {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    color: #ffffff;
    > img {
      height: 60px;
      width: 70px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
    i {
      margin-right: 10px;
    }
  }
}
.el-main {
  background-color: #eaedf1;
}
.toggle_button {
  height: 24px;
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
