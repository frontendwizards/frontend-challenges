import React from "react";

interface LoadingScreenProps {
  progress: number;
  width: number;
  height: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  width,
  height,
}) => {
  return (
    <div
      className="absolute flex flex-col justify-center items-center bg-gray-900 bg-opacity-80 z-10 text-white"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Title with cool game font style */}
      <h2 className="text-3xl font-bold mb-6 text-blue-300 tracking-wider">
        LOADING GAME
      </h2>

      {/* Animated loading message */}
      <div className="mb-6 text-lg text-gray-300">
        Preparing your adventure
        <span className="animate-pulse">...</span>
      </div>

      {/* Stylish progress bar */}
      <div className="w-64 h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage indicator */}
      <p className="mt-4 text-xl font-mono text-blue-200">
        {Math.round(progress)}%
      </p>

      {/* Loading tips */}
      <div className="mt-8 max-w-xs text-center text-sm text-gray-400 italic">
        <p>
          Tip: Collect coins to increase your score and unlock special items!
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
