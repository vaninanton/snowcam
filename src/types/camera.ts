export interface Camera {
  /** Локация. По уникальным значениям строятся вкладки на главной. */
  place: string;
  title: string;
  description: string;
  /** Высота над уровнем моря, м. */
  elevation: number;
  /** URL HLS-манифеста. */
  src: string;
  /** Путь к превью в public/previews. Должно быть 16:9, см. HlsVideo. */
  poster: string;
}
