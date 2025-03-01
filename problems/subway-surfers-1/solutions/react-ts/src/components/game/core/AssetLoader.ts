import { KaboomInterface } from "../types/KaboomTypes";
import GameConfig from "../config/GameConfig";

interface AssetLoaderCallbacks {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

interface LoadResult {
  success: boolean;
  name: string;
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
          callbacks?.onComplete?.();
        }
      }, 5000); // 5 seconds timeout

      // Load all assets in parallel
      this.loadAllAssetsInParallel(callbacks)
        .then(() => {
          clearTimeout(loadingTimeout);
          callbacks?.onComplete?.();
        })
        .catch((error) => {
          console.error("Error loading assets:", error);
          callbacks?.onError?.(
            error instanceof Error ? error : new Error(String(error))
          );
        });
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

    // Process loading results in batches to update progress steadily
    const batchSize = 10; // Process 3 assets at a time
    const batches = [];

    for (let i = 0; i < loadPromises.length; i += batchSize) {
      batches.push(loadPromises.slice(i, i + batchSize));
    }

    let loadedAssets = 0;
    const allSpritesLoaded: boolean[] = [];

    // Process each batch sequentially, but assets within a batch load in parallel
    for (const batch of batches) {
      const results = await Promise.all(batch);

      loadedAssets += results.length;
      allSpritesLoaded.push(...results.map((r) => r.success));

      // Update progress
      const progress = (loadedAssets / this.totalAssetsToLoad) * 100;
      callbacks?.onProgress?.(progress);
    }

    // Set sprites loaded flag
    this.spritesLoaded = allSpritesLoaded.some((success) => success);
    this.assetsLoaded = loadedAssets;
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

      this.k.loadSprite("obstacles", "/obstacles.png", {
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

  public isSpritesLoaded(): boolean {
    // Always return true - we'll handle missing sprites gracefully in the game
    return true;
  }
}
