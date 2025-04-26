import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import AsyncButton from "./AsyncButton";
import "@/i18next/i18next.ts";

describe("AsyncButton", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  describe("Uncontrolled", () => {
    let rerender: (ui: React.ReactNode) => void;
    const onSuccessClick = () =>
      new Promise((res) => setTimeout(() => res("clicked"), 2000));
    const onErrorClick = () => {
      throw new Error();
    };

    const componentToTest = (
      <AsyncButton onClick={onSuccessClick}>
        Uncontrolled Mock Button
      </AsyncButton>
    );

    beforeEach(() => {
      cleanup();
      ({ rerender } = render(componentToTest));
    });

    it("should render component children on idle", () => {
      expect(screen.getByText("Uncontrolled Mock Button")).toBeTruthy();
    });

    it("should render loading text if clicked", async () => {
      fireEvent.click(screen.getByRole("button"));
      await vi.advanceTimersByTimeAsync(1000);

      expect(screen.queryByText("Uncontrolled Mock Button")).toBeFalsy();
      expect(screen.getByTestId("loading")).toBeTruthy();
    });

    it("should render 'done' text if loading finished", async () => {
      fireEvent.click(screen.getByRole("button"));
      await vi.advanceTimersByTimeAsync(2000);

      expect(screen.queryByText("Uncontrolled Mock Button")).toBeFalsy();
      expect(screen.queryByTestId("loading")).toBeFalsy();
      expect(screen.getByTestId("done")).toBeTruthy();
    });

    it("should render error text if loading failed", () => {
      rerender(
        <AsyncButton onClick={onErrorClick}>
          Uncontrolled Mock Button
        </AsyncButton>
      );

      fireEvent.click(screen.getByRole("button"));

      expect(screen.queryByText("Uncontrolled Mock Button")).toBeFalsy();
      expect(screen.getByTestId("error")).toBeTruthy();
    });

    it("should render component children again 1.5 seconds after loading was done (success)", async () => {
      fireEvent.click(screen.getByRole("button"));
      await vi.advanceTimersByTimeAsync(2000 + 1500);

      expect(screen.getByText("Uncontrolled Mock Button")).toBeTruthy();
      expect(screen.queryByTestId("loading")).toBeFalsy();
    });

    it("should render component children again 1.5 seconds after loading was done (error)", async () => {
      rerender(
        <AsyncButton onClick={onErrorClick}>
          Uncontrolled Mock Button
        </AsyncButton>
      );

      fireEvent.click(screen.getByRole("button"));
      await vi.advanceTimersByTimeAsync(2000 + 1500);

      expect(screen.getByText("Uncontrolled Mock Button")).toBeTruthy();
      expect(screen.queryByTestId("loading")).toBeFalsy();
    });
  });

  describe("Controlled", () => {
    let rerender: (ui: React.ReactNode) => void;
    const onClickSpy = vi.fn();

    const componentToTest = (
      <AsyncButton controlled loading={false} onClick={onClickSpy}>
        Controlled Mock Button
      </AsyncButton>
    );

    beforeEach(() => {
      cleanup();
      ({ rerender } = render(componentToTest));
    });

    it("should render component children on idle", () => {
      expect(screen.getByText("Controlled Mock Button")).toBeTruthy();
    });

    it("should call onClick handler without state change when clicked", () => {
      fireEvent.click(screen.getByRole("button"));

      expect(onClickSpy).toHaveBeenCalled();
      expect(screen.getByText("Controlled Mock Button")).toBeTruthy();
      expect(screen.queryByTestId("loading")).toBeFalsy();
      expect(screen.queryByTestId("done")).toBeFalsy();
      expect(screen.queryByTestId("error")).toBeFalsy();
    });

    it("should render loading text if 'loading' prop is true", () => {
      rerender(
        <AsyncButton controlled loading={true}>
          Controlled Mock Button
        </AsyncButton>
      );

      expect(screen.queryByText("Controlled Mock Button")).toBeFalsy();
      expect(screen.getByTestId("loading")).toBeTruthy();
    });

    it("should render 'done' text if 'loading' prop is changed from true to false", () => {
      rerender(
        <AsyncButton controlled loading={true}>
          Controlled Mock Button
        </AsyncButton>
      );
      rerender(
        <AsyncButton controlled loading={false}>
          Controlled Mock Button
        </AsyncButton>
      );

      expect(screen.queryByText("Controlled Mock Button")).toBeFalsy();
      expect(screen.queryByTestId("loading")).toBeFalsy();
      expect(screen.getByTestId("done")).toBeTruthy();
    });

    it("should render error text if 'loading' prop is null", () => {
      rerender(
        <AsyncButton controlled loading={null}>
          Controlled Mock Button
        </AsyncButton>
      );

      expect(screen.queryByText("Controlled Mock Button")).toBeFalsy();
      expect(screen.getByTestId("error")).toBeTruthy();
    });

    it("should render component children again 1.5 seconds after loading was done (success)", async () => {
      rerender(
        <AsyncButton controlled loading={true}>
          Controlled Mock Button
        </AsyncButton>
      );
      rerender(
        <AsyncButton controlled loading={false}>
          Controlled Mock Button
        </AsyncButton>
      );

      await vi.advanceTimersByTimeAsync(1500);

      expect(screen.getByText("Controlled Mock Button")).toBeTruthy();
      expect(screen.queryByTestId("loading")).toBeFalsy();
    });

    it("should render component children again 1.5 seconds after loading was done (error)", async () => {
      rerender(
        <AsyncButton controlled loading={null}>
          Controlled Mock Button
        </AsyncButton>
      );

      await vi.advanceTimersByTimeAsync(1500);

      expect(screen.getByText("Controlled Mock Button")).toBeTruthy();
      expect(screen.queryByTestId("loading")).toBeFalsy();
    });
  });

  afterAll(() => {
    vi.useRealTimers();
  });
});
