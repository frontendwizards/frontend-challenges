import kaboom from "kaboom";
import { KaboomInterface } from "../types/KaboomTypes";
import GameConfig from "../config/GameConfig";

interface GameEngineOptions {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  debug?: boolean;
  background?: string;
  scale?: number;
}

export default class GameEngine {
  private k: KaboomInterface | null = null;
  private options: GameEngineOptions;

  constructor(options: GameEngineOptions) {
    this.options = options;
    this.initialize();
  }

  private initialize(): void {
    try {
      const {
        canvas,
        width = GameConfig.CANVAS_WIDTH,
        height = GameConfig.CANVAS_HEIGHT,
        debug = false,
        background = GameConfig.CANVAS_BACKGROUND_COLOR,
        scale = 1,
      } = this.options;

      // Initialize Kaboom with the canvas element
      this.k = kaboom({
        canvas,
        width,
        height,
        background,
        scale,
        debug,
        global: false, // Don't pollute global namespace
        crisp: true, // Crisp pixel rendering
        touchToMouse: true, // Convert touch to mouse events for mobile
      });

      console.log("Game engine initialized successfully");
    } catch (error) {
      console.error("Failed to initialize game engine:", error);
      throw error;
    }
  }

  public getKaboomInstance(): KaboomInterface {
    if (!this.k) {
      throw new Error("Kaboom instance not initialized");
    }
    return this.k;
  }

  public destroy(): void {
    if (this.k) {
      // Clean up any event listeners or timers
      this.k.onUpdate(() => {}); // Clear update handlers
      this.k.onDraw(() => {}); // Clear draw handlers

      // Remove all game objects
      this.k.destroyAll();

      // Clear all scenes
      this.k.scenes = {};

      // Clear all loaded assets
      this.k.assets = {};

      console.log("Game engine resources cleaned up");
      this.k = null;
    }
  }
}
