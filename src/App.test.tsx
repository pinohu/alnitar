import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it("renders home and has main heading and link to recognize", async () => {
    render(<App />);
    const links = await screen.findAllByRole("link", { name: /identify|cosmic camera|open cosmic/i }, { timeout: 10000 });
    expect(links.length).toBeGreaterThanOrEqual(1);
    const recognizeLink = links.find((el) => el.getAttribute("href")?.endsWith("/recognize"));
    expect(recognizeLink).toBeDefined();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent?.toLowerCase()).toMatch(/clear night|planned|sky|point|know|looking/);
  });
});
