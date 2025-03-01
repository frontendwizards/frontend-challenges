import { KaboomInterface } from "../types/KaboomTypes";

export default class AssetLoader {
  private k: KaboomInterface;

  constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  public loadCharacterSprites(): Promise<boolean> {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalFrames = 10;

      // Try to load all individual frames
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.src = `/assets/characters/templerun/Run__00${i}.png`;

        img.onload = () => {
          // Register each sprite individually
          this.k.loadSprite(`run${i}`, img);

          loadedCount++;
          if (loadedCount === 1) {
            // At least one sprite loaded successfully
            resolve(true);
          } else if (loadedCount === totalFrames) {
            // All sprites loaded
            resolve(true);
          }
        };

        img.onerror = () => {
          console.error(`Failed to load Temple Run sprite ${i}`);
          loadedCount++;

          if (loadedCount === 1) {
            // First sprite failed to load
            resolve(false);
          } else if (loadedCount === totalFrames) {
            // All attempts finished
            resolve(loadedCount > 0);
          }
        };
      }
    });
  }

  public loadObstacleSprites(): Promise<boolean> {
    return new Promise((resolve) => {
      const obstaclesImage = new Image();
      obstaclesImage.src = "/obstacles.png";

      obstaclesImage.onload = () => {
        // Create a sprite atlas for obstacles
        this.k.loadSpriteAtlas(obstaclesImage, {
          obstacle0: {
            x: 0,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle1: {
            x: obstaclesImage.width / 5,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle2: {
            x: (2 * obstaclesImage.width) / 5,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle3: {
            x: (3 * obstaclesImage.width) / 5,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle4: {
            x: (4 * obstaclesImage.width) / 5,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle5: {
            x: 0,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle6: {
            x: obstaclesImage.width / 5,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle7: {
            x: (2 * obstaclesImage.width) / 5,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle8: {
            x: (3 * obstaclesImage.width) / 5,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle9: {
            x: (4 * obstaclesImage.width) / 5,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
        });
        resolve(true);
      };

      obstaclesImage.onerror = () => {
        console.error("Failed to load obstacles sprite");
        resolve(false);
      };
    });
  }
}
