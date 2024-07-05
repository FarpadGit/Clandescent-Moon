import { useState } from "react";
import { useActivePlaylistContext } from "../../contexts/ActivePlaylistContext";
import { useVideoPlayerContext } from "../../contexts/VideoPlayerContext";
import Visualizer from "./Visualizer";
import { SeekBar } from "./SeekBar";
import {
  PiPlay,
  PiPlayBold,
  PiPauseBold,
  PiFastForwardBold,
  PiRewindBold,
  PiGearBold,
} from "react-icons/pi";
import { FiVolumeX, FiVolume1, FiVolume2 } from "react-icons/fi";
import ReactSlider from "react-slider";

export default function Controls() {
  const {
    videoPlayer,
    videoState,
    rewind,
    playPause,
    fastForward,
    changeVolume,
    mute,
    formatTime,
  } = useVideoPlayerContext();
  const { currentlyPlaying } = useActivePlaylistContext();
  const currentTime = videoPlayer.current?.getCurrentTime() ?? 0;
  const duration = videoPlayer.current?.getDuration() ?? 0;

  const formatedCurrentTime = formatTime(currentTime);
  const formatedDuration = formatTime(duration);

  return (
    <div className={`control-container ${!videoState.playing ? "paused" : ""}`}>
      <div className="top-container">
        <a
          className="text-truncate pb-1 fs-2 text-white text-decoration-none"
          style={{ lineHeight: "unset" }}
          href={currentlyPlaying.url}
          target="_blank"
          rel="noreferrer"
        >
          {currentlyPlaying.text}
        </a>
      </div>
      <div className="mid-container" onClick={() => playPause()}>
        <div className="icon-btn glow">
          {!videoState.playing && <PiPlay fontSize="xxx-large" />}
        </div>
      </div>
      <div className="bottom-container">
        <div className="px-3">
          <div className="time-display glow">
            <span>{formatedCurrentTime}</span>
            <span>{formatedDuration}</span>
          </div>
          <Visualizer />
          <SeekBar duration={duration} />
        </div>
        <div
          className="control-box"
          style={
            {
              "--volume": videoState.muted
                ? "0%"
                : videoState.volume * 100 + "%",
            } as React.CSSProperties
          }
        >
          <div className="d-flex align-items-center">
            <div className="inner-controls">
              <div className="volume-screen" />
              <div className="icon-btn" onClick={() => rewind()}>
                <PiRewindBold />
              </div>
              <div className="icon-btn" onClick={() => playPause()}>
                {videoState.playing ? <PiPauseBold /> : <PiPlayBold />}
              </div>
              <div className="icon-btn" onClick={() => fastForward()}>
                <PiFastForwardBold />
              </div>
              <div className="icon-btn volume-btn" onClick={() => mute()}>
                {videoState.muted || videoState.volume === 0 ? (
                  <FiVolumeX />
                ) : videoState.volume < 0.5 ? (
                  <FiVolume1 />
                ) : (
                  <FiVolume2 />
                )}
              </div>
            </div>
            <ReactSlider
              min={0}
              max={100}
              className="volume-slider"
              onChange={(value: number) => changeVolume(value)}
              value={videoState.muted ? 0 : videoState.volume * 100}
            />
          </div>
          <Settings />
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { videoState, toggleVisualizer } = useVideoPlayerContext();
  return (
    <>
      <div
        className="icon-btn"
        onClick={() => setSettingsOpen((prev) => !prev)}
      >
        <PiGearBold />
      </div>
      {settingsOpen && (
        <ul className="options-menu">
          <li onClick={() => toggleVisualizer()}>
            {videoState.visualizerOn && "✓"} Visualizer
          </li>
        </ul>
      )}
    </>
  );
}
