<template>
  <div
    class="flex flex-col items-center justify-center w-screen text-gray-700 px-6 pt-5 bg-gradient-to-br"
  >
    <div
      class="w-full max-w-screen-sm bg-white p-4 rounded-xl ring-8 ring-white ring-opacity-40"
    >
      <div class="flex justify-between">
        <div class="flex flex-col">
          <span class="font-semibold mt-1 text-gray-500">Сейчас</span>
          <span class="text-6xl font-bold">
            <span v-if="nowWeather"
              >{{ Math.floor(nowWeather.temperature) }}°C</span
            >
          </span>
          <div class="flex cols-2 gap-4">
            <div class="text-xs font-light text-gray-400">
              Ветер:
              <span v-if="nowWeather">{{ nowWeather.windspeed }} m/s</span>
            </div>
            <div class="text-xs font-light text-gray-400">
              Осадки:
              <span v-if="nowWeather"
                >{{ nowWeather.precipitation_probability }} %</span
              >
            </div>
          </div>
        </div>
        <img
          :src="nowWeather.img"
          v-if="nowWeather"
          alt=""
          class="h-20"
          @click="reload"
        />
      </div>

      <div class="flex snap-x snap-mandatory overflow-x-auto mt-6 lg:mt-12">
        <div
          class="snap-start shrink-0 w-1/4 sm:w-1/5 md:w-1/6"
          v-for="hour in forecast"
        >
          <div class="flex flex-col items-center">
            <div class="font-semibold text-sm">
              {{ hour.time.format("HH:mm") }}
            </div>
            <div class="font-extralight text-xs">
              {{ hour.time.format("DD.MM") }}
            </div>
            <img
              :src="hour.img"
              alt=""
              class="h-8 fill-current text-gray-400 mt-3"
            />
            <div class="font-semibold mt-1 text-sm">
              {{ Math.floor(hour.temperature) }}°C
            </div>
            <div class="text-xs font-light text-gray-400">
              {{ hour.windspeed }} m/s
            </div>
            <div class="text-xs font-light text-gray-400">
              {{ hour.precipitation_probability }} %
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import dayjs from "dayjs";

export default {
  data() {
    return {
      weatherData: null,
      limit: null,
    };
  },
  methods: {
    reload() {
      localStorage.removeItem("meteoBlueData");
      window.location.reload();
    },
    async getMeteoBlue() {
      // Проверяем, есть ли данные в локальном хранилище
      const cachedData = localStorage.getItem("meteoBlueData");

      if (cachedData) {
        // Если данные есть в кеше, возвращаем их
        this.weatherData = JSON.parse(cachedData);
      } else {
        // Если данных нет в кеше, делаем запрос к API
        const response = await fetch(
          "https://api-v2.shymbulak-dev.com/content-service/weather/meteoblue",
        );

        if (response.ok) {
          // Если запрос успешный, сохраняем данные в кеше и возвращаем их
          const data = await response.json();
          this.weatherData = data;
          localStorage.setItem("meteoBlueData", JSON.stringify(data));
        } else {
          // Обработка ошибки, если запрос не удался
          console.error("Ошибка при запросе данных с сервера");
        }
      }
      // this.weatherData = await fetch(
      //   "https://api-v2.shymbulak-dev.com/content-service/weather/meteoblue",
      // )
      //   .then((response) => response.json())
      //   .then((data) => data);
    },
  },
  computed: {
    formattedWeatherData() {
      if (this.weatherData === null) {
        return [];
      }

      let t = [];
      let data = this.weatherData.data_1h;
      let time = data.time;

      for (let i = 0; i < time.length; i++) {
        var n = {
          time: dayjs(data.time[i]),
          temperature: data.temperature[i],
          img:
            "pictocode/" +
            data.pictocode[i] +
            "_" +
            (data.isdaylight[i] ? "day" : "night") +
            ".svg",
          windspeed: data.windspeed[i],
          relativehumidity: data.relativehumidity[i],
          precipitation_probability: data.precipitation_probability[i],
        };
        t.push(n);
      }
      return t;
    },
    nowWeather() {
      if (this.formattedWeatherData.length === 0) {
        return null;
      }

      return this.formattedWeatherData.find((e) =>
        e.time.isSame(dayjs().startOf("hour")),
      );
    },
    forecast() {
      return this.limit
        ? this.formattedWeatherData
            .filter((e) => e.time.isAfter(dayjs()))
            .slice(0, this.limit)
        : this.formattedWeatherData;
    },
  },
  mounted() {
    this.getMeteoBlue();
  },
};
</script>
