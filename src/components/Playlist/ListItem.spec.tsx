import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import ListItem from "./ListItem";
import "@/i18next/i18next.ts";
import { useActivePlaylistContext } from "@/contexts/ActivePlaylistContext";
import { useVideoPlayerContext } from "@/contexts/VideoPlayerContext";
import {
  mockActivePlaylistObject,
  mockVideoPlayerObject,
} from "@/../testing/mockContextReturnValues";
import { MidnightPlayerWrapper } from "@/../testing/wrappers";

describe("ListItem", () => {
  let rerender: (ui: React.ReactNode) => void;
  let onUserActionSpy = vi.fn();

  const componentToTest = (
    <ListItem
      text="mockItem"
      subtext="mockSubtext"
      isFirst={false}
      isLast={false}
      textOnEdit="mockUrl"
      onUserAction={onUserActionSpy}
    />
  );

  const mockedUseVideoPlayer = vi.mocked(useVideoPlayerContext);
  const mockedUseActivePlaylist = vi.mocked(useActivePlaylistContext);

  beforeEach(() => {
    cleanup();
    onUserActionSpy.mockClear();

    mockedUseVideoPlayer.mockReturnValue(mockVideoPlayerObject);
    mockedUseActivePlaylist.mockReturnValue(mockActivePlaylistObject);

    ({ rerender } = render(componentToTest, {
      wrapper: MidnightPlayerWrapper,
    }));
  });

  it("should render the supplied text, subtext, control buttons and no input element", () => {
    const subtextElement = screen.getByTestId("subtext");

    expect(screen.getByText("mockItem")).toBeTruthy();
    expect(subtextElement).toBeTruthy();
    expect(within(subtextElement).getByText("mockSubtext")).toBeTruthy();
    expect(screen.getByTestId("edit-btn")).toBeTruthy();
    expect(screen.getByTestId("up-btn")).toBeTruthy();
    expect(screen.getByTestId("play-btn")).toBeTruthy();
    expect(screen.getByTestId("down-btn")).toBeTruthy();
    expect(screen.getByTestId("delete-btn")).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeFalsy();
  });

  it('should render "Unknown Video" as text if supplied text is an i18n key', () => {
    rerender(
      <ListItem
        text="videos.unknownTitle"
        isFirst={false}
        isLast={false}
        textOnEdit="mockUrl"
        onUserAction={() => {}}
      />
    );

    expect(screen.getByText("Unknown Video")).toBeTruthy();
    expect(screen.queryByText("videos.unknownTitle")).toBeFalsy();
  });

  it("should display a text input in edit mode instead of supplied text", () => {
    fireEvent.click(screen.getByTestId("edit-btn"));
    const input = screen.getByRole<HTMLInputElement>("textbox");

    expect(input).toBeTruthy();
    expect(input.value).toBe("mockUrl");
    expect(screen.queryByText("mockItem")).toBeFalsy();
  });

  it('should call onUserAction with "edit" if item was edited', () => {
    fireEvent.click(screen.getByTestId("edit-btn"));
    fireEvent.change(screen.getByRole<HTMLInputElement>("textbox"), {
      target: { value: "mockEditedUrl" },
    });
    fireEvent.click(screen.getByTestId("edit-btn"));

    expect(onUserActionSpy).toHaveBeenCalledWith("edit", "mockEditedUrl");
  });

  it('should call onUserAction with "move-up" if item was moved up the list', () => {
    fireEvent.click(screen.getByTestId("up-btn"));

    expect(onUserActionSpy).toHaveBeenCalledWith("move-up");
  });

  it('should call onUserAction with "move-down" if item was moved down the list', () => {
    fireEvent.click(screen.getByTestId("down-btn"));

    expect(onUserActionSpy).toHaveBeenCalledWith("move-down");
  });

  it('should call onUserAction with "delete" if item was deleted', () => {
    fireEvent.click(screen.getByTestId("delete-btn"));

    expect(onUserActionSpy).toHaveBeenCalledWith("delete");
  });

  it('should disable "move up" button if item is the first on the list', () => {
    rerender(
      <ListItem
        text="mockItem"
        isFirst={true}
        isLast={false}
        textOnEdit="mockUrl"
        onUserAction={() => {}}
      />
    );

    expect(screen.getByTestId("up-btn").hasAttribute("disabled")).toBe(true);
  });

  it('should disable "move down" button if item is the last on the list', () => {
    rerender(
      <ListItem
        text="mockItem"
        isFirst={false}
        isLast={true}
        textOnEdit="mockUrl"
        onUserAction={() => {}}
      />
    );

    expect(screen.getByTestId("down-btn").hasAttribute("disabled")).toBe(true);
  });
});
