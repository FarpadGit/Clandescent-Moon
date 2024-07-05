import { useState, useRef } from "react";
import { useVideoPlayerContext } from "../../contexts/VideoPlayerContext";
import ReactSlider from "react-slider";

export function SeekBar({ duration }: { duration: number }) {
  const {
    videoState,
    seekerFidelity: fidelity,
    seekStart,
    handleSeek,
    seekEnd,
  } = useVideoPlayerContext();

  const [hover, setHover] = useState(false);
  const [tooltipState, setTooltipState] = useState({ X: 0, Y: 0, value: 0 });
  const seekerRef = useRef<HTMLDivElement>(null);

  function handleHover(mouseX: number) {
    if (!seekerRef.current) return;
    // the radius (not diameter) of the thumb in pixels. Its size effects where exactly will the user click on the slider
    const thumbSize = 10;
    // get the relative X position of the cursor on the slider
    const position = mouseX - seekerRef.current.getBoundingClientRect().left;
    // get the width of the slider
    const width = seekerRef.current.getBoundingClientRect().width;
    // correct the slider's width by reducing it by 10px on both sides (the size of the thumb renders these regions deadzones)
    const correctedWidth = width - 2 * thumbSize;
    // correct the position by narrowing it down to the corrected slider width and if it falls outside of that then clamp it
    let correctedPosition = position - thumbSize;
    if (position < thumbSize) correctedPosition = 0;
    if (position > width - thumbSize) correctedPosition = correctedWidth;
    //estimate the slider's value (between 0 and [fidelity]) based on the corrected position and width
    const sliderValue = Math.round(
      (fidelity * correctedPosition) / correctedWidth
    );
    //project the estimated value to a time value between 0 and [duration] seconds
    const time = (duration * sliderValue) / fidelity;

    setHover(true);
    setTooltipState({
      X: mouseX,
      Y: seekerRef.current.getBoundingClientRect().top,
      value: time,
    });
  }

  return (
    <div
      className="seeker-container"
      onMouseMove={(e) => handleHover(e.clientX)}
      onMouseLeave={() => setHover(false)}
      ref={seekerRef}
    >
      {hover && <SeekerTooltip state={tooltipState} />}
      <ReactSlider
        className="seeker"
        thumbClassName="thumb"
        trackClassName="track"
        min={0}
        max={fidelity}
        value={videoState.playedFraction * fidelity}
        onBeforeChange={() => seekStart()}
        onAfterChange={(value: number) => seekEnd(value)}
        onSliderClick={(value: number) => handleSeek(value)}
      />
    </div>
  );
}

type ToolTipProps = {
  state: { X: number; Y: number; value: number };
};
function SeekerTooltip({ state }: ToolTipProps) {
  const { formatTime } = useVideoPlayerContext();
  const { X, Y, value: time } = state;
  return (
    <div
      className="seeker-tooltip"
      style={{ "--x": X + "px", "--y": Y + "px" } as React.CSSProperties}
    >
      {formatTime(time)}
    </div>
  );
}
