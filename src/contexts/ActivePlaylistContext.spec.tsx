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
import ActivePlaylistContext, {
  type useActivePlaylistContext as imported,
} from "./ActivePlaylistContext";
import { mockActivePlaylistContext } from "@/../testing/setupMocks";

describe("ActivePlaylistContext", () => {
  let useActivePlaylistContext: typeof imported;
  const contextWrapper = ({ children }: { children: React.ReactNode }) => (
    <ActivePlaylistContext>{children}</ActivePlaylistContext>
  );
  let result: { current: ReturnType<typeof imported> };
  const fetchReturnValue = "Fake Video Title";

  beforeAll(async () => {
    vi.doUnmock("./ActivePlaylistContext");
    useActivePlaylistContext = (await import("./ActivePlaylistContext"))
      .useActivePlaylistContext;

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ title: fetchReturnValue }),
      } as Response),
    );
  });

  beforeEach(() => {
    ({ result } = renderHook(() => useActivePlaylistContext(), {
      wrapper: contextWrapper,
    }));
  });

  it("should have an initial state of no active playlist, no selected videos and no currently playing videos", () => {
    expect(result.current.activePlaylist).toBe(null);
    expect(result.current.selectedVideo).toEqual({
      id: "",
      index: -1,
      url: "",
      text: "",
    });
    expect(result.current.currentlyPlaying).toEqual({
      id: "",
      index: -1,
      url: "",
      text: "",
    });
  });

  it("should load a new empty playlist if it wasn't in Local Storage", async () => {
    const testPlaylistTitle = "testPlaylist";

    await act(async () => {
      await result.current.loadPlaylist(testPlaylistTitle);
    });

    expect(result.current.activePlaylist).toEqual({
      name: testPlaylistTitle,
      videos: [],
    });
  });

  it("should add a new video if active playlist is loaded (not null)", async () => {
    const testPlaylistTitle = "testPlaylist";
    const testUrl = "fakeUrl.com";

    await act(async () => {
      await result.current.loadPlaylist(testPlaylistTitle);
      await result.current.addNewVideo(testUrl);
    });

    expect(result.current.activePlaylist).toEqual({
      name: testPlaylistTitle,
      videos: [
        { id: expect.any(String), url: testUrl, text: fetchReturnValue },
      ],
    });
  });

  it("should select a video by ID", () => {
    const testVideoID = "fakeVideoID";

    act(() => {
      result.current.selectVideo(testVideoID);
    });

    expect(result.current.selectedVideo.id).toBe(testVideoID);
  });

  it("should play a video by ID", () => {
    const testVideoID = "fakeVideoID";

    act(() => {
      result.current.playVideo(testVideoID);
    });

    expect(result.current.currentlyPlaying.id).toBe(testVideoID);
  });

  it("should play the first video (empty playlist)", () => {
    act(() => {
      result.current.loadPlaylist("testPlaylist");
      result.current.playFirstVideo();
    });

    expect(result.current.currentlyPlaying.id).toBe("");
  });

  describe("From Local Storage", () => {
    const testPlaylistTitle = "testPlaylist";
    const testUrls = ["fakeurl1.com", "fakeurl2.com", "fakeurl3.com"];
    let IDs: string[];

    beforeAll(() => {
      localStorage.setItem(testPlaylistTitle, testUrls.join("\n"));
    });

    beforeEach(async () => {
      ({ result } = renderHook(() => useActivePlaylistContext(), {
        wrapper: contextWrapper,
      }));

      await act(async () => {
        await result.current.loadPlaylist(testPlaylistTitle);
      });

      IDs = result.current.activePlaylist!.videos.map((vid) => vid.id);
    });

    it("should load a playlist from Local Storage", () => {
      expect(result.current.activePlaylist).toEqual({
        name: testPlaylistTitle,
        videos: testUrls.map((testUrl) => ({
          id: expect.any(String),
          text: fetchReturnValue,
          url: testUrl,
        })),
      });
    });

    it("should unload current playlist", async () => {
      act(() => {
        result.current.unloadPlaylist();
      });

      expect(result.current.activePlaylist).toEqual(null);
      expect(result.current.currentlyPlaying.id).toEqual("");
    });

    it("should play the first video (non-empty playlist)", () => {
      act(() => {
        result.current.playFirstVideo();
      });

      expect(result.current.currentlyPlaying.id).toBe(IDs[0]);
    });

    it("should play the next video on the list", () => {
      expect(result.current.currentlyPlaying.id).toBe(IDs[0]);

      act(() => {
        result.current.playNext();
      });

      expect(result.current.currentlyPlaying.id).toBe(IDs[1]);
    });

    it("should edit a video Url", async () => {
      const testUrl = "EditedFakeUrl.com";

      await act(async () => {
        await result.current.editVideo(IDs[0], testUrl);
      });

      expect(result.current.activePlaylist?.videos[0].url).toBe(testUrl);
    });

    it("should delete a video", () => {
      act(() => {
        result.current.deleteVideo(IDs[0]);
      });

      expect(result.current.activePlaylist?.videos.length).toBe(
        testUrls.length - 1,
      );
    });

    it("should swap the order of two videos", () => {
      act(() => {
        result.current.swapVideos(0, 1);
      });

      expect(result.current.activePlaylist?.videos[0]).toEqual({
        id: IDs[1],
        text: fetchReturnValue,
        url: testUrls[1],
      });
      expect(result.current.activePlaylist?.videos[1]).toEqual({
        id: IDs[0],
        text: fetchReturnValue,
        url: testUrls[0],
      });
    });

    it("should move a video to be the first element", () => {
      act(() => {
        result.current.pushVideoToTop(2);
      });

      expect(result.current.activePlaylist?.videos[0]).toEqual({
        id: IDs[2],
        text: fetchReturnValue,
        url: testUrls[2],
      });
      expect(result.current.activePlaylist?.videos.length).toBe(
        testUrls.length,
      );
    });

    it("should move a video to be the last element", () => {
      const length = result.current.activePlaylist?.videos.length || 0;
      act(() => {
        result.current.pushVideoToBottom(0);
      });

      expect(result.current.activePlaylist?.videos[length - 1]).toEqual({
        id: IDs[0],
        text: fetchReturnValue,
        url: testUrls[0],
      });
      expect(result.current.activePlaylist?.videos.length).toBe(
        testUrls.length,
      );
    });

    afterAll(() => {
      localStorage.clear();
    });
  });

  afterAll(() => {
    mockActivePlaylistContext();
  });
});
