import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, within } from "@testing-library/react";

import ListToolbar from "./ListToolbar";
import "@/i18next/i18next.ts";

describe("ListToolbar", () => {
  let rootElement: HTMLElement;
  let toolbarElement: HTMLElement;
  let itemAddedSpy = vi.fn();
  let userActionSpy = vi.fn();
  let loadingSpy = vi.fn();

  const componentToTest = (
    <ListToolbar
      onItemAdded={itemAddedSpy}
      onUserAction={userActionSpy}
      isLoading={false}
      onLoading={loadingSpy}
    />
  );

  beforeEach(() => {
    cleanup();
    itemAddedSpy.mockClear();
    userActionSpy.mockClear();
    loadingSpy.mockClear();

    ({ container: rootElement } = render(componentToTest));

    toolbarElement =
      rootElement.querySelector<HTMLElement>(".toolbar-tab") ?? rootElement;
  });

  it("should render the default input element for adding list items and 2 buttons", () => {
    expect(within(toolbarElement).getByRole("textbox")).toBeTruthy();
    expect(within(toolbarElement).getAllByRole("button").length).toBe(2);
  });

  it("should add new item to list if input is filled out and add button is clicked", () => {
    const input = within(toolbarElement).getByRole("textbox");
    const addButton = within(toolbarElement).getAllByRole("button")[0];

    fireEvent.input(input, { target: { value: "New Fake Item" } });
    fireEvent.click(addButton);

    expect(userActionSpy).toHaveBeenCalledWith("", "add", "New Fake Item");
  });

  it("should clear input field after new item has been added", () => {
    const input = within(toolbarElement).getByRole<HTMLInputElement>("textbox");
    const addButton = within(toolbarElement).getAllByRole("button")[0];

    fireEvent.input(input, { target: { value: "New Fake Item" } });
    fireEvent.click(addButton);

    expect(input.value).toBe("");
  });

  describe("second page", () => {
    beforeEach(async () => {
      const nextButton = within(toolbarElement).getAllByRole("button")[1];
      fireEvent.click(nextButton);

      await vi.waitUntil(() =>
        rootElement.querySelector('.active[data-testid="sort"]'),
      );
      toolbarElement =
        within(rootElement).getByTestId("sort").querySelector(".toolbar-tab") ??
        toolbarElement;
    });

    it("should render a dropdown box with sorting options and 2 buttons", () => {
      const dropdown = toolbarElement.querySelector(".dropdown");
      const buttons = within(toolbarElement).getAllByRole("button");

      expect(dropdown).toBeTruthy();
      expect(buttons.length).toBe(1 + 2);
    });

    it("dropdown box should have 2 selectable options", () => {
      const dropdown =
        toolbarElement.querySelector<HTMLButtonElement>(".dropdown")!;

      fireEvent.click(within(dropdown).getByRole("button"));
      const dropdownMenu =
        dropdown.querySelector<HTMLElement>(".dropdown-menu");

      expect(dropdownMenu).toBeTruthy();
      expect(within(dropdownMenu!).getAllByRole("button").length).toBe(2);
    });

    it("should navigate back to the first page", async () => {
      const nextButton = within(toolbarElement).getAllByRole("button")[2];

      fireEvent.click(nextButton);
      await vi.waitUntil(() =>
        rootElement.querySelector('.active[data-testid="add-item"]'),
      );
      const activeElement = rootElement.querySelector<HTMLElement>(".active");

      expect(activeElement?.getAttribute("data-testid")).toBe("add-item");
    });
  });
});
