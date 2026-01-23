<template>
  <div id="app">
    <header>
      <router-link to="/editable">Editable</router-link> |
      <router-link to="/test">Test</router-link>
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
header {
  margin-bottom: 20px;
}
</style>
