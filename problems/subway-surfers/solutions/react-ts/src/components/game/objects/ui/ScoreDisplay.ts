import { KaboomInterface, GameObj } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import Coin from "../entities/Coin";
import { Vec2 } from "kaboom";

export interface ScoreDisplayOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Create a specialized UI coin class that extends the regular Coin
class UIScoreCoin extends Coin {
  private uiPosition: Vec2;

  constructor(kaboomInstance: KaboomInterface, uiPos: Vec2) {
    // Initialize with default coin parameters
    super(kaboomInstance, {
      lane: 0, // Not important for UI
      lanes: [], // Not important for UI
      speed: 0, // It won't move
      showHitboxes: false,
    });

    this.uiPosition = uiPos;
    this.animationSpeed = 0.15; // Slower animation for UI
  }

  override init(): void {
    // Call the parent init first
    super.init();

    // Now customize for UI display
    if (this.gameObj) {
      // Position for UI
      this.gameObj.pos = this.uiPosition;

      // Set scale for UI
      this.gameObj.scale = this.k.vec2(1.6, 1.6);

      // Make it fixed on screen
      this.gameObj.use(this.k.fixed());

      // Ensure it's on top
      this.gameObj.z = 101;
    }
  }
}

export default class ScoreDisplay extends GameObject {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private score: number = 0;
  private container: GameObj | null = null;
  private coinIcon: UIScoreCoin | null = null;

  constructor(kaboomInstance: KaboomInterface, options: ScoreDisplayOptions) {
    super(kaboomInstance);
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
  }

  public init(): void {
    this.createContainer();
    this.createScoreLabel();
    this.createCoinIcon();
  }

  public update(): void {
    // Update coin animation if it exists
    if (this.coinIcon) {
      this.coinIcon.update();
    }
  }

  private createContainer(): void {
    const k = this.k;

    // Create container for score display
    this.container = k.add([
      k.rect(this.width, this.height),
      k.pos(this.x, this.y),
      k.color(0, 0, 0, 0.7), // Semi-transparent black background
      k.fixed(),
      k.outline(2, k.rgb(255, 255, 255)),
      { z: 100 }, // Ensure it's above other elements
    ]);
  }

  private createScoreLabel(): void {
    const k = this.k;

    // Clear previous components
    this.components = [];
    this.tags = [];
    this.props = {};

    // Add score label components - removed "Score: " text
    this.addComponent(k.text(`${Math.floor(this.score)}`, { size: 24 }));

    // Position text to leave space for the coin icon
    this.addComponent(k.pos(this.x + 20, this.y + this.height / 2));
    this.addComponent(k.anchor("left"));
    this.addComponent(k.color(255, 255, 255));
    this.addComponent(k.fixed());

    // Add z-index and value properties
    this.addProp("z", 101);
    this.addProp("value", this.score);

    // Create the game object
    this.createGameObj();
  }

  private createCoinIcon(): void {
    // Create a position vector for the coin
    const coinPosition = this.k.vec2(this.x + 90, this.y + this.height / 2 - 2);

    // Create a specialized UI coin
    this.coinIcon = new UIScoreCoin(this.k, coinPosition);

    // Initialize the coin (which will handle the positioning and scaling)
    this.coinIcon.init();
  }

  public updateScore(score: number): void {
    if (!this.gameObj) return;

    this.score = score;

    // Update score display - removed "Score: " text
    if (this.gameObj) {
      this.gameObj.value = Math.floor(score);
      this.gameObj.text = `${this.gameObj.value}`;
    }
  }

  public getScore(): number {
    return this.score;
  }

  public override destroy(): void {
    // Destroy coin icon
    if (this.coinIcon) {
      this.coinIcon.destroy();
      this.coinIcon = null;
    }

    // Destroy container
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    // Destroy the score label
    super.destroy();
  }
}
