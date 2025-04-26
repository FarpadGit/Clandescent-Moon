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
import { type useVideoPlayerContext as imported } from "./VideoPlayerContext";
import { mockVideoPlayerContext } from "@/../testing/setupMocks";
import { MidnightPlayerWrapper } from "../../testing/wrappers";
import { useActivePlaylistContext } from "./ActivePlaylistContext";
import { mockActivePlaylistObject } from "../../testing/mockContextReturnValues";

describe("VideoPlayerContext", () => {
  let useVideoPlayerContext: typeof imported;
  let result: { current: ReturnType<typeof imported> };

  const mockedUseActivePlaylist = vi.mocked(useActivePlaylistContext);

  beforeAll(async () => {
    vi.doUnmock("./VideoPlayerContext");
    useVideoPlayerContext = (await import("./VideoPlayerContext"))
      .useVideoPlayerContext;
  });

  beforeEach(() => {
    mockedUseActivePlaylist.mockReturnValue(mockActivePlaylistObject);

    ({ result } = renderHook(() => useVideoPlayerContext(), {
      wrapper: MidnightPlayerWrapper,
    }));
  });

  it("should have an initial state of no video player, default video state and a seeker fidelity of 1000", () => {
    expect(result.current.videoPlayer.current).toBe(null);
    expect(result.current.videoState).toEqual({
      playing: true,
      muted: false,
      volume: 0.75,
      playedFraction: 0,
      seeking: false,
      buffer: true,
      visualizerOn: true,
      onLoop: false,
    });
    expect(result.current.seekerFidelity).toBe(1000);
  });

  it("should toggle between playing and paused states", () => {
    expect(result.current.videoState.playing).toBe(true);

    act(() => {
      result.current.playPause();
    });

    expect(result.current.videoState.playing).toBe(false);
  });

  it("should rewind video play progress", () => {
    act(() => {
      result.current.rewind();
    });

    expect(result.current.videoState.playedFraction).toBe(0);
  });

  it("should fast forward to next video in playlist", () => {
    act(() => {
      result.current.fastForward();
    });

    expect(mockActivePlaylistObject.playNext).toHaveBeenCalled();
  });

  it("should enter seeking state", () => {
    act(() => {
      result.current.seekStart();
    });

    expect(result.current.videoState.seeking).toBe(true);
  });

  it("should seek in video", () => {
    const seekTo = 400;
    const seekFraction = seekTo / result.current.seekerFidelity;

    act(() => {
      result.current.handleSeek(seekTo);
    });

    expect(result.current.videoState.playedFraction).toBe(seekFraction);
  });

  it("should end seeking", () => {
    act(() => {
      result.current.seekEnd(400);
    });

    expect(result.current.videoState.seeking).toBe(false);
  });

  it("should change the volume", () => {
    const newVolumePercent = 40;

    act(() => {
      result.current.changeVolume(newVolumePercent);
    });

    expect(result.current.videoState.volume).toBe(newVolumePercent / 100);
    expect(result.current.videoState.muted).toBe(false);
  });

  it("should mute volume by changing it to zero", () => {
    const newVolumePercent = 0;

    act(() => {
      result.current.changeVolume(newVolumePercent);
    });

    expect(result.current.videoState.volume).toBe(0);
    expect(result.current.videoState.muted).toBe(true);
  });

  it("should mute volume", () => {
    act(() => {
      result.current.mute();
    });

    expect(result.current.videoState.muted).toBe(true);
  });

  it("should handle video player play progress", () => {
    const progressObject = {
      played: 0.4,
      loaded: 0,
      loadedSeconds: 0,
      playedSeconds: 0,
    };

    act(() => {
      result.current.handleProgress(progressObject);
    });

    expect(result.current.videoState.playedFraction).toBe(
      progressObject.played
    );
  });

  it("should enter buffering state", () => {
    act(() => {
      result.current.handleBuffer();
    });

    expect(result.current.videoState.buffer).toBe(true);
  });

  it("should leave buffering state", () => {
    act(() => {
      result.current.handleBufferEnd();
    });

    expect(result.current.videoState.buffer).toBe(false);
  });

  it("should format a number into M:SS time format", () => {
    const formattedTime = result.current.formatTime(500);

    expect(formattedTime).toBe("8:20");
  });

  it("should format a number into MM:SS time format", () => {
    const formattedTime = result.current.formatTime(1000);

    expect(formattedTime).toBe("16:40");
  });

  it("should format a larger number into H:MM:SS time format", () => {
    const formattedTime = result.current.formatTime(5000);

    expect(formattedTime).toBe("1:23:20");
  });

  it("should toggle visualizer", () => {
    expect(result.current.videoState.visualizerOn).toBe(true);

    act(() => {
      result.current.toggleVisualizer();
    });

    expect(result.current.videoState.visualizerOn).toBe(false);
  });

  it("should toggle video looping", () => {
    expect(result.current.videoState.onLoop).toBe(false);

    act(() => {
      result.current.toggleLoop();
    });

    expect(result.current.videoState.onLoop).toBe(true);
  });

  afterAll(() => {
    mockVideoPlayerContext();
  });
});
