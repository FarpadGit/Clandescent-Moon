import {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { useActivePlaylistContext } from "./ActivePlaylistContext";
import { OnProgressProps } from "react-player/base";
import ReactPlayer from "react-player";

type videoStateType = {
  playing: boolean;
  muted: boolean;
  volume: number;
  playedFraction: number;
  seeking: boolean;
  buffer: boolean;
  visualizerOn: boolean;
};

type contextValueType = {
  videoPlayer: React.RefObject<ReactPlayer>;
  videoState: videoStateType;
  seekerFidelity: number;
  playPause: () => void;
  rewind: () => void;
  fastForward: () => void;
  seekStart: () => void;
  handleSeek: (value: number) => void;
  seekEnd: (value: number) => void;
  changeVolume: (value: number) => void;
  mute: () => void;
  handleProgress: (state: OnProgressProps) => void;
  handleBuffer: () => void;
  handleBufferEnd: () => void;
  formatTime: (time: number) => string;
  toggleVisualizer: () => void;
};

const videoPlayerContext = createContext({} as contextValueType);
export const useVideoPlayerContext = () => useContext(videoPlayerContext);

export default ({ children }: { children: ReactNode }) => {
  const { currentlyPlaying, playNext } = useActivePlaylistContext();

  const videoPlayer = useRef<ReactPlayer>(null);
  const [videoState, setVideoState] = useState<videoStateType>({
    playing: true,
    muted: false,
    volume: 0.75,
    playedFraction: 0,
    seeking: false,
    buffer: false,
    visualizerOn: true,
  });
  const seekerFidelity = 1000;

  useEffect(() => {
    resetVideoState();
    videoPlayer.current?.seekTo(0);
  }, [currentlyPlaying.url, currentlyPlaying.id]);

  function resetVideoState() {
    setVideoState((prev) => {
      return {
        ...prev,
        playing: true,
        playedFraction: 0,
        seeking: false,
        buffer: false,
      };
    });
  }

  function playPause() {
    setVideoState({ ...videoState, playing: !videoState.playing });
  }

  function rewind() {
    setVideoState({ ...videoState, playedFraction: 0 });
    videoPlayer.current?.seekTo(0);
  }

  function fastForward() {
    playNext();
  }

  function seekStart() {
    setVideoState({ ...videoState, seeking: true });
  }

  function handleSeek(value: number) {
    setVideoState({
      ...videoState,
      playedFraction: value / seekerFidelity,
    });
    videoPlayer.current?.seekTo(value / seekerFidelity);
  }

  function seekEnd(value: number) {
    setVideoState({ ...videoState, seeking: false });
    videoPlayer.current?.seekTo(value / seekerFidelity);
  }

  function changeVolume(value: number) {
    setVideoState({
      ...videoState,
      volume: value / 100,
      muted: value === 0,
    });
  }

  function mute() {
    setVideoState({ ...videoState, muted: !videoState.muted });
  }

  function handleProgress(state: OnProgressProps) {
    if (!videoState.seeking) {
      setVideoState({ ...videoState, playedFraction: state.played });
    }
  }

  function handleBuffer() {
    setVideoState({ ...videoState, buffer: true });
  }

  function handleBufferEnd() {
    setVideoState({ ...videoState, buffer: false });
  }

  function toggleVisualizer() {
    setVideoState({ ...videoState, visualizerOn: !videoState.visualizerOn });
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const date = new Date(time * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");
    if (hours) return `${hours}:${minutes.toString().padStart(2, "0")} `;
    else return `${minutes}:${seconds}`;
  };

  return (
    <videoPlayerContext.Provider
      value={{
        videoPlayer,
        videoState,
        seekerFidelity,
        playPause,
        rewind,
        fastForward,
        seekStart,
        handleSeek,
        seekEnd,
        changeVolume,
        mute,
        handleProgress,
        handleBuffer,
        handleBufferEnd,
        formatTime,
        toggleVisualizer,
      }}
    >
      {children}
    </videoPlayerContext.Provider>
  );
};
