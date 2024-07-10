import {
  useContext,
  createContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { ListItemType, LSRootKey, useAppContext } from "./AppContext";
import Papa from "papaparse";
import { nanoid } from "nanoid";

type contextValueType = {
  playlists: ListItemType[];
  selectedPlaylist: ListItemType & { index: number };
  loadedPlaylist: ListItemType & { index: number };
  getPlaylistSize: (id: string) => number;
  selectPlaylist: (id: string) => void;
  startPlaylist: (id: string) => void;
  clearPlaylists: () => void;
  addNewPlaylist: (name: string) => void;
  editPlaylist: (id: string, newName: string) => void;
  deletePlaylist: (id: string) => void;
  swapPlaylists: (index1: number, index2: number) => void;
};

const playlistsContext = createContext({} as contextValueType);
export const usePlaylistsContext = () => useContext(playlistsContext);

export default ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<ListItemType[]>([]);
  const [loadedPlaylistId, setLoadedPlaylistId] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");

  const isNewlyLoaded = useRef(true);

  const { setError } = useAppContext();

  useEffect(() => {
    const LSPlaylists = localStorage.getItem(LSRootKey);
    if (!LSPlaylists) return;
    try {
      const playlistArray = JSON.parse(LSPlaylists) as string[];
      const playlistsWithId = playlistArray.map((plName) => {
        return { id: nanoid(), text: plName };
      });
      setPlaylists(playlistsWithId);
    } catch (error) {
      setError();
    }
  }, []);

  useEffect(() => {
    if (!isNewlyLoaded.current) writePlaylistsToLocalStorage();
    isNewlyLoaded.current = false;
  }, [playlists]);

  function writePlaylistsToLocalStorage() {
    localStorage.setItem(
      LSRootKey,
      JSON.stringify(playlists.map((pl) => pl.text))
    );
  }

  function selectPlaylist(id: string) {
    setSelectedPlaylistId(id);
  }

  function startPlaylist(id: string) {
    setLoadedPlaylistId(id);
  }

  function clearPlaylists() {
    setPlaylists((_) => []);
  }

  function addNewPlaylist(name: string) {
    if (playlists.findIndex((pl) => pl.text === name) > -1) return;
    setPlaylists((prev) => [...prev, { id: nanoid(), text: name }]);
    localStorage.setItem(name, "");
  }

  function editPlaylist(id: string, newName: string) {
    const newPlaylists = playlists.map((pl) =>
      pl.id === id ? { id: pl.id, text: newName } : pl
    );
    const oldName = playlists.find((pl) => pl.id === id)?.text || "";
    const LSPlaylist = localStorage.getItem(oldName);
    if (LSPlaylist !== null) {
      localStorage.removeItem(oldName);
      localStorage.setItem(newName, LSPlaylist);
    }
    setPlaylists(newPlaylists);
  }

  function deletePlaylist(id: string) {
    const plName = playlists.find((pl) => pl.id === id)?.text;
    if (plName) localStorage.removeItem(plName);
    const newPlaylists = playlists.filter((pl) => pl.id !== id);
    setPlaylists(newPlaylists);
  }

  function swapPlaylists(index1: number, index2: number) {
    if (playlists.length === 0) return;
    let temp = [...playlists];
    [temp[index1], temp[index2]] = [temp[index2], temp[index1]];
    setPlaylists(temp);
  }

  function getText(id: string): string {
    return playlists.find((pl) => pl.id === id)?.text || "";
  }

  function getIndex(id: string): number {
    return playlists.findIndex((pl) => pl.id === id);
  }

  function getPlaylistSize(id: string): number {
    const plName = playlists.find((pl) => pl.id === id)?.text;
    if (!plName) return 0;
    const LSPlaylist = localStorage.getItem(plName);
    const CSVPlaylist = Papa.parse<string>(LSPlaylist!).data.flat();
    return CSVPlaylist.length;
  }

  const returnValue = {
    playlists,
    selectedPlaylist: {
      id: selectedPlaylistId,
      index: getIndex(selectedPlaylistId),
      text: getText(selectedPlaylistId),
    },
    loadedPlaylist: {
      id: loadedPlaylistId,
      index: getIndex(loadedPlaylistId),
      text: getText(loadedPlaylistId),
    },
    getPlaylistSize,
    selectPlaylist,
    startPlaylist,
    clearPlaylists,
    addNewPlaylist,
    editPlaylist,
    deletePlaylist,
    swapPlaylists,
  };

  return (
    <playlistsContext.Provider value={returnValue}>
      {children}
    </playlistsContext.Provider>
  );
};
