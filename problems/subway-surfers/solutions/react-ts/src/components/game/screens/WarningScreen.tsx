import React, { useEffect, useState } from "react";
import GameConfig from "../config/GameConfig";

interface WarningScreenProps {
  minWidth: number;
}

const WarningScreen: React.FC<WarningScreenProps> = ({
  minWidth = GameConfig.CANVAS_WIDTH,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-full h-full overflow-hidden">
      {/* Content container with animation */}
      <div
        className={`relative z-10 bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-white/20 text-white max-w-md mx-auto transition-all duration-700 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Warning icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 text-white"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Title with animation */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-amber-100">
          Screen Size Warning
        </h2>

        {/* Message */}
        <p className="text-center text-lg mb-6 text-white/90 leading-relaxed">
          Your screen is too small for the optimal game experience.
          <br />
          Please use a larger screen or resize your browser window.
        </p>

        {/* Minimum width indicator */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-200 font-medium">Minimum width:</span>
            <span className="bg-amber-700 px-3 py-1 rounded-full text-white font-bold">
              {minWidth}px
            </span>
          </div>
        </div>

        {/* Pulsing indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75"></span>
            <span className="text-sm text-amber-200">
              Waiting for resize...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningScreen;
