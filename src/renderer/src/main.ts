import './assets/main.css'
import './assets/theme.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './routes'

const app = createApp(App)
app.use(router).mount('#app')
