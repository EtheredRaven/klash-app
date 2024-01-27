import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createStore } from "./store";

// Init app
const app = createApp(App);
app.config.productionTip = false;

import toasts from "./plugins/toasts";
app.use(toasts);

// Init socket connection
import socket from "./plugins/socket";
app.use(socket);

// Store
const store = createStore(app);
app.use(store);

app.use(router).mount("#app");
