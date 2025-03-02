import { KaboomInterface } from "../types/KaboomTypes";
import GameConfig from "../config/GameConfig";
import AudioPlayer from "./AudioPlayer";

interface AssetLoaderCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface LoadResult {
  success: boolean;
  name: string;
}

export default class AssetLoader {
  private k: KaboomInterface;
  private assetsLoaded = 0;
  private totalAssetsToLoad = 0;

  constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  public async loadAssets(callbacks?: AssetLoaderCallbacks): Promise<void> {
    try {
      console.log("Starting to load assets...");
      // Calculate total assets to load (character sprites + 1 obstacle spritesheet + coin sprite + coin sound)
      this.totalAssetsToLoad = GameConfig.CHARACTER_SPRITE_COUNT + 3;
      console.log(`Total assets to load: ${this.totalAssetsToLoad}`);

      // Reset counter
      this.assetsLoaded = 0;

      // Set a timeout to ensure we don't get stuck in loading
      const loadingTimeout = setTimeout(() => {
        console.log("Asset loading timeout reached - forcing completion");
        if (this.assetsLoaded < this.totalAssetsToLoad) {
          // Force all assets to be marked as loaded
          this.assetsLoaded = this.totalAssetsToLoad;
          callbacks?.onComplete?.();
        }
      }, 5000); // 5 seconds timeout

      // Load all assets in parallel
      await this.loadAllAssetsInParallel(callbacks);
      clearTimeout(loadingTimeout);
      console.log("Assets loaded successfully");
      callbacks?.onComplete?.();
    } catch (error) {
      console.error("Error loading assets:", error);
      callbacks?.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private async loadAllAssetsInParallel(
    callbacks?: AssetLoaderCallbacks
  ): Promise<void> {
    const loadPromises: Promise<LoadResult>[] = [];

    // Add character sprite loading promises
    for (let i = 0; i < GameConfig.CHARACTER_SPRITE_COUNT; i++) {
      const spriteName = `run${i}`;
      // Format with leading zeros for proper file naming (Run__000.png, etc)
      const formattedIndex = i.toString().padStart(3, "0");
      const spritePath = `${GameConfig.SPRITE_PATH}/Run__${formattedIndex}.png`;

      loadPromises.push(this.loadSpriteAsync(spriteName, spritePath));
    }

    // Add obstacle sprite sheet loading promise
    loadPromises.push(this.loadObstaclesSpriteSheetAsync());

    // Add coin sprite sheet loading promise
    loadPromises.push(this.loadCoinSpriteSheetAsync());

    // Add coin sound loading promise
    loadPromises.push(AudioPlayer.loadSoundsAsync());

    try {
      // Use Promise.all to load all assets in parallel and update progress individually
      let loadedCount = 0;
      const totalCount = loadPromises.length;

      // Create a modified promise for each asset that reports progress
      const trackedPromises = loadPromises.map((promise) =>
        promise.then((result) => {
          loadedCount++;
          // Update progress after each asset loads
          const progress = (loadedCount / totalCount) * 100;
          console.log(
            `Asset loaded (${loadedCount}/${totalCount}): ${progress.toFixed(
              1
            )}%`
          );
          if (callbacks?.onProgress) {
            callbacks.onProgress(progress);
          }
          return result;
        })
      );

      // Wait for all assets to load
      const results = await Promise.all(trackedPromises);

      // Ensure we count successful loads
      const successfulLoads = results.filter((result) => result.success).length;
      console.log(
        `Successfully loaded ${successfulLoads} out of ${totalCount} assets`
      );

      this.assetsLoaded = loadedCount;

      // Even if we couldn't load all assets, consider the loading complete
      if (loadedCount >= totalCount * 0.5) {
        console.log("Enough assets loaded to proceed");
      }
    } catch (error) {
      console.error("Error during parallel asset loading:", error);
      // Even on error, mark assets as loaded to prevent hanging
      this.assetsLoaded = this.totalAssetsToLoad;
    }
  }

  private loadSpriteAsync(
    spriteName: string,
    spritePath: string
  ): Promise<LoadResult> {
    return new Promise<LoadResult>((resolve) => {
      console.log(`Loading sprite: ${spriteName} from path: ${spritePath}`);

      this.k.loadSprite(spriteName, spritePath, {
        sliceX: 1,
        sliceY: 1,
        noError: true,
        onLoad: () => {
          console.log(`Successfully loaded sprite: ${spriteName}`);
          resolve({ success: true, name: spriteName });
        },
        onError: (err) => {
          console.warn(
            `Failed to load sprite ${spriteName} from ${spritePath}:`,
            err
          );
          resolve({ success: false, name: spriteName });
        },
      });
    });
  }

  private loadObstaclesSpriteSheetAsync(): Promise<LoadResult> {
    return new Promise<LoadResult>((resolve) => {
      console.log("Loading obstacle sprite sheet...");

      this.k.loadSprite("obstacle", "/obstacles.png", {
        sliceX: 5,
        sliceY: 2,
        noError: true,
        onLoad: () => {
          console.log("Successfully loaded obstacles sprite sheet");
          resolve({ success: true, name: "obstacles" });
        },
        onError: (err) => {
          console.warn("Failed to load obstacles sprite sheet:", err);
          resolve({ success: false, name: "obstacles" });
        },
      });
    });
  }

  private loadCoinSpriteSheetAsync(): Promise<LoadResult> {
    return new Promise<LoadResult>((resolve) => {
      console.log("Loading coin sprite sheet...");

      this.k.loadSprite("coin", GameConfig.COIN_SPRITE_PATH, {
        sliceX: GameConfig.COIN_SPRITE_FRAMES,
        sliceY: 1,
        anims: {
          spin: {
            from: 0,
            to: GameConfig.COIN_SPRITE_FRAMES - 1,
            speed: 5,
            loop: true,
          },
        },
        noError: true,
        onLoad: () => {
          console.log("Successfully loaded coin sprite sheet");
          resolve({ success: true, name: "coin" });
        },
        onError: (err) => {
          console.warn("Failed to load coin sprite sheet:", err);
          resolve({ success: false, name: "coin" });
        },
      });
    });
  }

  public isSpritesLoaded(): boolean {
    // Always return true - we'll handle missing sprites gracefully in the game
    return true;
  }
}
