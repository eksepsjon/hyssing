import { createApp, h } from 'vue'
import { createWebHashHistory, createRouter } from "vue-router";
import App from './App.vue'
import ProcessData from './components/ProcessData.vue'
import NextApp from './components/NextApp.vue'

import './index.css'

const routes = [
    { path: '/', component: NextApp },
]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})

const app = createApp({ render: () => h(App) });

app.use(router);

app.mount('#app')