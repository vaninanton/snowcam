import { createApp } from "vue";
import "./style.css";
import Tma from "./components/Tma.vue";
import httpPlugin from "./http";

const app = createApp(Tma);
app.use(httpPlugin);
app.mount("#app");
