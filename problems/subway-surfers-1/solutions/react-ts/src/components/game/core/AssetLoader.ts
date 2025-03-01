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
      // Calculate total assets to load
      this.totalAssetsToLoad =
        GameConfig.CHARACTER_SPRITE_COUNT + GameConfig.OBSTACLE_SPRITE_COUNT;

      // Reset counter
      this.assetsLoaded = 0;
      this.spritesLoaded = false;

      // Load character sprites
      this.loadCharacterSprites(callbacks);

      // Load obstacle sprites
      this.loadObstacleSprites(callbacks);
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

    // Load character run animation frames
    for (let i = 0; i < GameConfig.CHARACTER_SPRITE_COUNT; i++) {
      const spriteName = `run${i}`;

      this.k.loadSprite(spriteName, `${GameConfig.SPRITE_PATH}/Run__00${i}.png`, {
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
          this.trackAssetLoaded(callbacks);
        },
        onError: (err) => {
          console.warn(`Failed to load sprite ${spriteName}:`, err);
          characterSpritesLoaded.success = false;
          this.trackAssetLoaded(callbacks);
        },
      });
    }

    this.spritesLoaded = characterSpritesLoaded.success;
  }

  private loadObstacleSprites(callbacks?: AssetLoaderCallbacks): void {
    // Load obstacle sprites
    for (let i = 0; i < GameConfig.OBSTACLE_SPRITE_COUNT; i++) {
      const spriteName = `obstacle${i}`;

      this.k.loadSprite(
        spriteName,
        `${GameConfig.SPRITE_PATH}/obstacle${i}.png`,
        {
          sliceX: 1,
          sliceY: 1,
          noError: true,
          onLoad: () => {
            this.trackAssetLoaded(callbacks);
          },
          onError: (err) => {
            console.warn(`Failed to load sprite ${spriteName}:`, err);
            this.trackAssetLoaded(callbacks);
          },
        }
      );
    }
  }

  private trackAssetLoaded(callbacks?: AssetLoaderCallbacks): void {
    this.assetsLoaded++;

    // Calculate progress percentage
    const progress = (this.assetsLoaded / this.totalAssetsToLoad) * 100;

    // Report progress
    if (callbacks?.onProgress) {
      callbacks.onProgress(progress);
    }

    // Check if all assets are loaded
    if (this.assetsLoaded >= this.totalAssetsToLoad) {
      if (callbacks?.onComplete) {
        callbacks.onComplete();
      }
    }
  }

  public isSpritesLoaded(): boolean {
    return this.spritesLoaded;
  }
}
