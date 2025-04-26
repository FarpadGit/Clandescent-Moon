import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, renderHook } from "@testing-library/react";
import AppContext, { type useAppContext as imported } from "./AppContext";
import { mockAppContext } from "@/../testing/setupMocks";

describe("AppContext", () => {
  let useAppContext: typeof imported;
  const contextWrapper = ({ children }: { children: React.ReactNode }) => (
    <AppContext>{children}</AppContext>
  );
  let result: { current: ReturnType<typeof imported> };

  beforeAll(async () => {
    vi.doUnmock("./AppContext");
    useAppContext = (await import("./AppContext")).useAppContext;
  });

  beforeEach(() => {
    ({ result } = renderHook(() => useAppContext(), {
      wrapper: contextWrapper,
    }));
  });

  it("should have an initial state of no errors, first tab selected, autosave on, autocorrect on, linear play mode and local file import/export", () => {
    expect(result.current.LSError).toBe(false);
    expect(result.current.selectedTabIndex).toBe(0);
    expect(result.current.isAutosaveOn).toBe(true);
    expect(result.current.isAutocorrectOn).toBe(true);
    expect(result.current.playMode).toBe("linear");
    expect(result.current.isFileUploadOn).toBe(false);
  });

  it("should set Error state", () => {
    act(() => {
      result.current.setError();
    });

    expect(result.current.LSError).toBe(true);
  });

  it("should clear Error state", () => {
    act(() => {
      result.current.clearError();
    });

    expect(result.current.LSError).toBe(false);
  });

  it("should change selected tabs", () => {
    act(() => {
      result.current.changeToTab(1);
    });

    expect(result.current.selectedTabIndex).toBe(1);
  });

  it("should toggle autosave", () => {
    expect(result.current.isAutosaveOn).toBe(true);

    act(() => {
      result.current.toggleAutosave();
    });

    expect(result.current.isAutosaveOn).toBe(false);
  });

  it("should toggle Youtube autocorrecting", () => {
    expect(result.current.isAutocorrectOn).toBe(true);

    act(() => {
      result.current.toggleAutocorrect();
    });

    expect(result.current.isAutocorrectOn).toBe(false);
  });

  it("should change play mode to 'Linear'", () => {
    act(() => {
      result.current.setPlayMode("linear");
    });

    expect(result.current.playMode).toBe("linear");
  });

  it("should change play mode to 'Shuffle'", () => {
    act(() => {
      result.current.setPlayMode("shuffle");
    });

    expect(result.current.playMode).toBe("shuffle");
  });

  it("should change play mode to 'Random'", () => {
    act(() => {
      result.current.setPlayMode("random");
    });

    expect(result.current.playMode).toBe("random");
  });

  it("should toggle local/external import and export", () => {
    expect(result.current.isFileUploadOn).toBe(false);

    act(() => {
      result.current.toggleFileUpload();
    });

    expect(result.current.isFileUploadOn).toBe(true);
  });

  afterAll(() => {
    mockAppContext();
  });
});
