import { useEffect, useRef, useState } from "react";
import { useVideoPlayerContext } from "../../contexts/VideoPlayerContext";
import { useActivePlaylistContext } from "../../contexts/ActivePlaylistContext";

// The dancing vertical bars above the seek bar. As you probably guessed they are randomized and aren't actually in sync with the audio.
// As far as I know embedded videos cannot be visualized using the Web Audio API, only proper audio files like mp4 and Youtube is not about to let you have those
export default function Visualizer() {
  const { videoState } = useVideoPlayerContext();
  const { currentlyPlaying } = useActivePlaylistContext();
  const heightsFunction = useRef<(prev: number) => number>(() => 10);
  const intervalHandle = useRef<number>(0);
  const [heights, setHeights] = useState<number[]>(
    Array.from({ length: 75 }, () => 10)
  );

  useEffect(() => {
    if (videoState.playing && !intervalHandle.current)
      intervalHandle.current = window.setInterval(() => {
        if (videoState.playing)
          setHeights((prev) =>
            prev.map((height) => heightsFunction.current(height))
          );
      }, 200);
    if (!videoState.playing) {
      window.clearInterval(intervalHandle.current);
      intervalHandle.current = 0;
    }
  }, [videoState.playing]);

  useEffect(() => {
    setHeights(Array.from({ length: 75 }, () => 0));
  }, [currentlyPlaying.url]);

  useEffect(() => {
    heightsFunction.current = (prev: number) => {
      if (videoState.buffer) return 10;
      if (videoState.volume === 0 || videoState.muted) return 10;
      if (Math.random() > 0.66) return prev;
      const h = 10 + Math.random() * (videoState.volume * 90);
      if (Math.random() < 0.05) return h * 1.2;
      else return h;
    };
  }, [videoState.volume, videoState.muted, videoState.buffer]);

  if (!videoState.visualizerOn) return null;

  return (
    <div className="position-relative">
      <div className="visualizer">
        {heights.map((height, index) => (
          <div
            key={"bar" + index}
            className="bar"
            style={{ height: height + "px" }}
          ></div>
        ))}
      </div>
    </div>
  );
}
