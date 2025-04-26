import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

import { SeekBar } from "./SeekBar";
import "@/i18next/i18next.ts";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";
import { useActivePlaylistContext } from "@/contexts/ActivePlaylistContext";
import {
  mockActivePlaylistObject,
  mockVideoPlayerObject,
} from "@/../testing/mockContextReturnValues";
import { MidnightPlayerWrapper } from "@/../testing/wrappers";

describe("SeekBar", () => {
  let rootElement: HTMLElement;

  const componentToTest = <SeekBar duration={10 * 60} />;

  const mockedUseVideoPlayer = vi.mocked(useVideoPlayerContext);
  const mockedUseActivePlaylist = vi.mocked(useActivePlaylistContext);

  beforeEach(() => {
    cleanup();

    // ReactSlider needs ResizeObserver
    global.ResizeObserver = vi.fn().mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });

    mockedUseVideoPlayer.mockReturnValue(mockVideoPlayerObject);
    mockedUseActivePlaylist.mockReturnValue(mockActivePlaylistObject);

    ({ container: rootElement } = render(componentToTest, {
      wrapper: MidnightPlayerWrapper,
    }));
  });

  it("should display a seekbar with no tooltip", () => {
    const container = rootElement.querySelector(
      ".seeker-container"
    ) as HTMLElement;
    const seeker = container.querySelector(".seeker") as HTMLElement;
    const tooltip = container.querySelector(".seeker-tooltip") as HTMLElement;

    expect(container).toBeTruthy();
    expect(seeker).toBeTruthy();
    expect(tooltip).toBeFalsy();
  });

  it("should display tooltip on mouse over and remove it on mouse leave", () => {
    const container = rootElement.querySelector(
      ".seeker-container"
    ) as HTMLElement;
    let tooltip = rootElement.querySelector(".seeker-tooltip") as HTMLElement;
    expect(tooltip).toBeFalsy();

    fireEvent.mouseMove(container);
    tooltip = rootElement.querySelector(".seeker-tooltip") as HTMLElement;

    expect(tooltip).toBeTruthy();

    fireEvent.mouseLeave(container);
    tooltip = rootElement.querySelector(".seeker-tooltip") as HTMLElement;

    expect(tooltip).toBeFalsy();
  });
});
