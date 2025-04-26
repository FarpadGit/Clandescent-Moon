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
import PlaylistsContext, {
  type usePlaylistsContext as imported,
} from "./PlaylistsContext";
import { mockPlaylistsContext } from "@/../testing/setupMocks";
import { LSRootKey } from "./AppContext";

describe("PlaylistsContext", () => {
  let usePlaylistsContext: typeof imported;
  const contextWrapper = ({ children }: { children: React.ReactNode }) => (
    <PlaylistsContext>{children}</PlaylistsContext>
  );
  let result: { current: ReturnType<typeof imported> };

  beforeAll(async () => {
    vi.doUnmock("./PlaylistsContext");
    usePlaylistsContext = (await import("./PlaylistsContext"))
      .usePlaylistsContext;
  });

  beforeEach(() => {
    ({ result } = renderHook(() => usePlaylistsContext(), {
      wrapper: contextWrapper,
    }));
  });

  it("should have an initial state of no playlists, no selected playlist and no currently playing playlist", () => {
    expect(result.current.playlists).toEqual([]);
    expect(result.current.selectedPlaylist).toEqual({
      id: "",
      index: -1,
      text: "",
    });
    expect(result.current.loadedPlaylist).toEqual({
      id: "",
      index: -1,
      text: "",
    });
  });

  it("should add a new playlist", () => {
    const testPlaylistTitle = "testPlaylist";

    act(() => {
      result.current.addNewPlaylist(testPlaylistTitle);
    });

    expect(result.current.playlists).toEqual([
      {
        id: expect.any(String),
        text: testPlaylistTitle,
      },
    ]);
  });

  it("should select a playlist by ID", () => {
    const testPlaylistID = "fakePlaylistID";

    act(() => {
      result.current.selectPlaylist(testPlaylistID);
    });

    expect(result.current.selectedPlaylist.id).toBe(testPlaylistID);
  });

  it("should play a playlist by ID", () => {
    const testPlaylistID = "fakePlaylistID";

    act(() => {
      result.current.startPlaylist(testPlaylistID);
    });

    expect(result.current.loadedPlaylist.id).toBe(testPlaylistID);
  });

  describe("From Local Storage", () => {
    const testPlaylists = ["Fake Playlist 1", "Fake Playlist 2"];
    const testUrls = ["fakeurl1.com", "fakeurl2.com"];
    let IDs: string[];

    beforeAll(() => {
      localStorage.setItem(LSRootKey, JSON.stringify(testPlaylists));
      localStorage.setItem(testPlaylists[0], testUrls.join("\n"));
    });

    beforeEach(() => {
      ({ result } = renderHook(() => usePlaylistsContext(), {
        wrapper: contextWrapper,
      }));

      IDs = result.current.playlists.map((pl) => pl.id);
    });

    it("should load playlists from Local Storage", () => {
      expect(result.current.playlists).toEqual([
        {
          id: expect.any(String),
          text: testPlaylists[0],
        },
        {
          id: expect.any(String),
          text: testPlaylists[1],
        },
      ]);
    });

    it("should get the size of a playlist", () => {
      const playlistSize = result.current.getPlaylistSize(IDs[0]);

      expect(playlistSize).toBe(2);
    });

    it("should clear all playlist", () => {
      act(() => {
        result.current.clearPlaylists();
      });

      expect(result.current.playlists).toEqual([]);
    });

    it("should edit a playlist name", () => {
      const testName = "Edited Fake Playlist";

      act(() => {
        result.current.editPlaylist(IDs[0], testName);
      });

      expect(result.current.playlists[0].text).toBe(testName);
    });

    it("should delete a video", () => {
      act(() => {
        result.current.deletePlaylist(IDs[0]);
      });

      expect(result.current.playlists.length).toBe(1);
    });

    it("should swap the order of two playlists", () => {
      act(() => {
        result.current.swapPlaylists(0, 1);
      });

      expect(result.current.playlists).toEqual([
        {
          id: IDs[1],
          text: testPlaylists[1],
        },
        { id: IDs[0], text: testPlaylists[0] },
      ]);
    });

    afterAll(() => {
      localStorage.clear();
    });
  });

  afterAll(() => {
    mockPlaylistsContext();
  });
});
