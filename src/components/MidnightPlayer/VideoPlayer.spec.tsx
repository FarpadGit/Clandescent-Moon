import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import VideoPlayer from "./VideoPlayer";
import "@/i18next/i18next.ts";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";
import { useActivePlaylistContext } from "@/contexts/ActivePlaylistContext";
import {
  mockActivePlaylistObject,
  mockVideoPlayerObject,
} from "@/../testing/mockContextReturnValues";
import { MidnightPlayerWrapper } from "@/../testing/wrappers";

describe("VideoPlayer", () => {
  const componentToTest = <VideoPlayer />;

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
  });

  it("should display an image if no video is currently playing", () => {
    mockedUseActivePlaylist.mockReturnValue({
      ...mockActivePlaylistObject,
      currentlyPlaying: {
        ...mockActivePlaylistObject.currentlyPlaying,
        id: "",
      },
    });
    const { container } = render(componentToTest, {
      wrapper: MidnightPlayerWrapper,
    });

    const videoPlayerContainer = container.querySelector(".Midnight-Player");
    const coverImage = screen.queryByRole("img");

    expect(coverImage).toBeTruthy();
    expect(videoPlayerContainer).toBeFalsy();
  });

  it("should display video player with controls overlay if a video is currently playing", () => {
    const { container } = render(componentToTest, {
      wrapper: MidnightPlayerWrapper,
    });

    const videoPlayerContainer = container.querySelector(
      ".Midnight-Player"
    ) as HTMLElement;
    const coverImage = screen.queryByRole("img");
    const reactPlayer = videoPlayerContainer.querySelector(".player-container");
    const controls = videoPlayerContainer.querySelector(".control-container");

    expect(reactPlayer).toBeTruthy();
    expect(controls).toBeTruthy();
    expect(coverImage).toBeFalsy();
  });
});
