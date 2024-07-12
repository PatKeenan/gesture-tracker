import * as React from "react";
import * as tf from "@tensorflow/tfjs";
import * as handDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as mpHands from "@mediapipe/hands";
import { useCamera } from "./hooks.ts/useCamera";

function App() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const spinnerRef = React.useRef<HTMLDivElement>(null);
  const handData = React.useRef({
    left: false,
    right: false,
  }).current;

  const leftHandRef = React.useRef<HTMLParagraphElement>(null);
  const rightHandRef = React.useRef<HTMLParagraphElement>(null);

  const { camera } = useCamera(videoRef);

  React.useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const init = async () => {
      const video = videoRef.current!;
      let spinVal = 0;
      let zVal = 0;
      let isForward = false;
      await tf.ready().then(async () => {
        const model = await handDetection.createDetector(
          handDetection.SupportedModels.MediaPipeHands,
          {
            runtime: "mediapipe",
            modelType: "lite",
            solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}`,
          }
        );
        requestAnimationFrame(async function loop() {
          const predictions = await model.estimateHands(video);

          let leftHand = false;
          let rightHand = false;

          predictions.forEach((prediction) => {
            if (prediction.handedness === "Left") {
              rightHand = true;
            }
            if (prediction.handedness === "Right") {
              leftHand = true;
            }
          });

          if (leftHand) {
            leftHandRef.current!.innerText = "Left Hand: ✅";
          } else {
            leftHandRef.current!.innerText = "Left Hand: ❌";
          }

          if (rightHand) {
            rightHandRef.current!.innerText = "Right Hand: ✅";
          } else {
            rightHandRef.current!.innerText = "Right Hand: ❌";
          }

          if (leftHand && !rightHand) {
            spinVal -= 20;
          }

          if (rightHand && !leftHand) {
            spinVal += 20;
          }

          if (rightHand && leftHand) {
            if (isForward) {
              zVal += 10;
            } else {
              zVal -= 10;
            }

            if (zVal >= 100) {
              isForward = false;
            }

            if (zVal <= 0) {
              isForward = true;
            }
          }

          if (spinnerRef.current) {
            spinnerRef.current.style.rotate = `${spinVal}deg`;
            spinnerRef.current.style.transform = `translateZ(${zVal}px)`;
          }

          handData.left = leftHand;
          handData.right = rightHand;
          /* setHandData({ left: leftHand, right: rightHand }); */

          setTimeout(() => {
            requestAnimationFrame(loop);
          }, 1000 / 60);
        });
      });
    };
    init();
  }, [handData, videoRef]);

  return (
    <div
      className={`
        h-screen w-screen
        ${
          handData.left && !handData.right
            ? "bg-blue-500"
            : handData.right && !handData.left
            ? "bg-green-500"
            : handData.right && handData.left
            ? "bg-gradient-to-b from-pink-500 to-purple-500"
            : "bg-white"
        }
          transition-colors ease-in-out duration-150
          `}
    >
      <div className="flex space-x-4 mt-10 justify-center">
        <p ref={leftHandRef}>Left Hand: ❌</p>
        <br />
        <p ref={rightHandRef}>Right Hand: ❌</p>
      </div>
      <div>
        <video
          autoPlay
          loop
          muted
          ref={videoRef}
          className="transform -scale-x-100 invisible"
        />
      </div>
      <div
        className={"h-20 w-20 bg-black mx-auto rounded"}
        ref={spinnerRef}
      ></div>
    </div>
  );
}

export default App;
