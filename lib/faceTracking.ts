import { FaceDetection, Results } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';

export const initializeFaceDetection = (
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement,
  onResults: (results: Results) => void
) => {
  const faceDetection = new FaceDetection({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`,
  });

  faceDetection.setOptions({
    minDetectionConfidence: 0.5,
  });

  faceDetection.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await faceDetection.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  camera.start();

  return { faceDetection, camera };
};