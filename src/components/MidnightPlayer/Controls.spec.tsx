import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import Controls from "./Controls";
import "@/i18next/i18next.ts";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";
import { useActivePlaylistContext } from "@/contexts/ActivePlaylistContext";
import {
  mockActivePlaylistObject,
  mockVideoPlayerObject,
} from "@/../testing/mockContextReturnValues";
import { MidnightPlayerWrapper } from "@/../testing/wrappers";

describe("Controls", () => {
  let rootElement: HTMLElement;

  const componentToTest = <Controls />;

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

  it("should render top, middle and bottom containers, a time display and control elements", async () => {
    const topContainer = rootElement.querySelector(".top-container");
    const midContainer = screen.getByTestId("mid-container");
    const bottomContainer = rootElement.querySelector(".bottom-container");
    const timeDisplay = rootElement.querySelector(
      ".time-display"
    ) as HTMLElement;
    const controlBox = rootElement.querySelector(".control-box") as HTMLElement;

    expect(topContainer).toBeTruthy();
    expect(midContainer).toBeTruthy();
    expect(bottomContainer).toBeTruthy();
    expect(timeDisplay).toBeTruthy();
    expect(within(timeDisplay).findByText("00:00")).toBeTruthy();
    expect(within(timeDisplay).findByText("10:00")).toBeTruthy();
    expect(controlBox).toBeTruthy();
    expect(within(controlBox).getByTestId("controls-rewind")).toBeTruthy();
    expect(within(controlBox).getByTestId("controls-play")).toBeTruthy();
    expect(within(controlBox).getByTestId("controls-ffwd")).toBeTruthy();
    expect(within(controlBox).getByTestId("controls-volume")).toBeTruthy();
    expect(within(controlBox).getByTestId("controls-settings")).toBeTruthy();
  });

  it("should not display a play button in middle container if video is playing", () => {
    const container = screen.getByTestId("mid-container");

    expect(within(container).queryByTestId("controls-play-large")).toBeNull();
  });

  describe("while video paused", () => {
    beforeEach(() => {
      mockedUseVideoPlayer.mockReturnValue({
        ...mockVideoPlayerObject,
        videoState: {
          ...mockVideoPlayerObject.videoState,
          playing: false,
        },
      });
      cleanup();
      render(componentToTest);
    });

    it("should display a play button in middle container if video is paused", () => {
      const container = screen.getByTestId("mid-container");

      expect(
        within(container).queryByTestId("controls-play-large")
      ).toBeTruthy();
    });

    it("should play or pause if play button is clicked (middle)", () => {
      expect(mockVideoPlayerObject.playPause).not.toHaveBeenCalled();

      fireEvent.click(screen.getByTestId("controls-play-large"));

      expect(mockVideoPlayerObject.playPause).toHaveBeenCalled();
    });
  });

  it("should play or pause if middle container is clicked", () => {
    expect(screen.queryByTestId("controls-play-large")).toBeNull();
    expect(mockVideoPlayerObject.playPause).not.toHaveBeenCalled();

    const container = screen.getByTestId("mid-container");
    fireEvent.click(container);

    expect(mockVideoPlayerObject.playPause).toHaveBeenCalled();
  });

  it("should play or pause if play button is clicked (bottom)", () => {
    expect(mockVideoPlayerObject.playPause).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("controls-play"));

    expect(mockVideoPlayerObject.playPause).toHaveBeenCalled();
  });

  it("should rewind if rewind button is clicked", () => {
    expect(mockVideoPlayerObject.rewind).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("controls-rewind"));

    expect(mockVideoPlayerObject.rewind).toHaveBeenCalled();
  });

  it("should fast forward if ffwd button is clicked", () => {
    expect(mockVideoPlayerObject.fastForward).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("controls-ffwd"));

    expect(mockVideoPlayerObject.fastForward).toHaveBeenCalled();
  });

  it("should mute if volume button is clicked", () => {
    expect(mockVideoPlayerObject.mute).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("controls-volume"));

    expect(mockVideoPlayerObject.mute).toHaveBeenCalled();
  });

  it("should display volume slider if volume button is touched once", () => {
    fireEvent.touchStart(screen.getByTestId("controls-volume"));

    const volumeSlider = rootElement.querySelector(".volume-slider.touched");
    expect(volumeSlider).toBeTruthy();
    expect(mockVideoPlayerObject.mute).not.toHaveBeenCalled();
  });

  it("should mute if volume button is touched twice", () => {
    expect(mockVideoPlayerObject.mute).not.toHaveBeenCalled();

    fireEvent.touchStart(screen.getByTestId("controls-volume"));
    fireEvent.touchStart(screen.getByTestId("controls-volume"));

    expect(mockVideoPlayerObject.mute).toHaveBeenCalled();
  });

  it("should display options menu if options button is clicked", () => {
    let optionsMenu = rootElement.querySelector(".options-menu");
    expect(optionsMenu).toBeFalsy();

    fireEvent.click(screen.getByTestId("controls-settings"));

    optionsMenu = rootElement.querySelector(".options-menu");
    expect(optionsMenu).toBeTruthy();
  });

  it("should toggle visualizer if visualizer option is selected", () => {
    fireEvent.click(screen.getByTestId("controls-settings"));
    fireEvent.click(screen.getByText("Visualizer"));

    expect(mockVideoPlayerObject.toggleVisualizer).toHaveBeenCalled();
  });

  it("should toggle video loop if loop option is selected", () => {
    fireEvent.click(screen.getByTestId("controls-settings"));
    fireEvent.click(screen.getByText("Loop"));

    expect(mockVideoPlayerObject.toggleLoop).toHaveBeenCalled();
  });
});
