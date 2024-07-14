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

/* const fingerIndeces = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
}; */

import clsx from "clsx";
function App() {
  const [detector, setDetector] = React.useState<HandLandmarker | null>(null);
  const [shouldDetect, setShouldDetect] = React.useState<boolean>(false);
  const activeContainer = React.useRef<number>(0);

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
    location.hash = "";
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

              const { landmarks } = results;
              if (landmarks[0]) {
                const ringTip = landmarks[0][8];
                if (ringTip) {
                  console.log(ringTip.x);
                  if (ringTip.y < 0.5) {
                    if (activeContainer.current !== 0) {
                      location.hash = `#container-${
                        activeContainer.current - 1
                      }`;
                      activeContainer.current += -1;
                    }
                  }
                  if (ringTip.y > 0.5) {
                    // Down
                    if (activeContainer.current !== colorOptions.length) {
                      location.hash = `#container-${
                        activeContainer.current + 1
                      }`;
                      activeContainer.current += 1;
                    }
                  }
                }
              }
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

    // TODO: Set the location back on scroll or handle scrolling in a different way
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
            disabled={!detector}
            className="px-4 py-2 bg-slate-100 border-[1px] w-[150px] text-center rounded-md text-slate-900 border-transparent ml-auto disabled:bg-slate-100/20"
          >
            {!detector
              ? "initialing..."
              : shouldDetect
              ? "Detecting..."
              : "Start Detector"}
          </button>
          <button
            disabled={!shouldDetect}
            onClick={handleStopStream}
            className="px-4 py-2 border-[1px] border-slate-100 rounded-md text-slate-50 disabled:opacity-30"
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
      <div id="containers">
        {Array.from({ length: colorOptions.length }).map((_, i) => (
          <div
            id={`container-${i + 1}`}
            className={clsx(
              colorOptions[i],
              "min-h-screen w-screen grid place-items-center flex-grow"
            )}
          >
            <div>
              <h3>
                {i == 0 && !shouldDetect
                  ? "Press Start Detector and Point your index finger up and down to scroll containers"
                  : `Container ${i + 1}`}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
