import { useActivePlaylistContext } from "../../contexts/ActivePlaylistContext";
import { useVideoPlayerContext } from "../../contexts/VideoPlayerContext";
import Controls from "./Controls";
import ReactPlayer from "react-player";

export default function VideoPlayer() {
  const { activePlaylist, currentlyPlaying, playNext } =
    useActivePlaylistContext();
  const {
    videoPlayer,
    videoState,
    handleProgress,
    handleBuffer,
    handleBufferEnd,
  } = useVideoPlayerContext();

  return (
    <div className="Midnight-Player-container">
      {currentlyPlaying.id === "" && (
        <div className="w-100 h-100">
          <img
            className="w-100 h-100 object-fit-cover"
            src={"/banner.png"}
            style={{ borderRadius: "20px" }}
          />
        </div>
      )}
      {currentlyPlaying.id !== "" && (
        <div className="Midnight-Player">
          <ReactPlayer
            ref={videoPlayer}
            className="player-container"
            url={currentlyPlaying.url}
            loop={videoState.onLoop || activePlaylist?.videos.length === 1}
            playing={videoState.playing}
            volume={videoState.volume}
            muted={videoState.muted}
            controls={false}
            onProgress={(state) => handleProgress(state)}
            onBuffer={() => handleBuffer()}
            onBufferEnd={() => handleBufferEnd()}
            onEnded={() => playNext()}
          ></ReactPlayer>
          <Controls />
        </div>
      )}
    </div>
  );
}
