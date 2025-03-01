import React, { useEffect, useRef, useState } from "react";
import { KaboomInterface } from "./types/KaboomTypes";
import GameEngine from "./core/GameEngine";
import AssetLoader from "./core/AssetLoader";
import SceneManager, {
  GameOverScene,
  GameplayScene,
} from "./core/SceneManager";
import GameConfig from "./config/GameConfig";

interface EndlessRunnerProps {
  width?: number;
  height?: number;
  showHitboxes?: boolean;
  showBorders?: boolean;
  difficulty?: "easy" | "medium" | "hard";
  debugLanes?: boolean;
  backgroundColor?: string;
}

const EndlessRunner: React.FC<EndlessRunnerProps> = ({
  width = GameConfig.CANVAS_WIDTH,
  height = GameConfig.CANVAS_HEIGHT,
  showHitboxes = false,
  showBorders = false,
  difficulty = "medium",
  debugLanes = true,
  backgroundColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine
    const gameEngine = new GameEngine({
      canvas: canvasRef.current,
      width,
      height,
      debug: showHitboxes || showBorders,
      background: GameConfig.CANVAS_BACKGROUND_COLOR,
    });

    const k = gameEngine.getKaboomInstance();

    // Initialize scene manager
    const sceneManager = new SceneManager(k);

    // Initialize asset loader
    const assetLoader = new AssetLoader(k);

    // Start loading assets
    setIsLoading(true);
    assetLoader.loadAssets({
      onProgress: (progress) => {
        console.log(`Loading progress: ${progress}%`);
        setLoadingProgress(progress);
      },
      onComplete: () => {
        console.log("Asset loading complete, initializing game...");
        initializeGame(k, sceneManager, assetLoader.isSpritesLoaded());
        setIsLoading(false);
      },
      onError: (err) => {
        console.error("Asset loading error:", err);
        setError("Failed to load game assets. Please try again.");
        setIsLoading(false);
      },
    });

    // Initialize game scenes and start the game
    const initializeGame = (
      kaboomInstance: KaboomInterface,
      sceneManager: SceneManager,
      spritesLoaded: boolean
    ) => {
      try {
        // Register all game scenes
        const gameplayScene = new GameplayScene(
          kaboomInstance,
          spritesLoaded, // Only use sprites if both loaded and enabled
          {
            showHitboxes,
            showBorders,
            difficulty,
            // debugLanes,
          }
        );
        gameplayScene.register(sceneManager);

        const gameOverScene = new GameOverScene(kaboomInstance);
        gameOverScene.register(sceneManager);

        // Start with the gameplay scene
        sceneManager.startScene("game");
      } catch (err) {
        console.error("Game initialization error:", err);
        setError("Failed to initialize game. Please try again.");
      }
    };

    // Cleanup function
    return () => {
      gameEngine.destroy();
    };
  }, [width, height, showHitboxes, showBorders, difficulty, debugLanes]);

  useEffect(() => {
    if (backgroundColor) {
      document.documentElement.style.setProperty("--bg-color", backgroundColor);
    } else {
      document.documentElement.style.setProperty("--bg-color", "#1f2937");
    }
  }, [backgroundColor]);

  return (
    <div className="relative w-full h-full flex justify-center items-center game-container">
      {isLoading && (
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
          <h2 className="text-2xl mb-4">Loading Game...</h2>
          <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="mt-2">{Math.round(loadingProgress)}%</p>
        </div>
      )}

      {error && (
        <div
          className="absolute flex flex-col justify-center items-center bg-red-900 bg-opacity-80 z-10 text-white"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <h2 className="text-2xl mb-4">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`border-2 border-gray-800`}
      />
    </div>
  );
};

export default EndlessRunner;
