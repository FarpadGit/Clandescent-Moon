import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import { Option } from "./Option";
import "@/i18next/i18next.ts";

describe("Option", () => {
  const component1ToTest = (
    <Option>
      <Option.Lead>
        <b>mockOption 1:</b>
      </Option.Lead>
      <Option.Description>Mock Description</Option.Description>
    </Option>
  );

  const component2ToTest = (
    <Option>
      <Option.Lead>
        <Option.LeadGroup>
          <div>Mock Lead 1</div>
        </Option.LeadGroup>
        <Option.LeadGroup>
          <div>Mock Lead 2</div>
        </Option.LeadGroup>
      </Option.Lead>
      <Option.Description>Mock Description</Option.Description>
    </Option>
  );

  const component3ToTest = (
    <Option>
      <div>mockOption 1:</div>
      Mock Description
    </Option>
  );

  beforeEach(() => {
    cleanup();
  });

  it("should render the Lead and Description elements", () => {
    render(component1ToTest);

    expect(screen.getByText(/mockOption 1/)).toBeTruthy();
    expect(
      within(screen.getByRole("paragraph")).getByText("Mock Description")
    ).toBeTruthy();
  });

  it("should render the LeadGroup and Description elements", () => {
    render(component2ToTest);

    expect(screen.getByText("Mock Lead 1")).toBeTruthy();
    expect(screen.getByText("Mock Lead 2")).toBeTruthy();
    expect(
      within(screen.getByRole("paragraph")).getByText("Mock Description")
    ).toBeTruthy();
  });

  it("should not render elements not wrapped in Lead, LeadGroup or Description", () => {
    render(component3ToTest);

    expect(screen.queryByText(/mockOption 1/)).toBeFalsy();
    expect(screen.queryByText("Mock Description")).toBeFalsy();
  });
});
