import { useEffect, useRef, useState } from "react";
import { KaboomInterface } from "./types/KaboomTypes";
import GameEngine from "./core/GameEngine";
import AssetLoader from "./services/asset/AssetLoader";
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
}

const EndlessRunner = ({
  width = GameConfig.CANVAS_WIDTH,
  height = GameConfig.CANVAS_HEIGHT,
  showHitboxes = false,
  showBorders = false,
  difficulty = "medium",
  debugLanes = false,
}: EndlessRunnerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const gameplaySceneRef = useRef<GameplayScene | null>(null);

  // Function to pause the game
  const pauseGame = () => {
    if (gameplaySceneRef.current && !isPaused) {
      gameplaySceneRef.current.pause();
      setIsPaused(true);
    }
  };

  // Function to resume the game
  const resumeGame = () => {
    if (gameplaySceneRef.current && isPaused) {
      gameplaySceneRef.current.resume();
      setIsPaused(false);
    }
  };

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

    // Store the game engine in ref for pause/resume functionality
    gameEngineRef.current = gameEngine;

    const k = gameEngine.getKaboomInstance();

    // Initialize scene manager
    const sceneManager = new SceneManager(k);

    // Initialize asset loader
    const assetLoader = new AssetLoader(k);

    // Start loading assets
    setIsLoading(true);
    assetLoader.loadAssets({
      onProgress: (progress) => {
        setLoadingProgress(progress);
      },
      onComplete: () => {
        console.log("Asset loading complete, initializing game...");
        initializeGame(k, sceneManager);
        setIsLoading(false);
      },
      onError: (err) => {
        console.error("Asset loading error:", err);
        setError("Failed to load game assets. Please try again.");
        setIsLoading(false);
      },
    });

    // Function to check if screen is too small for the game
    const checkScreenSize = () => {
      const isSmall = window.innerWidth < GameConfig.CANVAS_WIDTH;

      if (isSmall !== isScreenTooSmall) {
        setIsScreenTooSmall(isSmall);

        // Pause/resume game based on screen size
        if (isSmall && gameplaySceneRef.current) {
          pauseGame();
        } else if (!isSmall && isPaused && gameplaySceneRef.current) {
          resumeGame();
        }
      }
    };

    // Initialize game scenes and start the game
    const initializeGame = (
      kaboomInstance: KaboomInterface,
      sceneManager: SceneManager
    ) => {
      try {
        // Register all game scenes
        const gameplayScene = new GameplayScene(kaboomInstance, {
          showHitboxes,
          showBorders,
          difficulty,
          debugLanes,
        });
        gameplayScene.register(sceneManager);
        gameplaySceneRef.current = gameplayScene;

        const gameOverScene = new GameOverScene(kaboomInstance);
        gameOverScene.register(sceneManager);

        // Start with the gameplay scene
        sceneManager.startScene("game");

        // Run initial screen size check after game has started
        setTimeout(() => {
          checkScreenSize();
        }, 100);
      } catch (err) {
        console.error("Game initialization error:", err);
        setError("Failed to initialize game. Please try again.");
      }
    };

    // Add resize event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", checkScreenSize);
      gameEngine.destroy();
    };
  }, [width, height, showHitboxes, showBorders, difficulty, debugLanes]);

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

      {isScreenTooSmall && !isLoading && !error && (
        <div
          className="absolute flex flex-col justify-center items-center bg-amber-800 z-10 text-white"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <h2 className="text-2xl mb-4">Screen Size Warning</h2>
          <p className="text-center px-4">
            Your screen is too small for the optimal game experience.
            <br />
            The game has been paused.
            <br />
            Please use a larger screen or resize your browser window.
          </p>
          <p className="mt-4 text-sm">
            Minimum width: {GameConfig.CANVAS_WIDTH}px
          </p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`border-4 border-gray-800 `}
      />
    </div>
  );
};

export default EndlessRunner;
