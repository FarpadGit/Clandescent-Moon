import { ReactNode, createContext, useContext } from "react";
import { LSRootKey, useAppContext } from "../contexts/AppContext";
import { usePlaylistsContext } from "../contexts/PlaylistsContext";
import { useActivePlaylistContext } from "../contexts/ActivePlaylistContext";
import { useVideoPlayerContext } from "../contexts/VideoPlayerContext";
import Papa from "papaparse";
import FileSaver from "file-saver";

export type userActions =
  | "select"
  | "add"
  | "edit"
  | "delete"
  | "move-up"
  | "move-down"
  | "play";

type ListType = "playlist" | "video";

type contextValueType = {
  handleUserActions: (
    listType: ListType,
    id: string,
    action: userActions,
    payload?: string
  ) => void;
  exportActiveToFile: () => void;
  exportAllToFile: () => void;
  importFromFile: (fileText: string) => void;
  setPlaylistToLocalStorage: (plName: string) => void;
};

const userActionsContext = createContext({} as contextValueType);
export const useUserActionsContext = () => useContext(userActionsContext);

export default ({ children }: { children: ReactNode }) => {
  const { LSError, clearError, changeToTab, isAutocorrectOn } = useAppContext();
  const {
    selectedPlaylist,
    loadedPlaylist,
    selectPlaylist,
    startPlaylist,
    clearPlaylists,
    addNewPlaylist,
    editPlaylist,
    deletePlaylist,
    swapPlaylists,
  } = usePlaylistsContext();
  const {
    activePlaylist,
    selectedVideo,
    currentlyPlaying,
    selectVideo,
    loadPlaylist,
    unloadPlaylist,
    playVideo,
    playFirstVideo,
    addNewVideo,
    editVideo,
    deleteVideo,
    swapVideos,
  } = useActivePlaylistContext();
  const { videoState, playPause } = useVideoPlayerContext();

  function handleUserActions(
    listType: ListType,
    id: string,
    action: userActions,
    payload?: string
  ) {
    if (listType === "playlist")
      handleUserActionsForPlaylist(id, action, payload);
    if (listType === "video") handleUserActionsForVideo(id, action, payload);
  }

  function handleUserActionsForPlaylist(
    id: string,
    action: userActions,
    payload?: string
  ) {
    switch (action) {
      case "select":
        {
          selectPlaylist(id);
        }
        break;
      case "play":
        {
          loadPlaylist(selectedPlaylist.text);
          startPlaylist(id);
          changeToTab(1);
        }
        break;
      case "move-up":
        {
          const index = selectedPlaylist.index;
          swapPlaylists(index, index - 1);
        }
        break;
      case "move-down":
        {
          const index = selectedPlaylist.index;
          swapPlaylists(index, index + 1);
        }
        break;
      case "add":
        {
          if (LSError) {
            clearPlaylists();
            clearError();
          }
          if (payload) addNewPlaylist(payload);
        }
        break;
      case "edit":
        {
          if (payload) editPlaylist(id, payload);
        }
        break;
      case "delete":
        {
          deletePlaylist(id);
          selectPlaylist("");
          if (id === loadedPlaylist.id) {
            unloadPlaylist();
            startPlaylist("");
          }
        }
        break;
      default:
        return;
    }
  }

  function handleUserActionsForVideo(
    id: string,
    action: userActions,
    payload?: string
  ) {
    switch (action) {
      case "select":
        {
          selectVideo(id);
        }
        break;
      case "play":
        {
          playVideo(id);
          if (!videoState.playing) {
            playPause();
          }
        }
        break;
      case "move-up":
        {
          const index = selectedVideo.index;
          swapVideos(index, index - 1);
        }
        break;
      case "move-down":
        {
          const index = selectedVideo.index;
          swapVideos(index, index + 1);
        }
        break;
      case "add":
        {
          if (!payload) return;
          handleNewURL(payload);
        }
        break;
      case "edit":
        {
          if (payload) editVideo(id, payload);
        }
        break;
      case "delete":
        {
          deleteVideo(id);
          selectVideo("");
          if (id === currentlyPlaying.id) playFirstVideo();
        }
        break;
      default:
        return;
    }
  }

  async function handleNewURL(url: string) {
    // if url is a Youtube playlist
    if (url.includes("youtube.com") && url.includes("list=")) {
      try {
        const playlistId = new URL(url).searchParams.get("list");
        let pageTokenParam = "";
        const APIKeyParam = `&key=${import.meta.env["VITE_YOUTUBE_API_KEY"]}`;

        // YT playlists are paginated (max 50 items per page is the limit) and must be fetched in chucks. the next page token is returned in the results
        do {
          const YTResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}${pageTokenParam}${APIKeyParam}`
          ).then((res) => res.json());

          const urls: string[] = YTResponse.items.map(
            (item: any) => item.snippet.resourceId.videoId
          );
          pageTokenParam = YTResponse.nextPageToken
            ? "&pageToken=" + YTResponse.nextPageToken
            : "";
          urls.forEach((url) =>
            addNewVideo("https://www.youtube.com/watch?v=" + url)
          );
        } while (pageTokenParam !== "");
      } catch (error) {
        // remove the "list" search parameter from the URL and add it to the list.
        // if this results in an unplayable item then it will tell the user something went wrong.
        const _url = new URL(url);
        _url.searchParams.delete("list");
        addNewVideo(_url.toString());
      }
      // if not a Youtube playlist
    } else {
      let _url = url;
      if (isAutocorrectOn && !url.includes(".youtube.com/"))
        _url = "https://www.youtube.com/watch?v=" + url;
      addNewVideo(_url);
    }
  }

  function exportActiveToFile() {
    if (!activePlaylist) return;
    // read active playlist from Local Storage, get stored URLs. Papaparse will return them as arrays
    const LSPlaylist = localStorage.getItem(activePlaylist.name) || "";
    const urls = Papa.parse(LSPlaylist).data as string[][];
    // insert name of playlist before the first item
    urls.unshift([activePlaylist.name]);

    // convert list back to a semicolon delimited CSV text
    const CSVPlaylist = Papa.unparse(urls, { delimiter: ";" });

    // save and download text file as {playlist_name}.csv
    FileSaver.saveAs(
      new Blob([CSVPlaylist], {
        type: "text/plain;charset=utf-8",
      }),
      `${activePlaylist.name}.csv`
    );
  }

  function exportAllToFile() {
    // reads index of playlists from Local Storage
    const LSPlaylists = localStorage.getItem(LSRootKey);
    if (!LSPlaylists) return;
    const playlistNames = JSON.parse(LSPlaylists || "") as string[];

    // for every playlist read it's contents from LS and convert the URLs to {playlist_name: url} object format
    const listOfPlaylistsWithHeaders = playlistNames.map((plName) => {
      const LSPlaylist = localStorage.getItem(plName) || "";
      const urls = Papa.parse(LSPlaylist).data.flat() as string[];
      const urlObjects = urls.map((url) => {
        return { [plName]: url };
      });

      return urlObjects;
    });

    // merge every non-first playlist item into the first playlist, so they will look something like this:
    // {playlist1: song1-1, playlist2: song2-1, playlist3: song3-1}
    // {playlist1: song1-2, playlist2: song2-2, playlist3: song3-2}
    // this will mimic the vertical nature of CSV files where one column is one playlist and a row may contain multiple records.
    listOfPlaylistsWithHeaders.forEach((pl, i) => {
      if (i === 0) return;
      pl.forEach((entry, j) => {
        listOfPlaylistsWithHeaders[0][j] = {
          ...listOfPlaylistsWithHeaders[0][j],
          ...entry,
        };
      });
    });

    // convert the newly constructed first list back to a semicolon delimited CSV text
    const CSVPlaylists = Papa.unparse(listOfPlaylistsWithHeaders[0], {
      delimiter: ";",
    });

    // save and download text file as My Playlists.csv
    FileSaver.saveAs(
      new Blob([CSVPlaylists], {
        type: "text/plain;charset=utf-8",
      }),
      "My Clandescent Moon Playlists.csv"
    );
  }

  function importFromFile(fileText: string) {
    // helper types for the Papaparse parse results with headers (T) and the reduced playlist object where results are grouped by playlist name (P)
    type T = { [key: string]: string };
    type P = { [key: string]: T[] };

    // Papaparse is not very good at guessing delimiters, like at all, so we have to guess them manually: if there's a semicolon somewhere, that's the delimiter
    const delimiter = fileText.includes(";") ? ";" : ",";
    const playlistObject = Papa.parse<T>(fileText, {
      delimiter: delimiter,
      header: true,
    });
    // header names are stored under meta when first row is interpreted as headers
    const playlistNames = playlistObject.meta.fields || [];

    // convert vertically structured CSV data into horizontal ones. First create an object where the keys are playlist names and the values are empty arrays...
    const playlists = playlistNames.reduce((prev, pl) => {
      return { ...prev, [pl]: [] as T[] };
    }, {} as P);

    // ...then go through each key in each row of the CSV data and push that value into the appropriate array that belongs to that playlist.
    // By the end we'll have multiple lists of {playlist_name: url} objects grouped under their playlist name. Empty values are also filtered out.
    playlistObject.data.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (row[key]) playlists[key].push({ [key]: row[key] });
      });
    });

    // for every playlist add them to the playlist index and write their content to Local Storage
    Object.keys(playlists).forEach((plName) => {
      const LSPlaylist = Papa.unparse(playlists[plName], {
        header: false,
        skipEmptyLines: "greedy",
      });
      addNewPlaylist(plName);
      localStorage.setItem(plName, LSPlaylist);
    });
  }

  async function setPlaylistToLocalStorage(plName: string) {
    const fileText = await fetch(`/presets/${plName}.csv`).then((res) =>
      res.text()
    );
    importFromFile(fileText);
  }

  return (
    <userActionsContext.Provider
      value={{
        handleUserActions,
        exportActiveToFile,
        exportAllToFile,
        importFromFile,
        setPlaylistToLocalStorage,
      }}
    >
      {children}
    </userActionsContext.Provider>
  );
};
