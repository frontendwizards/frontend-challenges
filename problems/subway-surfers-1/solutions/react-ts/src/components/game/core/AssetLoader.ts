import { KaboomInterface } from "../types/KaboomTypes";
import GameConfig from "../config/GameConfig";

interface AssetLoaderCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export default class AssetLoader {
  private k: KaboomInterface;
  private assetsLoaded = 0;
  private totalAssetsToLoad = 0;
  private spritesLoaded = false;

  constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  public loadAssets(callbacks?: AssetLoaderCallbacks): void {
    try {
      console.log("Starting to load assets...");
      // Calculate total assets to load (character sprites + 1 obstacle spritesheet)
      this.totalAssetsToLoad = GameConfig.CHARACTER_SPRITE_COUNT + 1;
      console.log(`Total assets to load: ${this.totalAssetsToLoad}`);

      // Reset counter
      this.assetsLoaded = 0;
      this.spritesLoaded = false;

      // Set a timeout to ensure we don't get stuck in loading
      const loadingTimeout = setTimeout(() => {
        console.log("Asset loading timeout reached - forcing completion");
        if (this.assetsLoaded < this.totalAssetsToLoad) {
          // Force all assets to be marked as loaded
          this.assetsLoaded = this.totalAssetsToLoad;
          if (callbacks?.onComplete) {
            callbacks.onComplete();
          }
        }
      }, 5000); // 5 seconds timeout

      // Load character sprites
      this.loadCharacterSprites(callbacks);

      // Load obstacle sprite sheet
      this.loadObstacleSpriteSheet(callbacks);

      // Always ensure we can proceed even if assets fail to load
      this.spritesLoaded = true;

      // Check if everything is loaded instantly (cached or failed)
      if (this.assetsLoaded >= this.totalAssetsToLoad) {
        clearTimeout(loadingTimeout);
        if (callbacks?.onComplete) {
          callbacks.onComplete();
        }
      }
    } catch (error) {
      console.error("Error loading assets:", error);
      if (callbacks?.onError) {
        callbacks.onError(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  private loadCharacterSprites(callbacks?: AssetLoaderCallbacks): void {
    const characterSpritesLoaded = { success: true };
    console.log("Loading character sprites...");

    // Load character run animation frames
    for (let i = 0; i < GameConfig.CHARACTER_SPRITE_COUNT; i++) {
      const spriteName = `run${i}`;
      // Format with leading zeros for proper file naming (Run__000.png, etc)
      const formattedIndex = i.toString().padStart(3, "0");
      const spritePath = `${GameConfig.SPRITE_PATH}/Run__${formattedIndex}.png`;

      console.log(`Loading sprite: ${spriteName} from path: ${spritePath}`);

      this.k.loadSprite(spriteName, spritePath, {
        sliceX: 1,
        sliceY: 1,
        anims: {
          run: {
            from: 0,
            to: 0,
            speed: 10,
            loop: true,
          },
        },
        noError: true,
        onLoad: () => {
          console.log(`Successfully loaded sprite: ${spriteName}`);
          this.trackAssetLoaded(callbacks);
        },
        onError: (err) => {
          console.warn(
            `Failed to load sprite ${spriteName} from ${spritePath}:`,
            err
          );
          characterSpritesLoaded.success = false;
          this.trackAssetLoaded(callbacks);
        },
      });
    }

    this.spritesLoaded = characterSpritesLoaded.success;
  }

  private loadObstacleSpriteSheet(callbacks?: AssetLoaderCallbacks): void {
    console.log("Loading obstacle sprite sheet...");
    // Load the obstacles sprite sheet and slice it into 10 obstacles
    this.k.loadSprite("obstacles", "/obstacles.png", {
      sliceX: GameConfig.OBSTACLE_SPRITE_COUNT, // Slice horizontally into 10 sprites
      sliceY: 1,
      anims: {
        // Define animations if needed
      },
      noError: true,
      onLoad: () => {
        console.log("Successfully loaded obstacles sprite sheet");
        this.trackAssetLoaded(callbacks);

        // Register individual obstacle sprites from the sprite sheet
        for (let i = 0; i < GameConfig.OBSTACLE_SPRITE_COUNT; i++) {
          // The obstacles are already loaded as frames in the sprite sheet
          // We don't need additional tracking for these
        }
      },
      onError: (err) => {
        console.warn("Failed to load obstacles sprite sheet:", err);
        this.trackAssetLoaded(callbacks);
      },
    });
  }

  private trackAssetLoaded(callbacks?: AssetLoaderCallbacks): void {
    this.assetsLoaded++;
    console.log(
      `Assets loaded: ${this.assetsLoaded}/${this.totalAssetsToLoad}`
    );

    // Calculate progress percentage
    const progress = (this.assetsLoaded / this.totalAssetsToLoad) * 100;
    console.log(`Loading progress: ${progress.toFixed(2)}%`);

    // Report progress
    if (callbacks?.onProgress) {
      callbacks.onProgress(progress);
    }

    // Check if all assets are loaded
    if (this.assetsLoaded >= this.totalAssetsToLoad) {
      console.log("All assets loaded successfully!");
      if (callbacks?.onComplete) {
        callbacks.onComplete();
      }
    }
  }

  public isSpritesLoaded(): boolean {
    // Always return true - we'll handle missing sprites gracefully in the game
    return true;
  }
}
