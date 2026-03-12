// src/lib/tierMessaging.test.ts — Product rule: free tier must not promise "cloud journal" (Pro only per hasProCloudBackup)
import { describe, it, expect } from "vitest";
import { FREE_ACCOUNT, HERO_FREE_LINE } from "@/lib/tierMessaging";

describe("tierMessaging", () => {
  it("free account intro must not promise cloud journal (reserved for Pro per hasProCloudBackup)", () => {
    expect(FREE_ACCOUNT.intro).not.toMatch(/cloud journal/i);
  });

  it("hero free line must not promise cloud journal for free tier", () => {
    expect(HERO_FREE_LINE).not.toMatch(/cloud journal/i);
  });
});
