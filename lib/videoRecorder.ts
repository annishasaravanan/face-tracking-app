export const startVideoRecording = (
  stream: MediaStream,
  onDataAvailable: (e: BlobEvent) => void,
  onStop: () => void
) => {
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  mediaRecorder.ondataavailable = onDataAvailable;
  mediaRecorder.onstop = onStop;
  mediaRecorder.start(100); // Record in 100ms chunks
  return mediaRecorder;
};

export const stopVideoRecording = (mediaRecorder: MediaRecorder) => {
  mediaRecorder.stop();
};