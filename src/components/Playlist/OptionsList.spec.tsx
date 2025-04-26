import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";

import OptionsList from "./OptionsList";
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

describe("OptionsList", () => {
  let rootElement: HTMLElement;
  let optionElements: HTMLElement[];

  const componentToTest = <OptionsList />;

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
    mockUserActionsObject.importFromCloud.mockResolvedValue(true);
    mockUserActionsObject.exportActiveToCloud.mockResolvedValue(
      "mockDownloadID"
    );
    mockUserActionsObject.exportAllToCloud.mockResolvedValue("mockDownloadID");

    ({ container: rootElement } = render(componentToTest, {
      wrapper: AllWrapper,
    }));

    optionElements = Array.from(
      rootElement.querySelectorAll<HTMLElement>(".options-settings")
    );
  });

  it("should render all the options", () => {
    expect(optionElements.length).toBe(7);
    expect(within(optionElements[0]).getByText(/autosaving/i)).toBeTruthy();
    expect(within(optionElements[0]).getByRole("button").textContent).toBe(
      "ON"
    );
    expect(within(optionElements[1]).getByText(/playback/i)).toBeTruthy();
    expect(within(optionElements[1]).getByRole("button").textContent).toMatch(
      /linear/i
    );
    expect(within(optionElements[2]).getByText(/autocorrect/i)).toBeTruthy();
    expect(within(optionElements[2]).getByRole("button").textContent).toBe(
      "ON"
    );
    expect(within(optionElements[3]).getAllByText(/storage/i)[0]).toBeTruthy();
    expect(within(optionElements[3]).getByRole("button").textContent).toBe(
      "ON"
    );
    expect(within(optionElements[4]).getByRole("button").textContent).toMatch(
      /import/i
    );
    expect(
      optionElements[4].querySelector<HTMLInputElement>("input[type='file']")
    ).toBeTruthy();
    expect(within(optionElements[4]).getByRole("textbox")).toBeTruthy();
    expect(within(optionElements[5]).getAllByRole("button").length).toBe(2);
    expect(within(optionElements[6]).getByText(/preset/i)).toBeTruthy();
    expect(within(optionElements[6]).getAllByRole("button").length).toBe(2);
  });

  it("should toggle Autosave if button in first option is clicked", () => {
    fireEvent.click(within(optionElements[0]).getByRole("button"));

    expect(mockAppObject.toggleAutosave).toHaveBeenCalled();
  });

  it("should set play mode to 'shuffle' if dropdown in second option is set to 'Shuffle Mode'", () => {
    fireEvent.click(within(optionElements[1]).getByRole("button"));
    const shuffleOption = within(optionElements[1])
      .getAllByRole("button")
      .find((b) => b.textContent?.match(/shuffle/i)) as HTMLElement;
    fireEvent.click(shuffleOption);

    expect(mockAppObject.setPlayMode).toHaveBeenCalledWith("shuffle");
  });

  it("should toggle Youtube Autocorrect if button in third option is clicked", () => {
    fireEvent.click(within(optionElements[2]).getByRole("button"));

    expect(mockAppObject.toggleAutocorrect).toHaveBeenCalled();
  });

  it("should toggle local/external file upload if button in forth option is clicked", () => {
    fireEvent.click(within(optionElements[3]).getByRole("button"));

    expect(mockAppObject.toggleFileUpload).toHaveBeenCalled();
  });

  describe("import/export to external file storage", () => {
    it("should import playlist from external storage if button in fifth option is clicked", () => {
      fireEvent.click(within(optionElements[4]).getByRole("button"));

      expect(mockUserActionsObject.importFromCloud).toHaveBeenCalled();
    });

    it("should export all playlists to external storage if first button in sixth option is clicked", async () => {
      await waitFor(() => {
        fireEvent.click(within(optionElements[5]).getAllByRole("button")[0]);
      });

      expect(mockUserActionsObject.exportAllToCloud).toHaveBeenCalled();
      expect(
        within(optionElements[5]).getByText(/mockDownloadID/)
      ).toBeTruthy();
    });

    it("should export active playlist to external storage if second button in sixth option is clicked", async () => {
      await waitFor(() => {
        fireEvent.click(within(optionElements[5]).getAllByRole("button")[1]);
      });

      expect(mockUserActionsObject.exportActiveToCloud).toHaveBeenCalled();
      expect(
        within(optionElements[5]).getByText(/mockDownloadID/)
      ).toBeTruthy();
    });
  });

  describe("import/export to local file", () => {
    let mockTextFile: { text: () => Promise<string>; name: string };
    let optionElements: HTMLElement[];

    beforeEach(() => {
      mockedUseApp.mockReturnValue({ ...mockAppObject, isFileUploadOn: false });
      mockTextFile = {
        text: () => Promise.resolve("fakeText"),
        name: "file.csv",
      };
      cleanup();
      const { container } = render(componentToTest);
      optionElements = Array.from(
        container.querySelectorAll<HTMLElement>(".options-settings")
      );
    });

    it("should import playlist from local file if file uploader in fifth option uploads a file", async () => {
      const fileUploader = optionElements[4].querySelector(
        "input[type='file']"
      ) as HTMLInputElement;

      await waitFor(() =>
        fireEvent.change(fileUploader, { target: { files: [mockTextFile] } })
      );

      expect(mockUserActionsObject.importFromFile).toHaveBeenCalledWith(
        "fakeText"
      );
    });

    it("should export all playlists to file if first button in sixth option is clicked", () => {
      fireEvent.click(within(optionElements[5]).getAllByRole("button")[0]);

      expect(mockUserActionsObject.exportAllToFile).toHaveBeenCalled();
    });

    it("should export active playlist to file if second button in sixth option is clicked", () => {
      fireEvent.click(within(optionElements[5]).getAllByRole("button")[1]);

      expect(mockUserActionsObject.exportActiveToFile).toHaveBeenCalled();
    });
  });

  it("should load preset playlist if any of the buttons in seventh option is clicked", () => {
    const buttons = within(optionElements[6]).getAllByRole("button");

    buttons.forEach((button) => {
      mockUserActionsObject.setPlaylistToLocalStorage.mockClear();
      fireEvent.click(button);

      expect(
        mockUserActionsObject.setPlaylistToLocalStorage
      ).toHaveBeenCalled();
    });
  });
});
