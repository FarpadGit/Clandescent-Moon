import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import Playlist from "./Playlist";
import "@/i18next/i18next.ts";
import { useAppContext } from "@/contexts/AppContext";
import { usePlaylistsContext } from "@/contexts/PlaylistsContext";
import { useActivePlaylistContext } from "@/contexts/ActivePlaylistContext";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";
import { useUserActionsContext } from "@/contexts/UserActionsContext";
import {
  mockActivePlaylistObject,
  mockAppObject,
  mockPlaylistsObject,
  mockUserActionsObject,
  mockVideoPlayerObject,
} from "@/../testing/mockContextReturnValues";
import { AllWrapper } from "@/../testing/wrappers";

describe("Playlist", () => {
  let rootElement: HTMLElement;

  const componentToTest = <Playlist />;

  const mockedUseApp = vi.mocked(useAppContext);
  const mockedUsePlaylists = vi.mocked(usePlaylistsContext);
  const mockedUseVideoPlayer = vi.mocked(useVideoPlayerContext);
  const mockedUseActivePlaylist = vi.mocked(useActivePlaylistContext);
  const mockedUseUserActions = vi.mocked(useUserActionsContext);

  beforeEach(() => {
    cleanup();

    mockedUseApp.mockReturnValue(mockAppObject);
    mockedUsePlaylists.mockReturnValue(mockPlaylistsObject);
    mockedUseVideoPlayer.mockReturnValue(mockVideoPlayerObject);
    mockedUseActivePlaylist.mockReturnValue(mockActivePlaylistObject);
    mockedUseUserActions.mockReturnValue(mockUserActionsObject);

    ({ container: rootElement } = render(componentToTest, {
      wrapper: AllWrapper,
    }));
  });

  it("should render the playlist component", () => {
    const toolbarElement =
      rootElement.querySelector<HTMLElement>(".toolbar-tab");

    expect(rootElement.querySelector(".playlist")).toBeTruthy();
    expect(rootElement.querySelectorAll(".playlist-panel").length).toBe(2);
    expect(rootElement.querySelector(".options-panel")).toBeTruthy();
    expect(screen.getAllByRole("tab").length).toBe(3);
    expect(screen.getAllByRole("tabpanel").length).toBe(3);
    expect(toolbarElement).toBeTruthy();
    expect(within(toolbarElement!).getByRole("textbox")).toBeTruthy();
    expect(within(toolbarElement!).getAllByRole("button").length).toBe(2);
  });
});
