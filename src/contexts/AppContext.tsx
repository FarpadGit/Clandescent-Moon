import { useContext, createContext, useState, ReactNode } from "react";
import PlaylistsContext from "./PlaylistsContext";
import ActivePlaylistContext from "./ActivePlaylistContext";
import UserActionsContext from "./UserActionsContext";
import VideoPlayerContext from "./VideoPlayerContext";

export const LSRootKey = "Clandescent Moon playlists";

export type ListItemType = { id: string; text: string; url?: string };

export const playModes = ["linear", "shuffle", "random"] as const;
export type PlayMode = (typeof playModes)[number];

type contextValueType = {
  LSError: boolean;
  setError: () => void;
  clearError: () => void;
  selectedTabIndex: number;
  changeToTab: (index: number) => void;
  isAutosaveOn: boolean;
  toggleAutosave: () => void;
  isAutocorrectOn: boolean;
  toggleAutocorrect: () => void;
  playMode: PlayMode;
  setPlayMode: (newMode: PlayMode) => void;
};

const appContext = createContext({} as contextValueType);
export const useAppContext = () => useContext(appContext);

export default ({ children }: { children: ReactNode }) => {
  const [LSError, setLSError] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [autosave, setAutosave] = useState(true);
  const [autocorrect, setAutocorrect] = useState(true);
  const [playMode, setPlayMode] = useState<PlayMode>("linear");

  function changeToTab(index: number) {
    setSelectedTabIndex(index);
  }

  function toggleAutosave() {
    setAutosave((prev) => !prev);
  }

  function toggleAutocorrect() {
    setAutocorrect((prev) => !prev);
  }

  return (
    <appContext.Provider
      value={{
        LSError,
        setError: () => setLSError(true),
        clearError: () => setLSError(false),
        selectedTabIndex,
        changeToTab,
        isAutosaveOn: autosave,
        toggleAutosave,
        isAutocorrectOn: autocorrect,
        toggleAutocorrect,
        playMode,
        setPlayMode: (newMode: PlayMode) => setPlayMode(newMode),
      }}
    >
      <ActivePlaylistContext>
        <PlaylistsContext>
          <ActivePlaylistContext>
            <VideoPlayerContext>
              <UserActionsContext>{children}</UserActionsContext>
            </VideoPlayerContext>
          </ActivePlaylistContext>
        </PlaylistsContext>
      </ActivePlaylistContext>
    </appContext.Provider>
  );
};
