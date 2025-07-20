import { RecordedVideo } from '../types';

export const saveVideoToLocalStorage = (blob: Blob): RecordedVideo => {
  const id = Date.now().toString();
  const url = URL.createObjectURL(blob);
  const video: RecordedVideo = { id, url, timestamp: new Date().toISOString() };
  const videos = JSON.parse(localStorage.getItem('recordedVideos') || '[]');
  videos.push(video);
  localStorage.setItem('recordedVideos', JSON.stringify(videos));
  return video;
};

export const getRecordedVideos = (): RecordedVideo[] => {
  return JSON.parse(localStorage.getItem('recordedVideos') || '[]');
};