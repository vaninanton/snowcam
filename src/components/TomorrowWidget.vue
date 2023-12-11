<script setup></script>
<template>
  <div>
    <h1 class="text-4xl font-semibold hidden sm:block">Погода</h1>
    <div v-if="$isLoading">Загрузка данных...</div>
    <div v-else>
      <div class="text-center mb-5">
        <div class="text-8xl font-extralight">
          {{ currentTemp }}<sup>°</sup>
        </div>
        <div class="font-medium cursor-pointer" @click="reload">
          Перезагрузить
        </div>
      </div>

      <div
        class="flex snap-x snap-mandatory overflow-x-scroll max-w-full divide-x divide-gray-800 bg-white/5"
      >
        <div
          class="flex-1 transition-colors"
          v-for="item in weatherData.hourly"
          v-bind:key="item.startTime"
        >
          <TimelineItem :timeline="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import queryString from "query-string";
import moment from "moment/min/moment-with-locales";
import TimelineItem from "./Tomorrow/TimelineItem.vue";

moment.locale("ru");

const getTimelineURL = "https://api.tomorrow.io/v4/timelines";
const apikey = "doNdD2yT8uRWMF8Mkf5JJFNuasSurjfN";
const location = [43.120649, 77.096193];
const fieldsList = {
  temperature: 'The "real" temperature measurement (at 2m)',
  temperatureApparent:
    "The temperature equivalent perceived by humans, caused by the combined effects of air temperature, relative humidity, and wind speed (at 2m)",
  dewPoint:
    "The temperature to which air must be cooled to become saturated with water vapor (at 2m)",
  humidity: "The concentration of water vapor present in the air",
  windSpeed:
    "The fundamental atmospheric quantity caused by air moving from high to low pressure, usually due to changes in temperature (at 10m)",
  windDirection:
    "The direction from which it originates, measured in degrees clockwise from due north (at 10m)",
  windGust:
    "The maximum brief increase in the speed of the wind, usually less than 20 seconds (at 10m)",
  pressureSurfaceLevel:
    "The force exerted against a surface by the weight of the air above the surface (at the surface level)",
  pressureSeaLevel:
    "The force exerted against a surface by the weight of the air above the surface (at the mean sea level)",
  precipitationIntensity:
    "The instantaneous precipitation rate at ground level",
  rainIntensity: "",
  freezingRainIntensity: "",
  snowIntensity: "",
  sleetIntensity: "",
  precipitationProbability: "",
  precipitationType: "",
  rainAccumulation: "",
  snowAccumulation: "",
  snowAccumulationLwe: "",
  snowDepth: "",
  sleetAccumulation: "",
  sleetAccumulationLwe: "",
  iceAccumulation: "",
  iceAccumulationLwe: "",
  sunriseTime: "",
  sunsetTime: "",
  visibility: "",
  cloudCover: "",
  cloudBase: "",
  cloudCeiling: "",
  moonPhase: "",
  uvIndex: "",
  uvHealthConcern: "",
  evapotranspiration: "",
  weatherCodeFullDay: "",
  weatherCodeDay: "",
  weatherCodeNight: "",
  weatherCode: "",
};
const fields = Object.keys(fieldsList);
const units = "metric";
const timesteps = ["current", "1h", "1d"];
const now = moment.utc();
const startTime = moment.utc(now).add(0, "minutes").toISOString();
const endTime = moment.utc(now).add(1, "days").toISOString();
const timezone = "Asia/Almaty";
const getTimelineParameters = queryString.stringify(
  {
    apikey,
    location,
    fields,
    units,
    timesteps,
    startTime,
    endTime,
    timezone,
  },
  { arrayFormat: "comma" },
);

export default {
  data() {
    return {
      apiData: {},
      moment,
      weatherData: {
        current: null,
        daily: null,
        hourly: null,
      },
    };
  },
  created() {
    this.fetchWeatherData();
  },
  methods: {
    reload() {
      localStorage.removeItem("tomorrowioData");
      window.location.reload();
    },
    async fetchWeatherData() {
      // Проверяем, есть ли данные в локальном хранилище
      const cachedData = localStorage.getItem("tomorrowioData");

      let weatherData = null;
      if (cachedData) {
        // Если данные есть в кеше, возвращаем их
        weatherData = JSON.parse(cachedData);
      } else {
        weatherData = await this.$http.get(
          `${getTimelineURL}?${getTimelineParameters}`,
        );
        localStorage.setItem("tomorrowioData", JSON.stringify(weatherData));
      }

      weatherData.data.timelines.forEach((element) => {
        if (element.timestep === "current") {
          const [firstInterval] = element.intervals;
          this.weatherData.current = firstInterval;
        } else if (element.timestep === "1d") {
          this.weatherData.daily = element.intervals;
        } else if (element.timestep === "1h") {
          this.weatherData.hourly = element.intervals;
        }
      });
    },
  },
  computed: {
    currentTemp() {
      if (!this.weatherData.current) {
        return "-";
      }
      return Math.floor(this.weatherData.current?.values.temperature);
    },
  },
  components: {
    TimelineItem,
  },
};
</script>
