---
category: Weather
---

# WeatherPlaceholder

Заглушка на время загрузки `WeatherWidget`: текст «Загрузка данных...» в блоке, который резервирует ровно ту высоту, что у виджета есть всегда (188px, от `sm` — 180px). Поэтому контент ниже не сдвигается. Используйте её как fallback `Suspense` вокруг лениво подключённого `WeatherWidget`. Пропсов не принимает.

```jsx
<Suspense fallback={<WeatherPlaceholder />}>
  <WeatherWidget />
</Suspense>
```
