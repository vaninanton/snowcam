import axios from "axios";

const httpClient = axios.create({});

export default {
  install: (app) => {
    const { globalProperties } = app.config;

    globalProperties.$http = httpClient;
    globalProperties.$isLoading = false;

    httpClient.interceptors.request.use((config) => {
      globalProperties.$isLoading = true;

      return config;
    });

    httpClient.interceptors.response.use(
      (res) => {
        globalProperties.$isLoading = false;

        return Promise.resolve(res.data);
      },
      (err) => {
        globalProperties.$isLoading = false;

        return Promise.reject(err);
      },
    );
  },
};
