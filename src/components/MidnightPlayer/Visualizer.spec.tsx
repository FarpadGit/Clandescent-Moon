import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, cleanup, render } from "@testing-library/react";

import Visualizer from "./Visualizer";
import "@/i18next/i18next.ts";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";
import { useActivePlaylistContext } from "@/contexts/ActivePlaylistContext";
import {
  mockActivePlaylistObject,
  mockVideoPlayerObject,
} from "@/../testing/mockContextReturnValues";
import { MidnightPlayerWrapper } from "@/../testing/wrappers";

describe("Visualizer", () => {
  let rootElement: HTMLElement;

  const componentToTest = <Visualizer />;

  const mockedUseVideoPlayer = vi.mocked(useVideoPlayerContext);
  const mockedUseActivePlaylist = vi.mocked(useActivePlaylistContext);

  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    cleanup();

    mockedUseVideoPlayer.mockReturnValue(mockVideoPlayerObject);
    mockedUseActivePlaylist.mockReturnValue(mockActivePlaylistObject);

    ({ container: rootElement } = render(componentToTest, {
      wrapper: MidnightPlayerWrapper,
    }));
  });

  function getBarHeightsBeforeAfter(timeDiff: number) {
    let bars = rootElement.querySelectorAll(".bar");
    const barHeightsStart = Array.from(bars).map(
      (bar) => (bar as HTMLElement).style.height
    );

    act(() => {
      vi.advanceTimersByTime(timeDiff);
    });

    bars = rootElement.querySelectorAll(".bar");
    const barHeightsEnd = Array.from(bars).map(
      (bar) => (bar as HTMLElement).style.height
    );

    return [barHeightsStart, barHeightsEnd];
  }

  it("should display an array of bars", () => {
    const bars = rootElement.querySelectorAll(".bar");

    expect(bars.length).toBeGreaterThan(0);
  });

  it("should display an array of bars with changing heights if video is playing", () => {
    const [barHeightsStart, barHeightsEnd] = getBarHeightsBeforeAfter(200);

    expect(barHeightsStart).not.toEqual(barHeightsEnd);
  });

  it("should display an array of bars with unchanging heights if video is paused", () => {
    mockedUseVideoPlayer.mockReturnValue({
      ...mockVideoPlayerObject,
      videoState: {
        ...mockVideoPlayerObject.videoState,
        playing: false,
      },
    });
    cleanup();
    render(componentToTest);

    const [barHeightsStart, barHeightsEnd] = getBarHeightsBeforeAfter(1000);

    expect(barHeightsStart).toEqual(barHeightsEnd);
  });

  it("should display an array of bars with uniform heights if video is muted", () => {
    mockedUseVideoPlayer.mockReturnValue({
      ...mockVideoPlayerObject,
      videoState: {
        ...mockVideoPlayerObject.videoState,
        muted: true,
      },
    });
    cleanup();
    render(componentToTest);

    const [barHeightsStart, barHeightsEnd] = getBarHeightsBeforeAfter(1000);

    expect(barHeightsStart.every((bar) => bar === barHeightsStart[0])).toBe(
      true
    );
    expect(barHeightsStart).toEqual(barHeightsEnd);
  });

  it("should display an array of bars with uniform heights if video is buffering", () => {
    mockedUseVideoPlayer.mockReturnValue({
      ...mockVideoPlayerObject,
      videoState: {
        ...mockVideoPlayerObject.videoState,
        buffer: true,
      },
    });
    cleanup();
    render(componentToTest);

    const [barHeightsStart, barHeightsEnd] = getBarHeightsBeforeAfter(1000);

    expect(barHeightsStart.every((bar) => bar === barHeightsStart[0])).toBe(
      true
    );
    expect(barHeightsStart).toEqual(barHeightsEnd);
  });

  afterAll(() => {
    vi.useRealTimers();
  });
});
