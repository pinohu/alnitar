import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it("renders home with main heading", () => {
    render(<App />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent?.toLowerCase()).toMatch(/sky|point|know|looking/);
  });

  it("has a link to /recognize", () => {
    render(<App />);
    const links = screen.getAllByRole("link", { name: /try it now|upload sky photo|cosmic camera|get started|try it free/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    const recognizeLink = links.find((el) => el.getAttribute("href") === "/recognize");
    expect(recognizeLink).toBeDefined();
  });
});
