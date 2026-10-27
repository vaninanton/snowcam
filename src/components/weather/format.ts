// API отдаёт не только undefined, но и явный null (например, visibility или
// суточные агрегаты), а Math.round(null) === 0 — без проверки на == null
// в виджете появляются выдуманные нули вроде «Снег 0 см» или «0°»

export function floorOrNull(value: number | null | undefined): number | null {
  return value == null ? null : Math.floor(value);
}

export function roundOrNull(value: number | null | undefined): number | null {
  return value == null ? null : Math.round(value);
}
