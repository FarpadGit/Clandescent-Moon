import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import LanguageSelector from "./LanguageSelector";
import "@/i18next/i18next.ts";

describe("LanguageSelector", () => {
  const componentToTest = <LanguageSelector />;

  beforeEach(() => {
    cleanup();
    render(componentToTest);
  });

  it("should render a dropdown with 'english' and 'magyar' options", () => {
    expect(screen.getByRole("button")).toBeTruthy();
    expect(screen.getByRole("button").textContent).toMatch(/english/i);

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getAllByRole("button").length).toBe(1 + 2);
    expect(screen.getAllByRole("button")[1].textContent).toMatch(/english/i);
    expect(screen.getAllByRole("button")[2].textContent).toMatch(/magyar/i);
  });

  it("should change dropdown value if a different option is selected", () => {
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getAllByRole("button")[2]);

    expect(screen.getAllByRole("button")[0].textContent).toMatch(/magyar/i);
  });

  // These tests will actually set the i18next hooks permamently, so we need to set it back to 'english'
  afterEach(() => {
    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getAllByRole("button")[1]);
  });
});
