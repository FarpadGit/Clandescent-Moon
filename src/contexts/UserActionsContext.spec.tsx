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
import { type useUserActionsContext as imported } from "./UserActionsContext";
import { mockUserActionsContext } from "@/../testing/setupMocks";
import {
  mockAppObject,
  mockPlaylistsObject,
  mockActivePlaylistObject,
  mockVideoPlayerObject,
} from "@/../testing/mockContextReturnValues";
import { LSRootKey, useAppContext } from "./AppContext";
import { usePlaylistsContext } from "./PlaylistsContext";
import { useVideoPlayerContext } from "./VideoPlayerContext";
import { useActivePlaylistContext } from "./ActivePlaylistContext";
import { AllWrapper } from "../../testing/wrappers";
import FileSaver from "file-saver";
import LZString from "lz-string";

describe("UserActionsContext", () => {
  let useUserActionsContext: typeof imported;
  let result: { current: ReturnType<typeof imported> };

  // mocked responses for Youtube API that gets the videos inside a Youtube playlist
  const mockYTPlaylist = ["FakeVideo1ID", "FakeVideo2ID"];
  const mockYTResponse = {
    items: [
      {
        snippet: {
          resourceId: {
            videoId: mockYTPlaylist[0],
          },
        },
      },
      {
        snippet: {
          resourceId: {
            videoId: mockYTPlaylist[1],
          },
        },
      },
    ],
    nextPageToken: null,
  };

  // mocked response for ki.tc API that returns a download link after uploading a file to it.
  const mockKitcUploadResponse = {
    file: {
      link: "FakeKitcLink",
    },
  };

  // mocked response for ki.tc API that returns the uploaded file (which was compressed before upload and will try to decompress it).
  const downloadedPlaylistName = "mock downloaded playlist";
  const mockKitcDownloadResponse = LZString.compressToUTF16(
    downloadedPlaylistName
  );

  // mocked response for fetching a local CSV preset file with fetch
  const mockPreset = "Fake Playlist\nFakeUrl1\nFakeUrl2";

  // mocking all the React Contexts it needs for everything
  const mockedUseApp = vi.mocked(useAppContext);
  const mockedUsePlaylists = vi.mocked(usePlaylistsContext);
  const mockedUseVideoPlayer = vi.mocked(useVideoPlayerContext);
  const mockedUseActivePlaylist = vi.mocked(useActivePlaylistContext);

  beforeAll(async () => {
    vi.doUnmock("./UserActionsContext");
    useUserActionsContext = (await import("./UserActionsContext"))
      .useUserActionsContext;

    // mocking global fetch
    global.fetch = vi.fn((input: URL | RequestInfo) => {
      if (input.toString().includes("googleapis")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockYTResponse),
        } as Response);
      }
      if (input.toString().includes("ki.tc/file/u/")) {
        return Promise.resolve({
          json: () => Promise.resolve(mockKitcUploadResponse),
        } as Response);
      }
      if (input.toString().includes("ki.tc/f/")) {
        return Promise.resolve({
          text: () => Promise.resolve(mockKitcDownloadResponse),
        } as Response);
      }
      if (input.toString().includes("/presets/")) {
        return Promise.resolve({
          text: () => Promise.resolve(mockPreset),
        } as Response);
      }
      return Promise.reject();
    });
  });

  beforeEach(() => {
    mockedUseApp.mockReturnValue(mockAppObject);
    mockedUsePlaylists.mockReturnValue(mockPlaylistsObject);
    mockedUseVideoPlayer.mockReturnValue(mockVideoPlayerObject);
    mockedUseActivePlaylist.mockReturnValue(mockActivePlaylistObject);

    ({ result } = renderHook(() => useUserActionsContext(), {
      wrapper: AllWrapper,
    }));
  });

  describe("handleUserActions - playlist", () => {
    const testPlaylistID = "FakePlaylistID";

    it("should relay adding a new playlist", () => {
      const testPlaylist = "Fake New Playlist";

      result.current.handleUserActions(
        "playlist",
        testPlaylistID,
        "add",
        testPlaylist
      );

      expect(mockPlaylistsObject.addNewPlaylist).toHaveBeenCalledWith(
        testPlaylist
      );
    });

    it("should relay deleting a playlist and unselect it", () => {
      result.current.handleUserActions("playlist", testPlaylistID, "delete");

      expect(mockPlaylistsObject.deletePlaylist).toHaveBeenCalledWith(
        testPlaylistID
      );
      expect(mockPlaylistsObject.selectPlaylist).toHaveBeenCalledWith("");
    });

    it("should relay editing a playlist", () => {
      const testPlaylist = "Edited Fake Playlist";

      result.current.handleUserActions(
        "playlist",
        testPlaylistID,
        "edit",
        testPlaylist
      );

      expect(mockPlaylistsObject.editPlaylist).toHaveBeenCalledWith(
        testPlaylistID,
        testPlaylist
      );
    });

    it("should relay moving down a playlist", () => {
      result.current.handleUserActions("playlist", testPlaylistID, "move-down");

      expect(mockPlaylistsObject.swapPlaylists).toHaveBeenCalledWith(
        mockPlaylistsObject.selectedPlaylist.index,
        mockPlaylistsObject.selectedPlaylist.index + 1
      );
    });

    it("should relay moving up a playlist", () => {
      result.current.handleUserActions("playlist", testPlaylistID, "move-up");

      expect(mockPlaylistsObject.swapPlaylists).toHaveBeenCalledWith(
        mockPlaylistsObject.selectedPlaylist.index,
        mockPlaylistsObject.selectedPlaylist.index - 1
      );
    });

    it("should relay loading a playlist, start playing it and switch over to 'Videos' tab", () => {
      result.current.handleUserActions("playlist", testPlaylistID, "play");

      expect(mockActivePlaylistObject.loadPlaylist).toHaveBeenCalledWith(
        mockPlaylistsObject.selectedPlaylist.text
      );
      expect(mockPlaylistsObject.startPlaylist).toHaveBeenCalledWith(
        testPlaylistID
      );
      expect(mockAppObject.changeToTab).toHaveBeenCalledWith(1);
    });

    it("should relay selecting a playlist", () => {
      result.current.handleUserActions("playlist", testPlaylistID, "select");

      expect(mockPlaylistsObject.selectPlaylist).toHaveBeenCalledWith(
        testPlaylistID
      );
    });
  });

  describe("handleUserActions - video", () => {
    const testVideoID = "FakeVideoID";

    it("should relay adding a new video (autocorrect on)", () => {
      const testVideoUrl = "FakeUrl.com";

      result.current.handleUserActions(
        "video",
        testVideoID,
        "add",
        testVideoUrl
      );

      expect(mockActivePlaylistObject.addNewVideo).toHaveBeenCalledWith(
        "https://www.youtube.com/watch?v=" + testVideoUrl
      );
    });

    it("should relay adding a new video (autocorrect off)", () => {
      const testVideoUrl = "FakeUrl.com";
      mockedUseApp.mockReturnValue({
        ...mockAppObject,
        isAutocorrectOn: false,
      });
      const { result } = renderHook(() => useUserActionsContext(), {
        wrapper: AllWrapper,
      });

      result.current.handleUserActions(
        "video",
        testVideoID,
        "add",
        testVideoUrl
      );

      expect(mockActivePlaylistObject.addNewVideo).toHaveBeenCalledWith(
        testVideoUrl
      );
    });

    it("should relay adding a youtube playlist of new videos", async () => {
      const testVideoUrl =
        "https://www.youtube.com/watch?v=FakeID&list=FakeListID";

      // this call actually dispatches an async method without awaiting it but we need it to run through, thus the cast hacking
      await act(async () => {
        await (result.current.handleUserActions(
          "video",
          testVideoID,
          "add",
          testVideoUrl
        ) as unknown as Promise<void>);
      });

      expect(mockActivePlaylistObject.addNewVideo).toHaveBeenCalledTimes(
        mockYTPlaylist.length
      );
      expect(mockActivePlaylistObject.addNewVideo).toHaveBeenNthCalledWith(
        1,
        "https://www.youtube.com/watch?v=" + mockYTPlaylist[0]
      );
      expect(mockActivePlaylistObject.addNewVideo).toHaveBeenNthCalledWith(
        2,
        "https://www.youtube.com/watch?v=" + mockYTPlaylist[1]
      );
    });

    it("should relay deleting a video and unselect it", () => {
      result.current.handleUserActions("video", testVideoID, "delete");

      expect(mockActivePlaylistObject.deleteVideo).toHaveBeenCalledWith(
        testVideoID
      );
      expect(mockActivePlaylistObject.selectVideo).toHaveBeenCalledWith("");
    });

    it("should relay editing a video", () => {
      const testVideoUrl = "EditedFakeUrl.com";

      result.current.handleUserActions(
        "video",
        testVideoID,
        "edit",
        testVideoUrl
      );

      expect(mockActivePlaylistObject.editVideo).toHaveBeenCalledWith(
        testVideoID,
        testVideoUrl
      );
    });

    it("should relay moving down a video", () => {
      result.current.handleUserActions("video", testVideoID, "move-down");

      expect(mockActivePlaylistObject.swapVideos).toHaveBeenCalledWith(
        mockActivePlaylistObject.selectedVideo.index,
        mockActivePlaylistObject.selectedVideo.index + 1
      );
    });

    it("should relay moving up a video", () => {
      result.current.handleUserActions("video", testVideoID, "move-up");

      expect(mockActivePlaylistObject.swapVideos).toHaveBeenCalledWith(
        mockActivePlaylistObject.selectedVideo.index,
        mockActivePlaylistObject.selectedVideo.index - 1
      );
    });

    it("should relay playing a video", () => {
      result.current.handleUserActions("video", testVideoID, "play");

      expect(mockActivePlaylistObject.playVideo).toHaveBeenCalledWith(
        testVideoID
      );
    });

    it("should relay pausing a video", () => {
      mockedUseVideoPlayer.mockReturnValue({
        ...mockVideoPlayerObject,
        videoState: {
          ...mockVideoPlayerObject.videoState,
          playing: false,
        },
      });
      const { result } = renderHook(() => useUserActionsContext(), {
        wrapper: AllWrapper,
      });

      result.current.handleUserActions("video", testVideoID, "play");

      expect(mockVideoPlayerObject.playPause).toHaveBeenCalled();
    });

    it("should relay selecting a video", () => {
      result.current.handleUserActions("video", testVideoID, "select");

      expect(mockActivePlaylistObject.selectVideo).toHaveBeenCalledWith(
        testVideoID
      );
    });
  });

  // these tests actually use preexisting playlist data both in Local Storage and in contexts to import/export
  describe("Playlist Import/Export", () => {
    const testPlaylistTitle = "testPlaylist";
    const testUrls = ["fakeurl1.com", "fakeurl2.com"];
    const testVideos = [
      {
        id: "FakeVideo1ID",
        text: "Fake Video 1",
        url: testUrls[0],
      },
      {
        id: "FakeVideo2ID",
        text: "Fake Video 2",
        url: testUrls[1],
      },
    ];

    vi.mock("file-saver");
    const saveAsSpy = vi.mocked(FileSaver).saveAs;

    beforeAll(() => {
      localStorage.setItem(LSRootKey, JSON.stringify([testPlaylistTitle]));
      localStorage.setItem(testPlaylistTitle, testUrls.join("\n"));
    });

    beforeEach(async () => {
      mockedUseActivePlaylist.mockReturnValue({
        ...mockActivePlaylistObject,
        activePlaylist: { name: testPlaylistTitle, videos: testVideos },
      });

      ({ result } = renderHook(() => useUserActionsContext(), {
        wrapper: AllWrapper,
      }));
    });

    it("should export active playlist to file", () => {
      result.current.exportActiveToFile();

      expect(saveAsSpy).toHaveBeenCalledWith(
        expect.any(Blob),
        testPlaylistTitle + ".csv"
      );
    });

    it("should export all playlists to file", () => {
      result.current.exportAllToFile();

      expect(saveAsSpy).toHaveBeenCalledWith(
        expect.any(Blob),
        "My Clandescent Moon Playlists.csv"
      );
    });

    it("should export active playlist to external storage", async () => {
      const downloadLink = await result.current.exportActiveToCloud();

      expect(downloadLink).toBe(mockKitcUploadResponse.file.link);
    });

    it("should export all playlists to external storage", async () => {
      const downloadLink = await result.current.exportAllToCloud();

      expect(downloadLink).toBe(mockKitcUploadResponse.file.link);
    });

    it("should import playlists from file", () => {
      const testPlaylists = ["Fake Playlist Title A", "Fake Playlist Title B"];
      const testVideos = [
        ["FakeUrlA-1.com", "FakeUrlB-1.com"],
        ["FakeUrlA-2.com", "FakeUrlB-2.com"],
      ];
      const testHeaders = testPlaylists.join(";");
      const testCSV = testVideos
        .map((playlistVids) => playlistVids.join(";"))
        .join("\n");

      result.current.importFromFile(testHeaders + "\n" + testCSV);
      const playlistAFromLS = localStorage.getItem(testPlaylists[0]);
      const playlistBFromLS = localStorage.getItem(testPlaylists[1]);

      expect(playlistAFromLS).toBe(
        [testVideos[0][0], testVideos[1][0]].join("\r\n")
      );
      expect(playlistBFromLS).toBe(
        [testVideos[0][1], testVideos[1][1]].join("\r\n")
      );
      localStorage.removeItem(testPlaylists[0]);
      localStorage.removeItem(testPlaylists[1]);
    });

    it("should import playlists from external storage", async () => {
      const importResult = await result.current.importFromCloud(
        mockKitcDownloadResponse
      );

      expect(importResult).toBe(true);
      localStorage.removeItem(downloadedPlaylistName);
    });

    it("should load preset into Local Storage", async () => {
      let testPlaylistName: string;
      let testPlaylistVideos: string[];
      [testPlaylistName, ...testPlaylistVideos] = mockPreset.split("\n");

      await result.current.setPlaylistToLocalStorage("Fake Playlist Name");
      const playlistFromLS = localStorage.getItem(testPlaylistName);

      expect(playlistFromLS).toBe(testPlaylistVideos!.join("\r\n"));
      localStorage.removeItem(testPlaylistName);
    });

    afterAll(() => {
      localStorage.clear();
    });
  });

  afterAll(() => {
    mockUserActionsContext();
  });
});
