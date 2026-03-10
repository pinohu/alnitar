import { describe, it, expect } from "vitest";
import * as recognition from "@/lib/recognition";

describe("recognition", () => {
  it("exports recognizeImage and does not export getDemoResults", () => {
    expect(typeof recognition.recognizeImage).toBe("function");
    expect("getDemoResults" in recognition).toBe(false);
  });

  it("recognizeImage returns a Promise", () => {
    const file = new File([new Uint8Array(0)], "test.png", { type: "image/png" });
    const result = recognition.recognizeImage(file);
    expect(result).toBeInstanceOf(Promise);
  });
});
