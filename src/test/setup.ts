import { Storage } from "happy-dom";

// Node 26 объявляет собственный экспериментальный глобальный localStorage,
// который без флага --localstorage-file всегда undefined. Ключ на globalThis
// при этом существует, поэтому окружение happy-dom его не перекрывает и
// localStorage в тестах оказывается недоступен. Ставим реализацию явно.
for (const name of ["localStorage", "sessionStorage"] as const) {
  Object.defineProperty(globalThis, name, {
    value: new Storage(),
    configurable: true,
    writable: true,
  });
}
