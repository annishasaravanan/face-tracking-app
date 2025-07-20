import React, { useRef, useEffect, useState } from 'react';
import { useGesture } from '@use-gesture/react';

interface CameraViewProps {
  setStream: (stream: MediaStream | null) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ setStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const minScale = 1;
  const maxScale = 3;

  // Utility to check if device is mobile
  const isMobile = () => typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

  // Pinch-to-zoom gesture
  useGesture(
    {
      onPinch: ({ offset: [d] }) => {
        if (!isMobile()) return;
        let newScale = 1 + d / 200;
        newScale = Math.max(minScale, Math.min(maxScale, newScale));
        setScale(newScale);
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
      pinch: { scaleBounds: { min: minScale, max: maxScale }, rubberband: true },
    }
  );

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStream(stream);
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };
    getCameraStream();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setStream]);

  return (
    <div ref={containerRef} className="relative touch-none">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-2xl rounded-lg"
        style={isMobile() ? { transform: `scale(${scale})`, transition: 'transform 0.1s' } : {}}
      />
      <canvas id="canvas" className="absolute top-0 left-0 w-full max-w-2xl" />
      {isMobile() && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-black bg-opacity-40 text-white px-2 py-1 rounded">Pinch to zoom</div>
      )}
    </div>
  );
};

export default CameraView;