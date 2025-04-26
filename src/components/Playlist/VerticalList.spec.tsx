import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import VerticalList from "./VerticalList";
import "@/i18next/i18next.ts";
import { ListItemType, useAppContext } from "@/contexts/AppContext";
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

describe("VerticalList", () => {
  let rootElement: HTMLElement;
  let rerender: (ui: React.ReactNode) => void;
  let userActionSpy = vi.fn();
  const mockListItems = [
    {
      id: "0",
      text: "item 1",
      url: "fakeUrl1.com",
    },
    {
      id: "1",
      text: "item 2",
      url: "fakeUrl2.com",
    },
    {
      id: "2",
      text: "item 3",
      url: "fakeUrl3.com",
    },
  ] as ListItemType[];

  const componentToTest = (
    <VerticalList
      activeList={mockListItems}
      subtexts={true}
      activeIndex={0}
      selectedIndex={1}
      onUserAction={userActionSpy}
    />
  );

  const mockedUseApp = vi.mocked(useAppContext);
  const mockedUsePlaylists = vi.mocked(usePlaylistsContext);
  const mockedUseVideoPlayer = vi.mocked(useVideoPlayerContext);
  const mockedUseActivePlaylist = vi.mocked(useActivePlaylistContext);
  const mockedUseUserActions = vi.mocked(useUserActionsContext);

  beforeEach(() => {
    cleanup();
    userActionSpy.mockClear();

    mockedUseApp.mockReturnValue(mockAppObject);
    mockedUsePlaylists.mockReturnValue(mockPlaylistsObject);
    mockedUseVideoPlayer.mockReturnValue(mockVideoPlayerObject);
    mockedUseActivePlaylist.mockReturnValue(mockActivePlaylistObject);
    mockedUseUserActions.mockReturnValue(mockUserActionsObject);

    ({ container: rootElement, rerender } = render(componentToTest, {
      wrapper: AllWrapper,
    }));
  });

  it("should render input element and button for adding new items", () => {
    const addItemElement = rootElement.querySelector(
      ".add-item"
    ) as HTMLElement;
    expect(within(addItemElement).getByRole("textbox")).toBeTruthy();
    expect(within(addItemElement).getByRole("button")).toBeTruthy();
  });

  it("should add new item to list if input is filled out and add button is clicked", () => {
    const addItemElement = rootElement.querySelector(
      ".add-item"
    ) as HTMLElement;
    const input = within(addItemElement).getByRole("textbox");
    const button = within(addItemElement).getByRole("button");

    fireEvent.input(input, { target: { value: "New Fake Item" } });
    fireEvent.click(button);

    expect(userActionSpy).toHaveBeenCalledWith("", "add", "New Fake Item");
  });

  it("should render list items", () => {
    const playButtons = screen.getAllByTestId("play-btn");

    expect(playButtons.length).toBe(3);
  });

  it("should select list item if user clicks on it", () => {
    const playButtons = screen.getAllByTestId("play-btn");
    fireEvent.click(playButtons[2]);

    expect(userActionSpy).toHaveBeenCalledWith(mockListItems[2].id, "select");
  });

  it("should play selected list item if user clicks on it", () => {
    const playButtons = screen.getAllByTestId("play-btn");
    fireEvent.click(playButtons[1]);

    expect(userActionSpy).toHaveBeenCalledWith(mockListItems[1].id, "play");
  });

  it("should unselect list items if user clicks on the list outside any items", () => {
    const playlistPanel = rootElement.querySelector(
      ".playlist-panel"
    ) as HTMLElement;
    fireEvent.click(playlistPanel);

    expect(userActionSpy).toHaveBeenCalledWith("-1", "select");
  });

  it("should display a messsage if list is empty", () => {
    rerender(
      <VerticalList
        activeList={[]}
        activeIndex={-1}
        selectedIndex={-1}
        onUserAction={() => {}}
      />
    );
    const playButtons = screen.queryAllByTestId("play-btn");

    expect(playButtons.length).toBe(0);
    expect(screen.getByText(/empty/i)).toBeTruthy();
  });

  it("should display an error messsage if reading from local storage failed", () => {
    mockedUseApp.mockReturnValue({ ...mockAppObject, LSError: true });
    cleanup();
    render(componentToTest);
    const playButtons = screen.queryAllByTestId("play-btn");

    expect(playButtons.length).toBe(0);
    expect(screen.getByText(/error/i)).toBeTruthy();
  });
});
