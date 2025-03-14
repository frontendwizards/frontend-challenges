import React, { useRef } from "react";
import GameConfig from "./config/GameConfig";

// Import new component files
import WarningScreen from "./screens/WarningScreen";
import LoadingScreen from "./screens/LoadingScreen";
import ErrorScreen from "./screens/ErrorScreen";
import GameCanvas from "./canvas/GameCanvas";

// Import custom hooks
import { useScreenSizeCheck, useGameInitialization } from "./hooks";

interface EndlessRunnerProps {
  width?: number;
  height?: number;
  showHitboxes?: boolean;
  difficulty?: "easy" | "medium" | "hard";
  debugLanes?: boolean;
}

const EndlessRunner: React.FC<EndlessRunnerProps> = ({
  width = GameConfig.CANVAS_WIDTH,
  height = GameConfig.CANVAS_HEIGHT,
  showHitboxes = false,
  difficulty = "medium",
  debugLanes = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use our custom hooks
  const isScreenTooSmall = useScreenSizeCheck(GameConfig.CANVAS_WIDTH);

  const { isLoading, loadingProgress, error } = useGameInitialization({
    canvasRef,
    width,
    height,
    showHitboxes,
    difficulty,
    debugLanes,
    isScreenTooSmall,
  });

  // Handle retry when error occurs
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="relative w-full h-full flex justify-center items-center game-container">
      {isScreenTooSmall ? (
        <WarningScreen minWidth={GameConfig.CANVAS_WIDTH} />
      ) : (
        <div className="bg-gray-900 rounded-lg backdrop-blur-sm bg-opacity-80">
          {isLoading && (
            <LoadingScreen
              progress={loadingProgress}
              width={width}
              height={height}
            />
          )}

          {error && (
            <ErrorScreen
              errorMessage={error}
              width={width}
              height={height}
              onRetry={handleRetry}
            />
          )}

          <GameCanvas ref={canvasRef} width={width} height={height} />
        </div>
      )}
    </div>
  );
};

export default EndlessRunner;
