import React, { useEffect, useRef, useState } from "react";
import GameEngine from "./core/GameEngine";
import AssetLoader from "./core/AssetLoader";
import SceneManager, {
  GameOverScene,
  GameplayScene,
  SpritePreviewScene,
} from "./core/SceneManager";
import GameConfig from "./config/GameConfig";

interface EndlessRunnerProps {
  useSprite?: boolean;
}

const EndlessRunner: React.FC<EndlessRunnerProps> = ({ useSprite = true }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showSpritePreview, setShowSpritePreview] = useState(false);
  const [showBorders, setShowBorders] = useState(false);
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [gameDifficulty, setGameDifficulty] = useState("normal"); // "easy", "normal", "hard"
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize game engine
    const gameEngine = new GameEngine(gameContainerRef.current);

    // Start the game
    const initGame = async () => {
      try {
        console.log("Initializing game engine...");
        setIsLoading(true);
        // Initialize Kaboom
        const k = await gameEngine.initialize({
          width: GameConfig.CANVAS_WIDTH,
          height: GameConfig.CANVAS_HEIGHT,
          background: GameConfig.BACKGROUND_COLOR,
          scale: 1,
          debug: showHitboxes,
          global: true,
        });

        console.log("Loading assets...");
        // Load assets
        const assetLoader = new AssetLoader(k);
        const spriteLoadSuccess = useSprite
          ? await assetLoader.loadCharacterSprites()
          : false;
        await assetLoader.loadObstacleSprites();

        console.log("Initializing scene manager...");
        // Initialize scene manager
        const sceneManager = new SceneManager(k);

        // Register scenes
        console.log("Registering game scenes...");
        const gameplayScene = new GameplayScene(k, spriteLoadSuccess, {
          showHitboxes,
          showBorders,
          difficulty: gameDifficulty,
        });
        gameplayScene.register(sceneManager);

        const gameOverScene = new GameOverScene(k);
        gameOverScene.register(sceneManager);

        const spritePreviewScene = new SpritePreviewScene(k);
        spritePreviewScene.register(sceneManager);

        // Start the appropriate scene
        console.log(
          `Starting scene: ${showSpritePreview ? "spritePreview" : "game"}`
        );
        if (showSpritePreview) {
          sceneManager.startScene("spritePreview");
        } else {
          sceneManager.startScene("game");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize game:", error);
        setIsLoading(false);
      }
    };

    initGame();

    // Cleanup
    return () => {
      console.log("Cleaning up game resources...");
      gameEngine.destroy();
    };
  }, [showSpritePreview, showBorders, showHitboxes, gameDifficulty, useSprite]);

  const handleSpritePreviewToggle = () => {
    setShowSpritePreview(!showSpritePreview);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={gameContainerRef}
        className="w-[1000px] h-[600px] mx-auto rounded-lg overflow-hidden shadow-2xl"
      />

      <div className="mt-4 flex flex-col items-center gap-2.5">
        {/* Game controls */}
        <div className="flex gap-2.5 mb-2.5">
          <button
            onClick={handleSpritePreviewToggle}
            className="px-4 py-2 bg-gray-800 text-white border-none rounded cursor-pointer hover:bg-gray-700 transition-colors"
          >
            {showSpritePreview ? "Go to Game" : "View Sprite Animation"}
          </button>
        </div>

        {/* Game settings */}
        <div className="flex flex-row items-center gap-5 p-4 border border-gray-600 rounded-lg bg-gray-800 text-white w-4/5 max-w-[800px] justify-center">
          <h3 className="m-0">Game Settings</h3>

          {/* Difficulty selector */}
          <div>
            <label className="mr-2.5">Difficulty:</label>
            <select
              value={gameDifficulty}
              onChange={(e) => setGameDifficulty(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-700 text-white border border-gray-600 rounded"
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Show borders checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showBorders"
              checked={showBorders}
              onChange={() => setShowBorders(!showBorders)}
              className="mr-2"
            />
            <label htmlFor="showBorders">Show Object Borders</label>
          </div>

          {/* Show hitboxes checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showHitboxes"
              checked={showHitboxes}
              onChange={() => setShowHitboxes(!showHitboxes)}
              className="mr-2"
            />
            <label htmlFor="showHitboxes">Show Collision Hitboxes</label>
          </div>
        </div>

        {/* Game instructions */}
        <div className="mt-4 text-gray-400 text-sm max-w-[800px]">
          Use <strong>Up</strong> and <strong>Down</strong> arrow keys to switch
          lanes and avoid obstacles. Your speed increases over time making the
          game harder!
        </div>
      </div>
    </div>
  );
};

export default EndlessRunner;
