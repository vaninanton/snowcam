import { describe, expect, it } from "vitest";
import { cameraGridCols } from "./cameraGrid";

describe("cameraGridCols", () => {
  it.each([
    [1, "grid-cols-1"],
    [2, "grid-cols-1 sm:grid-cols-2"],
    // Три камеры на компьютере — в один ряд
    [3, "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"],
    // Четыре — квадратом, а не 3 + 1
    [4, "grid-cols-1 sm:grid-cols-2"],
    [6, "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"],
  ])("для %i камер — «%s»", (count, expected) => {
    expect(cameraGridCols(count)).toBe(expected);
  });
});
