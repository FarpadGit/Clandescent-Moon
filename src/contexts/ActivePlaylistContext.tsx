import {
  useContext,
  createContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { ListItemType, useAppContext } from "./AppContext";
import Papa from "papaparse";
import { nanoid } from "nanoid";

type Playlist = {
  name: string;
  videos: ListItemType[];
};

type contextValueType = {
  activePlaylist: Playlist | null;
  selectedVideo: ListItemType & { index: number };
  currentlyPlaying: ListItemType & { index: number };
  loadPlaylist: (playlistName: string) => void;
  unloadPlaylist: () => void;
  addNewVideo: (url: string) => void;
  selectVideo: (id: string) => void;
  playVideo: (id: string) => void;
  playFirstVideo: () => void;
  playNext: () => void;
  editVideo: (id: string, newUrl: string) => void;
  deleteVideo: (id: string) => void;
  swapVideos: (index1: number, index2: number) => void;
};

const activePlaylistContext = createContext({} as contextValueType);
export const useActivePlaylistContext = () => useContext(activePlaylistContext);

export default ({ children }: { children: ReactNode }) => {
  const { isAutosaveOn, playMode } = useAppContext();
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<string[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState("");

  const isNewlyLoaded = useRef(true);

  useEffect(() => {
    if (!activePlaylist) return;
    if (isNewlyLoaded.current) playFirstVideo();
    else {
      if (isAutosaveOn) writePlaylistToLocalStorage();
      if (activePlaylist?.videos.length === 0) setCurrentlyPlayingId("");
    }
    isNewlyLoaded.current = false;
  }, [activePlaylist]);

  function writePlaylistToLocalStorage() {
    if (!activePlaylist) return;
    const newCSVPlaylist = Papa.unparse(
      activePlaylist.videos.map((item) => {
        return { someThrowawayHeader: item.url };
      }),
      { header: false }
    );
    localStorage.setItem(activePlaylist.name, newCSVPlaylist);
  }

  async function getVideoTitle(url: string): Promise<string> {
    try {
      const title = await fetch(
        `http://noembed.com/embed?url=${encodeURIComponent(url)}`
      )
        .then((res) => res.json())
        .then((res) => res.title);
      if (!title) throw new Error();
      return title;
    } catch (error) {
      return "videos.unknownTitle";
    }
  }

  async function loadPlaylist(playlistName: string) {
    isNewlyLoaded.current = true;
    const LSPlaylist = localStorage.getItem(playlistName);
    if (!LSPlaylist) {
      setActivePlaylist({ name: playlistName, videos: [] });
      return;
    }

    const CSVPlaylist = Papa.parse<string>(LSPlaylist).data.flat();

    const videos = await Promise.all(
      CSVPlaylist.map(async (vid) => {
        const title: string = await getVideoTitle(vid);
        return { id: nanoid(), text: title, url: vid };
      })
    );
    setActivePlaylist({ name: playlistName, videos: videos });
    setShuffledPlaylist([]);
  }

  async function unloadPlaylist() {
    setActivePlaylist(null);
    setCurrentlyPlayingId("");
  }

  async function addNewVideo(url: string) {
    const title = await getVideoTitle(url);
    setActivePlaylist((prev) => {
      return {
        name: prev!.name,
        videos: [...prev!.videos, { id: nanoid(), url: url, text: title }],
      };
    });
  }

  function selectVideo(id: string) {
    setSelectedVideoId(id);
  }

  function playVideo(id: string) {
    setCurrentlyPlayingId(id);
  }

  function playFirstVideo() {
    if (!activePlaylist || activePlaylist.videos.length === 0)
      setCurrentlyPlayingId("");
    else setCurrentlyPlayingId(activePlaylist.videos[0].id);
  }

  function playNext() {
    if (!activePlaylist) return;
    if (playMode === "linear") {
      const currentIndex = getIndex(currentlyPlayingId);
      if (currentIndex === activePlaylist.videos.length - 1) playFirstVideo();
      else playVideo(activePlaylist.videos[currentIndex + 1].id);
    } else if (playMode === "shuffle") playNextInShuffle();
    else if (playMode === "random") {
      let randomIndex = -1;
      do {
        randomIndex = Math.floor(
          Math.random() * (activePlaylist.videos.length - 1)
        );
      } while (randomIndex === getIndex(currentlyPlayingId));
      playVideo(activePlaylist.videos[randomIndex].id);
    }
  }

  function playNextInShuffle() {
    //if active playlist hasn't been shuffled yet or the current video is at the end of the shuffle list
    if (
      shuffledPlaylist.length === 0 ||
      shuffledPlaylist[shuffledPlaylist.length - 1] === currentlyPlayingId
    ) {
      //then create a shuffled list using the Durstenfeld shuffle algorithm
      const shuffledPL = shufflePlaylist();
      setShuffledPlaylist(shuffledPL);
      //play the first video on the shuffle list if it's not already playing, otherwise play the second (if there is a second)
      if (shuffledPL[0] !== currentlyPlayingId || shuffledPL.length === 1)
        playVideo(shuffledPL[0]);
      else playVideo(shuffledPL[1]);
    } else {
      //if playlist is already shuffled then proceed to play the next in line
      const index = shuffledPlaylist.findIndex(
        (id) => id === currentlyPlayingId
      );
      playVideo(shuffledPlaylist[index + 1]);
    }
  }

  async function editVideo(id: string, newUrl: string) {
    const title = await getVideoTitle(newUrl);
    const newVideos = activePlaylist!.videos.map((vid) =>
      vid.id === id ? { id: vid.id, url: newUrl, text: title } : vid
    );
    setActivePlaylist((prev) => {
      return { name: prev!.name, videos: newVideos };
    });
  }

  function deleteVideo(id: string) {
    const newVideos = activePlaylist!.videos.filter((vid) => vid.id !== id);
    setActivePlaylist((prev) => {
      return { name: prev!.name, videos: newVideos };
    });
  }

  function swapVideos(index1: number, index2: number) {
    if (!activePlaylist) return;
    let videos = activePlaylist.videos;
    [videos[index1], videos[index2]] = [videos[index2], videos[index1]];

    setActivePlaylist((prev) => {
      return { name: prev!.name, videos: videos };
    });
  }

  //this is the Durstenfeld shuffle algorithm which returns a randomly shuffled copy of the active playlist in O(n) time
  function shufflePlaylist() {
    if (!activePlaylist) return [];
    const shuffledPlaylistIds = [...activePlaylist.videos.map((vid) => vid.id)];
    for (let i = shuffledPlaylistIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPlaylistIds[i], shuffledPlaylistIds[j]] = [
        shuffledPlaylistIds[j],
        shuffledPlaylistIds[i],
      ];
    }
    if (
      shuffledPlaylistIds[shuffledPlaylistIds.length - 1] === currentlyPlayingId
    )
      [
        shuffledPlaylistIds[shuffledPlaylistIds.length - 1],
        shuffledPlaylistIds[0],
      ] = [
        shuffledPlaylistIds[0],
        shuffledPlaylistIds[shuffledPlaylistIds.length - 1],
      ];

    return shuffledPlaylistIds;
  }

  function getUrl(id: string): string {
    return activePlaylist?.videos.find((vid) => vid.id === id)?.url || "";
  }

  function getText(id: string): string {
    return activePlaylist?.videos.find((vid) => vid.id === id)?.text || "";
  }

  function getIndex(id: string): number {
    return activePlaylist
      ? activePlaylist.videos.findIndex((vid) => vid.id === id)
      : -1;
  }

  const returnValue = {
    activePlaylist,
    selectedVideo: {
      id: selectedVideoId,
      index: getIndex(selectedVideoId),
      url: getUrl(selectedVideoId),
      text: getText(selectedVideoId),
    },
    currentlyPlaying: {
      id: currentlyPlayingId,
      index: getIndex(currentlyPlayingId),
      url: getUrl(currentlyPlayingId),
      text: getText(currentlyPlayingId),
    },
    loadPlaylist,
    unloadPlaylist,
    addNewVideo,
    selectVideo,
    playVideo,
    playFirstVideo,
    playNext,
    editVideo,
    deleteVideo,
    swapVideos,
  };

  return (
    <activePlaylistContext.Provider value={returnValue}>
      {children}
    </activePlaylistContext.Provider>
  );
};
