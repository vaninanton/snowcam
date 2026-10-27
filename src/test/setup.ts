import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
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

// Testing Library размонтирует компоненты сама только при globals: true,
// без них отрендеренное между тестами копится в document.body
afterEach(cleanup);
