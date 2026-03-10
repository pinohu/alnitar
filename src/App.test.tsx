import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it("renders home with main heading", async () => {
    render(<App />);
    const heading = await screen.findByRole("heading", { level: 1, timeout: 5000 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent?.toLowerCase()).toMatch(/sky|point|know|looking/);
  });

  it("has a link to /recognize", async () => {
    render(<App />);
    const links = await screen.findAllByRole("link", { name: /try it now|upload sky photo|cosmic camera|get started|try it free/i, timeout: 5000 });
    expect(links.length).toBeGreaterThanOrEqual(1);
    const recognizeLink = links.find((el) => el.getAttribute("href")?.endsWith("/recognize"));
    expect(recognizeLink).toBeDefined();
  });
});
