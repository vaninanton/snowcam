/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Ключ Tomorrow.io. Публичный: попадает в клиентский бандл. */
  readonly VITE_TOMORROW_API_KEY: string;
  /** SHA сборки, подставляется в CI. Локально отсутствует. */
  readonly VITE_BUILD_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Пакеты без собственных типов
declare module "ios-pwa-splash/index" {
  /** Рисует splash-экраны для iOS и вставляет apple-touch-startup-image в head. */
  export default function iosPWASplash(icon: string, color?: string): void;
}

declare module "@owliehq/vue-addtohomescreen" {
  import type { Plugin } from "vue";

  export interface AddToHomescreenOptions {
    title?: string;
    content?: string;
    iconPath?: string;
    lang?: string;
  }

  const plugin: Plugin<[AddToHomescreenOptions?]>;
  export default plugin;
}
