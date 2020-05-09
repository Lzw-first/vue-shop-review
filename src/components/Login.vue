<template>
  <div class="logn_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="用户头像" />
      </div>
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="0px">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" aria-placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item class="loginBtns">
          <el-button type="primary" @click="loginToHome">登录</el-button>
          <el-button type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '请输入3~10位的用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '请输入6~16位的密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    loginToHome() {
      // 验证表单格式时候满足条件
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          // 像服务器发送请求登录
          var { data: res } = await this.$http.post('login', this.loginForm)
          if (res.meta.status !== 200) {
            return this.$message.error('登录失败，请重新校验用户名和密码')
          }
          this.$message.success('登录成功')
          // 保存后端传递过来的 token
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('home')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.logn_container {
  // 因为是跟着父盒子变化的，所以要设置body、html的高度
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #ffffff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 5px;
}
.avatar_box {
  width: 130px;
  height: 130px;
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid #eeeeee;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px #ddd;
}
.avatar_box > img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.el-form {
  position: absolute;
  box-sizing: border-box;
  left: 0;
  bottom: 5px;
  padding: 0 20px;
  width: 100%;
}
.loginBtns {
  display: flex;
  justify-content: flex-end;
}
</style>
