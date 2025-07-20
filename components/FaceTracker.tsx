import React, { useEffect, useRef, useState } from 'react';
import { Results } from '@mediapipe/face_detection';
import { initializeFaceDetection } from '../lib/faceTracking';

interface FaceTrackerProps {
  videoRef: HTMLVideoElement | null;
}

const FaceTracker: React.FC<FaceTrackerProps> = ({ videoRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const [calibrating, setCalibrating] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [faces, setFaces] = useState<any[]>([]);

  // Calibration logic: checks if face is centered and at a good distance
  const getCalibrationFeedback = (detection: any, video: HTMLVideoElement) => {
    const { boundingBox } = detection;
    const centerX = boundingBox.xCenter * video.videoWidth;
    const centerY = boundingBox.yCenter * video.videoHeight;
    const width = boundingBox.width * video.videoWidth;
    const height = boundingBox.height * video.videoHeight;
    const margin = 0.15 * video.videoWidth;
    let msg = '';
    if (
      centerX < margin ||
      centerX > video.videoWidth - margin ||
      centerY < margin ||
      centerY > video.videoHeight - margin
    ) {
      msg = 'Move face to center';
    } else if (width < video.videoWidth * 0.15) {
      msg = 'Move closer';
    } else if (width > video.videoWidth * 0.6) {
      msg = 'Move farther';
    } else {
      msg = 'Face centered';
    }
    return msg;
  };

  const drawFaceMarker = (results: Results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || !videoRef) return;

    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let feedbackArr: string[] = [];
    let facesArr: any[] = [];
    if (results.detections) {
      results.detections.forEach((detection, idx) => {
        const { boundingBox } = detection;
        // Draw bounding box for each face
        ctx.strokeStyle = idx === 0 ? 'lime' : 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          boundingBox.xCenter * canvas.width - (boundingBox.width * canvas.width) / 2,
          boundingBox.yCenter * canvas.height - (boundingBox.height * canvas.height) / 2,
          boundingBox.width * canvas.width,
          boundingBox.height * canvas.height
        );
        if (calibrating) {
          feedbackArr.push(getCalibrationFeedback(detection, videoRef));
        }
        facesArr.push(boundingBox);
      });
    }
    setFeedback(feedbackArr);
    setFaces(facesArr);
  };

  useEffect(() => {
    if (videoRef) {
      const { faceDetection, camera } = initializeFaceDetection(videoRef, canvasRef.current, drawFaceMarker);
      return () => {
        faceDetection.close();
        camera.stop();
      };
    }
  }, [videoRef, calibrating]);

  // Render overlay canvas and feedback UI
  return (
    <>
      {/* Face count/status always visible above video feed */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center pointer-events-none">
        {faces.length === 0 ? (
          <div className="mt-2 px-4 py-1 rounded bg-red-600 bg-opacity-90 text-white text-base font-bold shadow animate-pulse">
            Warning: No face detected!
          </div>
        ) : (
          <div className="mt-2 px-4 py-1 rounded bg-black bg-opacity-70 text-white text-base font-semibold shadow">
            {faces.length === 1
              ? '1 face detected'
              : `${faces.length} faces detected`}
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
        <button
          onClick={() => setCalibrating((c) => !c)}
          className={`px-3 py-1 rounded text-xs font-semibold ${calibrating ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {calibrating ? 'Calibrating...' : 'Calibrate'}
        </button>
        {calibrating && feedback.map((msg, idx) => (
          <div key={idx} className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            Face {idx + 1}: {msg}
          </div>
        ))}
        {!calibrating && faces.length > 1 && (
          <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Multiple faces detected</div>
        )}
      </div>
    </>
  );
};

export default FaceTracker;