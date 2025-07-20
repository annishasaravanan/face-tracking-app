import React, { useState, useRef, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { startVideoRecording, stopVideoRecording } from '../lib/videoRecorder';
import { saveVideoToLocalStorage, getRecordedVideos } from '../lib/storage';
import { RecordedVideo } from '../types';

interface VideoRecorderProps {
  stream: MediaStream | null;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ stream }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState<RecordedVideo[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [filename, setFilename] = useState('');
  const [pendingStart, setPendingStart] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Utility to check if device is mobile
  const isMobile = () => typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

  // Gesture handlers for swipe
  useGesture(
    {
      onDragEnd: ({ swipe: [swipeX] }) => {
        if (!isMobile()) return;
        if (swipeX === 1 && !isRecording && !pendingStart) {
          // Swipe right to start recording
          handleCountdownStart();
        } else if (swipeX === -1 && isRecording) {
          // Swipe left to stop recording
          handleStopRecording();
        }
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
      drag: { axis: 'x', filterTaps: true, swipe: { velocity: 0.3, distance: 30 } },
    }
  );

  // Countdown logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      setPendingStart(false);
      handleStartRecording();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCountdownStart = () => {
    setPendingStart(true);
    setCountdown(3); // 3-second countdown
  };

  const handleStartRecording = () => {
    if (stream) {
      chunksRef.current = [];
      mediaRecorderRef.current = startVideoRecording(
        stream,
        (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        },
        async () => {
          let blob = new Blob(chunksRef.current, { type: 'video/webm' });
          // Placeholder for compression logic (could use ffmpeg.wasm or similar)
          // blob = await compressVideo(blob);
          const video = saveVideoToLocalStorage(blob);
          setRecordedVideos((prev) => [...prev, video]);
          setIsRecording(false);
        }
      );
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      stopVideoRecording(mediaRecorderRef.current);
    }
  };

  useEffect(() => {
    setRecordedVideos(getRecordedVideos());
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-[80vh] w-full px-2 py-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl max-w-2xl mx-auto touch-pan-x"
    >
      <div className="w-full max-w-lg bg-white/90 rounded-xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
        <h1 className="text-2xl font-bold text-blue-700 mb-2 tracking-tight">Video Recorder</h1>
        <form
          className="flex flex-col items-center gap-3 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isRecording && !pendingStart) handleCountdownStart();
          }}
        >
          <input
            type="text"
            placeholder="Filename (optional)"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 w-56 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            disabled={isRecording || pendingStart}
          />
          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              disabled={isRecording || pendingStart}
              className={`px-5 py-2 rounded-lg font-semibold shadow transition-all duration-150 ${
                isRecording || pendingStart
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
              }`}
            >
              Start Recording
            </button>
            <button
              type="button"
              onClick={handleStopRecording}
              disabled={!isRecording}
              className={`px-5 py-2 rounded-lg font-semibold shadow transition-all duration-150 ${
                !isRecording
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
              }`}
            >
              Stop Recording
            </button>
          </div>
        </form>
        {countdown !== null && (
          <div className="text-4xl font-extrabold text-blue-600 animate-pulse mt-4 mb-2 drop-shadow">
            {countdown === 0 ? 'Go!' : countdown}
          </div>
        )}
        {isMobile() && (
          <div className="mt-2 text-xs text-blue-500 bg-blue-100 rounded px-2 py-1 font-medium">
            Swipe right to start, left to stop recording
          </div>
        )}
        <hr className="w-full border-t border-blue-200 my-6" />
        <div className="w-full">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Recorded Videos</h2>
          <ul className="space-y-4">
            {recordedVideos.map((video) => (
              <li key={video.id} className="flex flex-col md:flex-row gap-3 items-center bg-blue-50 rounded-lg p-3 shadow">
                <video src={video.url} controls className="w-64 rounded-lg border border-blue-200 shadow" />
                <a
                  href={video.url}
                  download={`${video.filename || `recording-${video.id}`}.webm`}
                  className="text-blue-600 hover:underline font-medium text-sm mt-2 md:mt-0"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;