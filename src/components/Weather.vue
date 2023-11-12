<script setup>
import { defineAsyncComponent } from "vue";
const WindCompass = defineAsyncComponent(() => import("./WindCompass.vue"));
</script>
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
            <span>{{ Math.floor(nowWeather?.temperature) }}°C</span>
          </span>
          <div>
            По ощущениям: {{ Math.floor(nowWeather?.felttemperature) }}°C
          </div>
          <div class="grid grid-cols-2">
            <!-- <div>
                rainspot:
                <div class="grid grid-cols-7 text-center aspect-square w-20">
                  <div
                    class="h-full bg-blue-600"
                    :class="{
                      'opacity-10': rs == 0,
                      'opacity-20': rs == 1,
                      'opacity-30': rs == 2,
                      'opacity-40': rs == 3,
                      'opacity-50': rs == 4,
                      'opacity-60': rs == 5,
                      'opacity-70': rs == 6,
                      'opacity-80': rs == 7,
                      'opacity-90': rs == 8,
                      'opacity-100': rs == 9,
                    }"
                    v-for="rs in nowWeather?.rainspot"
                  ></div>
                </div>
              </div> -->
            <div class="text-xs font-light text-gray-400">
              Ветер:
              <WindCompass :windDirection="nowWeather?.winddirection" />
              {{ nowWeather?.windspeed }} m/s
            </div>
            <div class="text-xs font-light text-gray-400">
              Осадки:
              <span>{{ nowWeather?.precipitation_probability }} %</span>
            </div>
            <div class="text-xs font-light text-gray-400">
              Влажность: {{ nowWeather?.relativehumidity }}%
            </div>
            <div class="text-xs font-light text-gray-400">
              Давление: {{ nowWeather?.sealevelpressure }} мм.рт.ст.
            </div>
            <div class="text-xs font-light text-gray-400">
              UV индекс: {{ nowWeather?.uvindex }}
            </div>
            <div class="text-xs font-light text-gray-400">
              Осадки: {{ nowWeather?.precipitation }}
            </div>
            <div class="text-xs font-light text-gray-400">
              Конвективные: {{ nowWeather?.convective_precipitation }}
            </div>
            <div class="text-xs font-light text-gray-400">
              Вероятность: {{ nowWeather?.precipitation_probability }}
            </div>
            <div class="text-xs font-light text-gray-400">
              Доля снега: {{ nowWeather?.snowfraction }}
            </div>
          </div>
        </div>
        <div>
          <img :src="nowWeather?.img" alt="" class="h-20" @click="reload" />
          <span v-if="weatherData" class="text-xs"
            >UPD: {{ weatherData.loadedAt.format("DD.MM HH:mm") }}</span
          >
        </div>
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
              class="h-10 fill-current text-gray-400 mt-3"
            />
            <div class="font-semibold mt-1 text-sm">
              {{ Math.floor(hour.temperature) }}°C
            </div>
            <div class="text-xs font-light text-gray-400">
              <WindCompass :windDirection="hour.winddirection" />
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
        this.weatherData.loadedAt = dayjs(this.weatherData.loadedAt);
      } else {
        // Если данных нет в кеше, делаем запрос к API
        const response = await fetch(
          "https://api-v2.shymbulak-dev.com/content-service/weather/meteoblue",
        );

        if (response.ok) {
          // Если запрос успешный, сохраняем данные в кеше и возвращаем их
          const data = await response.json();
          data.loadedAt = dayjs();

          this.weatherData = data;
          localStorage.setItem("meteoBlueData", JSON.stringify(data));
        } else {
          // Обработка ошибки, если запрос не удался
          console.error("Ошибка при запросе данных с сервера");
        }
      }
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
          convective_precipitation: data.convective_precipitation[i],
          felttemperature: data.felttemperature[i],
          isdaylight: data.isdaylight[i],
          img:
            "pictocode/" +
            data.pictocode[i] +
            (data.isdaylight[i] ? "_day" : "_night") +
            ".webp",
          precipitation: data.precipitation[i],
          precipitation_probability: data.precipitation_probability[i],
          rainspot: data.rainspot[i],
          relativehumidity: data.relativehumidity[i],
          sealevelpressure: data.sealevelpressure[i],
          snowfraction: data.snowfraction[i],
          temperature: data.temperature[i],
          uvindex: data.uvindex[i],
          winddirection: data.winddirection[i],
          windspeed: data.windspeed[i],
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
        : this.formattedWeatherData.filter((e) => e.time.isAfter(dayjs()));
    },
  },
  mounted() {
    this.getMeteoBlue();
  },
};
</script>
