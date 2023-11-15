import axios from "axios";

const httpClient = axios.create({});

export default {
  install: (app) => {
    app.config.globalProperties.$http = httpClient;
    app.config.globalProperties.$isLoading = false;

    httpClient.interceptors.request.use((config) => {
      app.config.globalProperties.$isLoading = true;

      return config;
    });

    httpClient.interceptors.response.use(
      (res) => {
        app.config.globalProperties.$isLoading = false;

        return Promise.resolve(res.data);
      },
      (err) => {
        app.config.globalProperties.$isLoading = false;

        return Promise.reject(err);
      },
    );
  },
};
