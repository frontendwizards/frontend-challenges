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
  difficulty: "easy" | "medium" | "hard";
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

const initializeGameEngine = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  showHitboxes: boolean
): GameEngine => {
  return new GameEngine({
    canvas,
    width,
    height,
    debug: showHitboxes,
    background: GameConfig.CANVAS_BACKGROUND_COLOR,
  });
};

const initializeScenes = (
  kaboomInstance: KaboomInterface,
  sceneManager: SceneManager,
  showHitboxes: boolean,
  difficulty: "easy" | "medium" | "hard"
): GameplayScene => {
  const gameplayScene = new GameplayScene(kaboomInstance, {
    showHitboxes,
    difficulty,
  });
  gameplayScene.register(sceneManager);

  const gameOverScene = new GameOverScene(kaboomInstance);
  gameOverScene.register(sceneManager);

  sceneManager.startScene("game");
  return gameplayScene;
};

export const useGameInitialization = ({
  canvasRef,
  width,
  height,
  showHitboxes,
  difficulty,
  isScreenTooSmall,
}: UseGameInitializationProps): UseGameInitializationReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const gameEngineRef = useRef<GameEngine | null>(null);
  const gameplaySceneRef = useRef<GameplayScene | null>(null);

  const pauseGame = () => {
    if (gameplaySceneRef.current && !isPaused) {
      gameplaySceneRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeGame = () => {
    if (gameplaySceneRef.current && isPaused) {
      gameplaySceneRef.current.resume();
      setIsPaused(false);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || isScreenTooSmall) return;

    const gameEngine = initializeGameEngine(
      canvasRef.current,
      width,
      height,
      showHitboxes
    );
    gameEngineRef.current = gameEngine;

    const k = gameEngine.getKaboomInstance();
    const sceneManager = new SceneManager(k);
    const assetLoader = new AssetLoader(k);

    // Start loading assets
    setIsLoading(true);
    setError(null);

    assetLoader.loadAssets({
      onProgress: (progress) => setLoadingProgress(progress),
      onComplete: () => {
        console.log("Asset loading complete");
        try {
          const gameplayScene = initializeScenes(
            k,
            sceneManager,
            showHitboxes,
            difficulty
          );
          gameplaySceneRef.current = gameplayScene;
        } catch (err) {
          console.error("Game initialization error:", err);
          setError("Failed to initialize game. Please try again.");
        }
        setIsLoading(false);
      },
      onError: (err) => {
        console.error("Asset loading error:", err);
        setError("Failed to load game assets. Please try again.");
        setIsLoading(false);
      },
    });

    return () => {
      gameEngine.destroy();
    };
  }, [canvasRef, width, height, showHitboxes, difficulty, isScreenTooSmall]);

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
