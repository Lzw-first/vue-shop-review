<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  // 相当于把app这个组件暴露出去，并且命名为app,在public中的index.html可以用
  name: 'app'
}
</script>

<style>
</style>
