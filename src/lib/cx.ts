/** Склеивает классы, пропуская пустые и выключенные условием. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
