---
category: Weather
---

# TimelineItem

Колонка одного часа в полосе прогноза, шириной 64px (`w-16`): подпись часа («Сейчас» для текущего, иначе «HH:00»), иконка погоды 32px, жирная температура и, если отличается, ощущаемая в скобках. Текущий час подсвечен `bg-white/10`.

`timeline` — один интервал Tomorrow.io: `{ startTime: строка ISO, values: { temperature, temperatureApparent, weatherCode, sunriseTime?, sunsetTime? } }`. Без температуры выводится «-».

Полоса, как в виджете:

```jsx
<div className="flex snap-x snap-mandatory overflow-x-scroll w-full divide-x divide-gray-800 bg-white/5 py-1">
  {hourly.map((item) => (
    <div className="flex-1" key={item.startTime}>
      <TimelineItem timeline={item} />
    </div>
  ))}
</div>
```
