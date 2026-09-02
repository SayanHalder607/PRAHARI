import React from 'react';
import { Camera } from 'lucide-react';

const FacialScan: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Camera className="w-16 h-16 text-gray-600 mb-4" />
      <p className="text-gray-400">Facial scanning requires camera access and MediaPipe.</p>
      <p className="text-xs text-gray-600 mt-2">This feature is available in the Docker deployment.</p>
    </div>
  );
};

export default FacialScan;
