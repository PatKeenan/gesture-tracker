import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export async function initDetector() {
  let handMarker: HandLandmarker | null = null;

  const createDetector = async () => {
    if (handMarker) {
      return handMarker;
    }
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    handMarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    });

    return handMarker;
  };
  return await createDetector();
}
