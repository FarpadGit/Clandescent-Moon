import BaseReactPlayer, { BaseReactPlayerProps } from "react-player/base";
import { vi } from "vitest";
import { PlayMode } from "../src/contexts/AppContext";

export const mockAppObject = {
  LSLoading: false,
  setLoading: vi.fn(),
  LSError: false,
  setError: vi.fn(),
  clearError: vi.fn(),
  selectedTabIndex: 0,
  changeToTab: vi.fn(),
  isAutosaveOn: true,
  toggleAutosave: vi.fn(),
  isAutocorrectOn: true,
  toggleAutocorrect: vi.fn(),
  playMode: "linear" as PlayMode,
  setPlayMode: vi.fn(),
  isFileUploadOn: true,
  toggleFileUpload: vi.fn(),
};

export const mockPlaylistsObject = {
  playlists: [],
  selectedPlaylist: {
    id: "mockPlaylistID1",
    index: 0,
    text: "Mock Playlist 1",
  },
  loadedPlaylist: {
    id: "mockPlaylistID2",
    index: 1,
    text: "Mock Playlist 2",
  },
  getPlaylistSize: vi.fn(),
  selectPlaylist: vi.fn(),
  startPlaylist: vi.fn(),
  clearPlaylists: vi.fn(),
  addNewPlaylist: vi.fn(),
  editPlaylist: vi.fn(),
  deletePlaylist: vi.fn(),
  swapPlaylists: vi.fn(),
  pushPlaylistToTop: vi.fn(),
  pushPlaylistToBottom: vi.fn(),
};

export const mockActivePlaylistObject = {
  activePlaylist: { name: "mockPlaylist", videos: [] },
  selectedVideo: {
    id: "mockVideo1ID",
    index: 0,
    url: "www.fakeUrl.com",
    text: "Mock Video Title 1",
  },
  currentlyPlaying: {
    id: "mockVideo2ID",
    index: 1,
    url: "", //must be empty or ReactPlayer will try to load it
    text: "Mock Video Title 2",
  },
  loadPlaylist: vi.fn(),
  unloadPlaylist: vi.fn(),
  addNewVideo: vi.fn(),
  selectVideo: vi.fn(),
  playVideo: vi.fn(),
  playFirstVideo: vi.fn(),
  playNext: vi.fn(),
  editVideo: vi.fn(),
  deleteVideo: vi.fn(),
  swapVideos: vi.fn(),
  pushVideoToTop: vi.fn(),
  pushVideoToBottom: vi.fn(),
};

export const mockVideoPlayerObject = {
  videoPlayer: {
    current: {
      getCurrentTime: () => 0,
      getDuration: () => 10 * 60,
    } as BaseReactPlayer<BaseReactPlayerProps>,
  },
  videoState: {
    buffer: false,
    muted: false,
    onLoop: false,
    playedFraction: 0,
    playing: true,
    seeking: false,
    visualizerOn: true,
    volume: 1,
  },
  seekerFidelity: 1000,
  playPause: vi.fn(),
  rewind: vi.fn(),
  fastForward: vi.fn(),
  seekStart: vi.fn(),
  handleSeek: vi.fn(),
  seekEnd: vi.fn(),
  changeVolume: vi.fn(),
  mute: vi.fn(),
  handleProgress: vi.fn(),
  handleBuffer: vi.fn(),
  handleBufferEnd: vi.fn(),
  formatTime: vi.fn(),
  toggleVisualizer: vi.fn(),
  toggleLoop: vi.fn(),
};

export const mockUserActionsObject = {
  handleUserActions: vi.fn(),
  exportActiveToFile: vi.fn(),
  exportAllToFile: vi.fn(),
  importFromFile: vi.fn(),
  exportActiveToCloud: vi.fn(),
  exportAllToCloud: vi.fn(),
  importFromCloud: vi.fn(),
  setPlaylistToLocalStorage: vi.fn(),
};
