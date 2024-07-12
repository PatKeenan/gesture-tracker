import * as React from "react";

type CameraParams = {
  targetFPS: number;
  size: { width: number; height: number };
};

class Camera {
  private video: HTMLVideoElement | null = null;

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement;
  }

  static async setupCamera(
    videoElement: HTMLVideoElement,
    cameraParams: CameraParams
  ) {
    const {
      targetFPS,
      size: { width = 360, height = 270 },
    } = cameraParams;

    // TODO: Add support for mobile devices
    const videoConfig: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: "user",
        width,
        height,
        frameRate: {
          ideal: targetFPS,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
    const camera = new Camera(videoElement);

    if (!camera.video) {
      throw new Error("Camera video element is not defined");
    }

    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      resolve(camera.video);
    });

    return camera.video;
  }
}

export const useCamera = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [camera, setCamera] = React.useState<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    async function setupCamera() {
      const c = await Camera.setupCamera(videoRef.current!, {
        targetFPS: 60,
        size: { width: 360, height: 270 },
      });

      setCamera(c);
    }
    setupCamera();
  }, [videoRef]);

  return { camera };
};
