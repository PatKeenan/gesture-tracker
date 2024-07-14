import * as React from "react";
import { useCamera } from "./hooks/useCamera";
import { HandLandmarker } from "@mediapipe/tasks-vision";
import { initDetector } from "./utils/initDetector";

const colorOptions = [
  "bg-slate-900",
  "bg-red-500/70",
  "bg-yellow-500/70",
  "bg-green-500/70",
  "bg-blue-500/70",
  "bg-indigo-500/70",
  "bg-purple-500/70",
  "bg-pink-500/70",
  "bg-slate-900",
];

const handLookup = [];

import clsx from "clsx";
function App() {
  const [detector, setDetector] = React.useState<HandLandmarker | null>(null);
  const [shouldDetect, setShouldDetect] = React.useState<boolean>(false);
  const activeContainer = React.useRef<number>(0).current;

  const videoRef = React.useRef<HTMLVideoElement>(null);

  const { startStream, stopStream, isReady } = useCamera(videoRef, {
    targetFPS: 60,
    size: { width: 360, height: 270 },
  });

  const handleStartStream = React.useCallback(async () => {
    await startStream().then(() => setShouldDetect(true));
  }, [startStream]);

  const handleStopStream = () => {
    setShouldDetect(false);
    stopStream();
  };

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    let lastVideoTime = -1;
    const run = () => {
      // Create the detector loop
      const loop = () => {
        if (isReady && shouldDetect) {
          const startTimeMs = performance.now();
          if (lastVideoTime !== videoRef.current?.currentTime) {
            lastVideoTime = videoRef.current?.currentTime || 0;
            if (videoRef.current && detector) {
              const results = detector?.detectForVideo(
                videoRef.current,
                startTimeMs
              );

              console.log(results);
            }
          }

          // set the framerate to 30fps
          timeout = setTimeout(() => {
            requestAnimationFrame(loop);
          }, 1000 / 30);
        }
      };
      // Run the detector loop
      loop();
    };
    if (shouldDetect) {
      run();
    }
    return () => {
      clearTimeout(timeout);
      lastVideoTime = -1;
    };
  }, [isReady, shouldDetect, detector, videoRef]);

  React.useEffect(() => {
    const init = async () => {
      const d = await initDetector();
      setDetector(d);
    };
    init();
  }, []);

  ////////////////////////////
  return (
    <div className="h-screen relative flex flex-col">
      <div className="fixed inset-0 top-0 p-4 w-full flex h-20 items-center">
        <h1 className="text-xl text-slate-50 flex-shrink-0">
          Gesture Navigation
        </h1>
        <div className="flex space-x-4 w-full justify-end">
          <button
            onClick={handleStartStream}
            className="px-4 py-2 bg-slate-100 border-[1px] rounded-md text-slate-900 border-transparent ml-auto"
          >
            Start Detector
          </button>
          <button
            onClick={handleStopStream}
            className="px-4 py-2 border-[1px] border-slate-100 rounded-md text-slate-50"
          >
            Stop Detector
          </button>
        </div>
        <video
          ref={videoRef}
          className="absolute inset-0 object-cover invisible"
          playsInline
          autoPlay
          muted
        />
      </div>

      {Array.from({ length: colorOptions.length }).map((_, i) => (
        <div
          id={`container-${i}`}
          className={clsx(
            colorOptions[i],
            "min-h-screen w-screen grid place-items-center flex-grow"
          )}
        >
          <h3>Container {i + 1}</h3>
        </div>
      ))}
    </div>
  );
}

export default App;
