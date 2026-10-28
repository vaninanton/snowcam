---
category: Weather
---

# WeatherIcon

Иллюстрация погоды (`@bybas/weather-icons`, заливной набор) по коду Tomorrow.io `weatherCode`. Ночной вариант выбирается сам, если `startTime` не раньше `values.sunsetTime` либо не позже `values.sunriseTime`. Для неизвестного кода ничего не рендерит. Размер задаётся через `className` (`w-8 h-8` в полосе, `w-14 h-14 sm:w-16 sm:h-16` в шапке).

Коды: 1000/1100 ясно, 1101 переменная облачность, 1102 облачно с прояснениями, 1001 пасмурно, 2000/2100 туман, 4000 морось, 4001/4200/4201 дождь, 5000/5001/5100/5101 снег, 6000–6201 ледяной дождь, 7000–7102 ледяная крупа, 8000 гроза.

```jsx
<WeatherIcon
  className="w-14 h-14"
  timeline={{
    startTime: new Date().toISOString(),
    values: { weatherCode: 5100 },
  }}
/>
```
