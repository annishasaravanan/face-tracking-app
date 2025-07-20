import React, { useState, useRef } from 'react';
import CameraView from '../components/CameraView';
import FaceTracker from '../components/FaceTracker';
import VideoRecorder from '../components/VideoRecorder';
import UIControls from '../components/UIControls';

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const clearRecordings = () => {
    localStorage.removeItem('recordedVideos');
    window.location.reload();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Face Tracking Video Recorder</h1>
      <CameraView setStream={setStream} />
      {videoRef.current && <FaceTracker videoRef={videoRef.current} />}
      <VideoRecorder stream={stream} />
      <UIControls clearRecordings={clearRecordings} />
    </main>
  );
}