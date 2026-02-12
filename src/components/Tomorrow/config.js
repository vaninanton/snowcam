import queryString from "query-string";
import moment from "moment/min/moment-with-locales";

moment.locale("ru");

export const TOMORROW_TIMELINE_URL = "https://api.tomorrow.io/v4/timelines";
export const TOMORROW_LOCATION = [43.120649, 77.096193];
export const TOMORROW_TIMEZONE = "Asia/Almaty";

const FIELDS_LIST = {
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
  rainIntensity:
    "Instantaneous rate of liquid precipitation (rain) at ground level",
  freezingRainIntensity:
    "Instantaneous rate of freezing rain (rain that freezes on contact with surfaces)",
  snowIntensity: "Instantaneous rate of snowfall at ground level",
  sleetIntensity:
    "Instantaneous rate of sleet or ice pellets (frozen raindrops) at ground level",
  precipitationProbability:
    "Probability of precipitation occurring within the time period, percentage 0–100",
  precipitationType:
    "Type of precipitation: none, rain, snow, ice pellets, freezing rain, or mixed",
  rainAccumulation:
    "Accumulated liquid precipitation (rain) over the time period",
  snowAccumulation:
    "Accumulated snowfall (snow depth equivalent) over the time period",
  snowAccumulationLwe:
    "Snow accumulation expressed as liquid water equivalent (LWE) over the time period",
  snowDepth: "Depth of existing snow on the ground from previous accumulation",
  sleetAccumulation: "Accumulated sleet or ice pellets over the time period",
  sleetAccumulationLwe:
    "Sleet accumulation expressed as liquid water equivalent over the time period",
  iceAccumulation:
    "Accumulated ice (e.g. from freezing rain) over the time period",
  iceAccumulationLwe:
    "Ice accumulation expressed as liquid water equivalent over the time period",
  sunriseTime: "ISO 8601 time of sunrise for the location",
  sunsetTime: "ISO 8601 time of sunset for the location",
  visibility:
    "Horizontal distance at which objects can be clearly identified (reduced by fog, precipitation)",
  cloudCover: "Fraction of sky covered by clouds (0–1)",
  cloudBase: "Height of the lowest cloud base above ground level",
  cloudCeiling:
    "Height of the lowest cloud layer reported as broken or overcast",
  moonPhase:
    "Phase of the moon: new, waxing_crescent, first_quarter, waxing_gibbous, full, waning_gibbous, last_quarter, waning_crescent",
  uvIndex:
    "UV index (0–11+), measure of intensity of UV radiation at the surface",
  uvHealthConcern:
    "Health risk level from UV exposure: low, moderate, high, very high, extreme",
  evapotranspiration:
    "Rate of water loss from soil and plant surfaces to the atmosphere",
  weatherCodeFullDay:
    "Numeric weather condition code for the full day (sunrise to sunrise); supports mixed conditions",
  weatherCodeDay:
    "Numeric weather condition code for daytime (sunrise to sunset); supports mixed conditions",
  weatherCodeNight:
    "Numeric weather condition code for nighttime (sunset to sunrise); supports mixed conditions",
  weatherCode:
    "Numeric weather condition code (basic conditions only, e.g. clear, cloudy, rain); see Tomorrow.io weather codes",
};

export function buildTimelineQueryString() {
  const now = moment.utc();
  return queryString.stringify(
    {
      apikey: import.meta.env.VITE_TOMORROW_API_KEY,
      location: TOMORROW_LOCATION,
      fields: Object.keys(FIELDS_LIST),
      units: "metric",
      timesteps: ["current", "1h", "1d"],
      startTime: moment.utc(now).add(0, "minutes").toISOString(),
      endTime: moment.utc(now).add(1, "days").toISOString(),
      timezone: TOMORROW_TIMEZONE,
    },
    { arrayFormat: "comma" },
  );
}
