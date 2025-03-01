import { KaboomInterface, KaboomConfig } from "../types/KaboomTypes";

export default class GameEngine {
  private gameContainer: HTMLDivElement | null = null;
  protected k: KaboomInterface | null = null;
  private script: HTMLScriptElement | null = null;
  protected assetsLoaded = 0;
  protected totalAssetsToLoad = 0;

  constructor(container: HTMLDivElement | null) {
    this.gameContainer = container;
  }

  public initialize(
    config: KaboomConfig,
    onInit?: () => void
  ): Promise<KaboomInterface> {
    return new Promise((resolve, reject) => {
      if (!this.gameContainer) {
        reject(new Error("Game container not found"));
        return;
      }

      // Clean up the container
      this.gameContainer.innerHTML = "";

      // Load Kaboom script dynamically
      this.script = document.createElement("script");
      this.script.src =
        "https://unpkg.com/kaboom@3000.0.0-beta.2/dist/kaboom.js";
      this.script.async = true;

      this.script.onload = () => {
        // Initialize Kaboom
        const k = kaboom({
          ...config,
          canvas: document.createElement("canvas"),
        });

        // Append canvas to our container
        if (k.canvas) {
          this.gameContainer.appendChild(k.canvas);
        }

        this.k = k;

        if (onInit) {
          onInit();
        }

        resolve(k);
      };

      this.script.onerror = (e) => {
        reject(new Error("Failed to load Kaboom script"));
      };

      document.body.appendChild(this.script);
    });
  }

  protected checkAllAssetsLoaded(callback: () => void): void {
    this.assetsLoaded++;
    if (this.assetsLoaded >= this.totalAssetsToLoad) {
      callback();
    }
  }

  public destroy(): void {
    if (this.script && this.script.parentNode) {
      this.script.parentNode.removeChild(this.script);
    }

    if (this.gameContainer) {
      this.gameContainer.innerHTML = "";
    }
  }
}
