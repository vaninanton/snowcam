---
category: Weather
---

# WindCompass

Строчная стрелка «↑», повёрнутая на `windDirection` градусов (по часовой от севера — откуда дует ветер). В `title` — название ветра по-русски, например «Северо-западный». Размер и цвет наследует от текста, задавайте их текстовыми классами. В виджете стоит перед текстом про ветер: `className="text-sm align-middle mr-0.5 shrink-0"`.

```jsx
<span className="inline-flex items-center gap-1 text-xs text-slate-400">
  <WindCompass windDirection={315} className="text-sm" />
  Ветер 6 м/с (до 11)
</span>
```
