import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App.vue'
import Test from './pages/test.vue'
import Editable from './pages/editable.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/editable',
    },
    {
      path: '/test',
      component: Test,
    },
    {
      path: '/editable',
      component: Editable,
    },
  ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
