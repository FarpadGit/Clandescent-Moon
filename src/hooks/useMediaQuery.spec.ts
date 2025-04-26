import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { renderHook } from "@testing-library/react";

import { mockuseMediaQueryHook } from "@/../testing/setupMocks";

describe("useMediaQuery", () => {
  let useMediaQuery: () => {
    "2XL": boolean;
    XL: boolean;
    LG: boolean;
    MD: boolean;
    SM: boolean;
    XS: boolean;
  };

  beforeAll(async () => {
    vi.doUnmock("./useMediaQuery");
    useMediaQuery = (await import("./useMediaQuery")).default;
  });

  beforeEach(() => {
    global.ResizeObserver = vi.fn().mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
  });

  function matchMediaWith(sizes: string[]) {
    vi.stubGlobal("matchMedia", (e: string) => {
      if (sizes.some((size) => e.includes(size))) return { matches: true };
      return { matches: false };
    });
  }

  it("should return false for all screen sizes except XS", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.XS).toBe(true);
    expect(result.current.SM).toBe(false);
    expect(result.current.MD).toBe(false);
    expect(result.current.LG).toBe(false);
    expect(result.current.XL).toBe(false);
    expect(result.current["2XL"]).toBe(false);
  });

  it("should return true for sizes SM and smaller", () => {
    matchMediaWith(["576"]);
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.XS).toBe(true);
    expect(result.current.SM).toBe(true);
    expect(result.current.MD).toBe(false);
    expect(result.current.LG).toBe(false);
    expect(result.current.XL).toBe(false);
    expect(result.current["2XL"]).toBe(false);
  });

  it("should return true for sizes MD and smaller", () => {
    matchMediaWith(["576", "768"]);
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.XS).toBe(true);
    expect(result.current.SM).toBe(true);
    expect(result.current.MD).toBe(true);
    expect(result.current.LG).toBe(false);
    expect(result.current.XL).toBe(false);
    expect(result.current["2XL"]).toBe(false);
  });

  it("should return true for sizes LG and smaller", () => {
    matchMediaWith(["576", "768", "992"]);
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.XS).toBe(true);
    expect(result.current.SM).toBe(true);
    expect(result.current.MD).toBe(true);
    expect(result.current.LG).toBe(true);
    expect(result.current.XL).toBe(false);
    expect(result.current["2XL"]).toBe(false);
  });

  it("should return true for sizes XL and smaller", () => {
    matchMediaWith(["576", "768", "992", "1200"]);
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.XS).toBe(true);
    expect(result.current.SM).toBe(true);
    expect(result.current.MD).toBe(true);
    expect(result.current.LG).toBe(true);
    expect(result.current.XL).toBe(true);
    expect(result.current["2XL"]).toBe(false);
  });

  it("should return true for all sizes", () => {
    matchMediaWith(["576", "768", "992", "1200", "1400"]);
    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.XS).toBe(true);
    expect(result.current.SM).toBe(true);
    expect(result.current.MD).toBe(true);
    expect(result.current.LG).toBe(true);
    expect(result.current.XL).toBe(true);
    expect(result.current["2XL"]).toBe(true);
  });

  afterAll(() => {
    mockuseMediaQueryHook();
  });
});
