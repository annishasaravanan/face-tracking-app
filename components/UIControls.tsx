import React from 'react';

interface UIControlsProps {
  clearRecordings: () => void;
}

const UIControls: React.FC<UIControlsProps> = ({ clearRecordings }) => {
  return (
    <div className="mt-4">
      <button
        onClick={clearRecordings}
        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
      >
        Clear Recordings
      </button>
    </div>
  );
};

export default UIControls;