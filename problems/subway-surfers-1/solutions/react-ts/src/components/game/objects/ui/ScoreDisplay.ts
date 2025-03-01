import { KaboomInterface } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";

export interface ScoreDisplayOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default class ScoreDisplay extends GameObject {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private score: number = 0;
  private container: any = null;

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
  }

  public update(dt: number): void {
    // Score display doesn't need per-frame updates
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

    // Add score label components
    this.addComponent(k.text(`Score: ${Math.floor(this.score)}`, { size: 24 }));
    this.addComponent(k.pos(this.x + 10, this.y + this.height / 2));
    this.addComponent(k.anchor("left"));
    this.addComponent(k.color(255, 255, 255));
    this.addComponent(k.fixed());

    // Add z-index and value properties
    this.addProp("z", 101);
    this.addProp("value", this.score);

    // Create the game object
    this.createGameObj();
  }

  public updateScore(score: number): void {
    if (!this.gameObj) return;

    this.score = score;

    // Update score display
    if (this.gameObj) {
      this.gameObj.value = Math.floor(score);
      this.gameObj.text = `Score: ${this.gameObj.value}`;
    }
  }

  public getScore(): number {
    return this.score;
  }

  public override destroy(): void {
    // Destroy container
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    // Destroy the score label
    super.destroy();
  }
}
