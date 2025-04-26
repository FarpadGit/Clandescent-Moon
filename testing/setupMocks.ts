import { vi } from "vitest";

// the things I do just to not repeat a path string...
const {
  AppContextPath,
  PlaylistsContextPath,
  ActivePlaylistContextPath,
  VideoPlayerContextPath,
  UserActionsContextPath,
} = vi.hoisted(() => {
  const AppContextPath = "../src/contexts/AppContext";
  const PlaylistsContextPath = "../src/contexts/PlaylistsContext";
  const ActivePlaylistContextPath = "../src/contexts/ActivePlaylistContext";
  const VideoPlayerContextPath = "../src/contexts/VideoPlayerContext";
  const UserActionsContextPath = "../src/contexts/UserActionsContext";
  return {
    AppContextPath,
    PlaylistsContextPath,
    ActivePlaylistContextPath,
    VideoPlayerContextPath,
    UserActionsContextPath,
  };
});

export function mockAppContext() {
  vi.mock(AppContextPath, async () => {
    const actual = await vi.importActual(AppContextPath);
    return {
      ...actual,
      useAppContext: vi.fn(() => ({ isAutosaveOn: false, playMode: "linear" })),
    };
  });
}

export function mockPlaylistsContext() {
  vi.mock(PlaylistsContextPath, async () => {
    const actual = await vi.importActual(PlaylistsContextPath);
    return {
      ...actual,
      usePlaylistsContext: vi.fn(),
    };
  });
}

export function mockActivePlaylistContext() {
  vi.mock(ActivePlaylistContextPath, async () => {
    const actual = await vi.importActual(ActivePlaylistContextPath);
    return {
      ...actual,
      useActivePlaylistContext: vi.fn(),
    };
  });
}

export function mockVideoPlayerContext() {
  vi.mock(VideoPlayerContextPath, async () => {
    const actual = await vi.importActual(VideoPlayerContextPath);
    return {
      ...actual,
      useVideoPlayerContext: vi.fn(),
    };
  });
}

export function mockUserActionsContext() {
  vi.mock(UserActionsContextPath, async () => {
    const actual = await vi.importActual(UserActionsContextPath);
    return {
      ...actual,
      useUserActionsContext: vi.fn(),
    };
  });
}

export function mockuseMediaQueryHook() {
  vi.mock("../src/hooks/useMediaQuery", () => ({
    default: () => ({ LG: true }),
  }));
}

mockAppContext();
mockPlaylistsContext();
mockActivePlaylistContext();
mockVideoPlayerContext();
mockUserActionsContext();
mockuseMediaQueryHook();
