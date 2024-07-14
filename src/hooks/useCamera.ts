import * as React from "react";

type CameraParams = {
  targetFPS: number;
  size: { width: number; height: number };
};

export const useCamera = (
  videoRef: React.RefObject<HTMLVideoElement>,
  cameraOptions: CameraParams
) => {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isReady, setIsReady] = React.useState<boolean>(false);

  const startStream = React.useCallback(async () => {
    const cameraObject = videoRef.current;

    if (!cameraObject) {
      console.log("No video element found");
      return null;
    }

    const {
      targetFPS,
      size: { width = 360, height = 270 },
    } = cameraOptions;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width,
        height,
        frameRate: {
          ideal: targetFPS,
        },
      },
    });

    cameraObject.srcObject = stream;
    setStream(stream);

    cameraObject.onloadedmetadata = () => {
      cameraObject.play();
      setIsReady(true);
    };
  }, [cameraOptions, videoRef]);

  const stopStream = () => {
    console.log("Stopping stream");
    stream?.getTracks().forEach((track) => track.stop());
    videoRef.current?.pause();
    setStream(null);
    setIsReady(false);
  };

  return { stream, stopStream, startStream, isReady };
};
