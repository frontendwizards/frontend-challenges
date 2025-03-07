import { useRef, useState, useEffect } from "react";
import GameEngine from "../core/GameEngine";
import AssetLoader from "../services/asset/AssetLoader";
import GameplayScene from "../core/scenes/GameplayScene";
import GameOverScene from "../core/scenes/GameOverScene";
import SceneManager from "../core/SceneManager";
import { KaboomInterface } from "../types/KaboomTypes";
import GameConfig from "../config/GameConfig";

interface UseGameInitializationProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
  showHitboxes: boolean;
  showBorders: boolean;
  difficulty: "easy" | "medium" | "hard";
  debugLanes: boolean;
  isScreenTooSmall: boolean;
}

interface UseGameInitializationReturn {
  isLoading: boolean;
  loadingProgress: number;
  error: string | null;
  gameEngineRef: React.RefObject<GameEngine | null>;
  gameplaySceneRef: React.RefObject<GameplayScene | null>;
  isPaused: boolean;
  pauseGame: () => void;
  resumeGame: () => void;
}

/**
 * Custom hook to initialize the game, load assets, and manage game state
 */
export const useGameInitialization = ({
  canvasRef,
  width,
  height,
  showHitboxes,
  showBorders,
  difficulty,
  debugLanes,
  isScreenTooSmall,
}: UseGameInitializationProps): UseGameInitializationReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const gameEngineRef = useRef<GameEngine | null>(null);
  const gameplaySceneRef = useRef<GameplayScene | null>(null);

  // NOTE: The pause and resume functions are not used for now, but are kept for future use
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
    if (!canvasRef.current || isScreenTooSmall) return;

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
    setError(null);

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

    // Function to initialize the game
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
      } catch (err) {
        console.error("Game initialization error:", err);
        setError("Failed to initialize game. Please try again.");
      }
    };

    return () => {
      gameEngine.destroy();
    };
  }, [
    canvasRef,
    width,
    height,
    showHitboxes,
    showBorders,
    difficulty,
    debugLanes,
    isScreenTooSmall,
  ]);

  return {
    isLoading,
    loadingProgress,
    error,
    gameEngineRef,
    gameplaySceneRef,
    isPaused,
    pauseGame,
    resumeGame,
  };
};

export default useGameInitialization;
