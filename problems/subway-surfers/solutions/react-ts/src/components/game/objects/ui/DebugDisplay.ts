import { KaboomInterface, GameObj } from "../../types/KaboomTypes";

interface DebugDisplayOptions {
  x: number;
  y: number;
  getSpawningState: () => boolean;
}

export default class DebugDisplay {
  private k: KaboomInterface;
  private x: number;
  private y: number;
  private getSpawningState: () => boolean;
  private debugText: GameObj | null = null;
  private background: GameObj | null = null;
  private lastTime: number = performance.now();
  private frameCount: number = 0;
  private currentFps: number = 0;
  private fpsUpdateInterval: number = 500; // Update FPS every 500ms
  private fpsHistory: number[] = [];
  private readonly FPS_HISTORY_SIZE = 10;
  private readonly MILLISECONDS_PER_SECOND = 1000;
  private isVisible: boolean = true;

  constructor(k: KaboomInterface, options: DebugDisplayOptions) {
    this.k = k;
    this.x = options.x;
    this.y = options.y;
    this.getSpawningState = options.getSpawningState;
  }

  public init(): void {
    // Create the debug text object with a small background
    const bgWidth = 100;
    const bgHeight = 32;

    // Add semi-transparent background with rounded corners
    this.background = this.k.add([
      this.k.rect(bgWidth, bgHeight),
      this.k.pos(this.x - 4, this.y - 4),
      this.k.color(0, 0, 0, 0.7),
      this.k.outline(1, this.k.rgb(255, 255, 255)),
      this.k.fixed(),
      this.k.z(99),
    ]);

    // Create the FPS text
    this.debugText = this.k.add([
      this.k.text("FPS: --", {
        size: 16,
        font: "monospace", // Use monospace for consistent width
      }),
      this.k.pos(this.x + 7, this.y + 6), // Better centered text
      this.k.color(255, 255, 255),
      this.k.fixed(),
      this.k.z(100),
    ]);

    // Set up toggle key
    this.k.onKeyPress("p", () => {
      this.toggle();
    });

    this.updateVisibility();
  }

  private calculateFps(): void {
    const currentTime = performance.now();
    this.frameCount++;
    const timePassed = currentTime - this.lastTime;

    // Update FPS only every fpsUpdateInterval milliseconds
    if (timePassed < this.fpsUpdateInterval) {
      return;
    }

    const newFps = Math.round(
      (this.frameCount * this.MILLISECONDS_PER_SECOND) / timePassed
    );

    // Add to history
    this.fpsHistory.push(newFps);
    if (this.fpsHistory.length > this.FPS_HISTORY_SIZE) {
      this.fpsHistory.shift();
    }

    // Calculate average FPS
    this.currentFps = Math.round(
      this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
    );

    this.frameCount = 0;
    this.lastTime = currentTime;
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.updateVisibility();
  }

  private updateVisibility(): void {
    if (this.background && this.debugText) {
      this.background.opacity = this.isVisible ? 1 : 0;
      this.debugText.opacity = this.isVisible ? 1 : 0;
    }
  }

  public update(): void {
    if (!this.debugText || !this.isVisible) return;

    // Calculate FPS
    this.calculateFps();

    // Color code FPS
    let fpsColor = this.k.rgb(255, 255, 255); // Default white
    if (this.currentFps >= 55) {
      fpsColor = this.k.rgb(50, 255, 50); // Bright green for good FPS
    } else if (this.currentFps >= 30) {
      fpsColor = this.k.rgb(255, 255, 50); // Bright yellow for okay FPS
    } else {
      fpsColor = this.k.rgb(255, 50, 50); // Bright red for poor FPS
    }

    // Update text color
    this.debugText.color = fpsColor;

    // Update text with padded FPS number for consistent width
    this.debugText.text = `FPS: ${String(this.currentFps).padStart(3, " ")}`;
  }

  public destroy(): void {
    if (this.background && this.background.exists()) {
      this.background.destroy();
    }
    if (this.debugText && this.debugText.exists()) {
      this.debugText.destroy();
    }
    this.background = null;
    this.debugText = null;
  }
}
