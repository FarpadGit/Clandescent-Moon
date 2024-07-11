import { useState } from "react";
import { useActivePlaylistContext } from "../../contexts/ActivePlaylistContext";
import { useVideoPlayerContext } from "../../contexts/VideoPlayerContext";
import useMediaQuery from "../../hooks/useMediaQuery";
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
  const [volumeTouched, setVolumeTouched] = useState(false);

  const currentTime = videoPlayer.current?.getCurrentTime() ?? 0;
  const duration = videoPlayer.current?.getDuration() ?? 0;

  const formatedCurrentTime = formatTime(currentTime);
  const formatedDuration = formatTime(duration);

  const screenWidth = useMediaQuery();

  return (
    <div className={`control-container ${!videoState.playing ? "paused" : ""}`}>
      {/* Top Container (Video Title)*/}
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
      {/* Middle Container (Play Button) */}
      <div className="mid-container" onClick={() => playPause()}>
        <div className="icon-btn glow">
          {!videoState.playing && <PiPlay fontSize="xxx-large" />}
        </div>
      </div>
      {/* Bottom Container */}
      <div className="bottom-container">
        <div className="px-3">
          <div className="time-display glow">
            <span>{formatedCurrentTime}</span>
            <span>{formatedDuration}</span>
          </div>
          <Visualizer />
          <SeekBar duration={duration} />
        </div>
        {/* Control Buttons */}
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
              {/* Rewind Button */}
              <div className="icon-btn" onClick={() => rewind()}>
                <PiRewindBold />
              </div>
              {/* Play Button */}
              <div className="icon-btn" onClick={() => playPause()}>
                {videoState.playing ? <PiPauseBold /> : <PiPlayBold />}
              </div>
              {/* Fast Forward Button */}
              <div className="icon-btn" onClick={() => fastForward()}>
                <PiFastForwardBold />
              </div>
              {/* Volume Button */}
              <div
                className="icon-btn volume-btn"
                onClick={() => screenWidth.LG && mute()}
                onTouchStart={() =>
                  volumeTouched ? mute() : setVolumeTouched(true)
                }
              >
                {videoState.muted || videoState.volume === 0 ? (
                  <FiVolumeX />
                ) : videoState.volume < 0.5 ? (
                  <FiVolume1 />
                ) : (
                  <FiVolume2 />
                )}
              </div>
            </div>
            {/* Volume Slider */}
            <ReactSlider
              min={0}
              max={100}
              className={`volume-slider ${volumeTouched ? "touched" : ""}`}
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
  const { videoState, toggleVisualizer, toggleLoop } = useVideoPlayerContext();
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
            <span>{videoState.visualizerOn && "✓"}</span>{" "}
            <span>Visualizer</span>
          </li>
          <li onClick={() => toggleLoop()}>
            <span>{videoState.onLoop && "✓"}</span> <span>Loop</span>
          </li>
        </ul>
      )}
    </>
  );
}
