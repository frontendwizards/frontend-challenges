import { KaboomInterface, GameObj } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";

export interface ObstacleOptions {
  lane: number;
  lanes: number[];
  speed: number;
  showHitboxes: boolean;
  showBorders: boolean;
}

export default class Obstacle extends GameObject {
  private lane: number;
  private lanes: number[];
  private speed: number;
  private showHitboxes: boolean;
  private showBorders: boolean;
  private hitbox: GameObj | null = null;
  private spriteIndex: number;

  constructor(kaboomInstance: KaboomInterface, options: ObstacleOptions) {
    super(kaboomInstance);
    this.lane = options.lane;
    this.lanes = options.lanes;
    this.speed = options.speed;
    this.showHitboxes = options.showHitboxes;
    this.showBorders = options.showBorders;
    this.spriteIndex = this.k.randi(0, 10); // Random obstacle sprite
  }

  public init(): void {
    this.createObstacle();

    if (this.showHitboxes) {
      this.createHitbox();
    }
  }

  public update(_dt: number): void {
    // Obstacles are automatically moved by Kaboom's move component
    // Just update the hitbox if it exists
    if (this.hitbox && this.gameObj) {
      this.hitbox.pos = this.gameObj.pos;
    }

    // Check if obstacle is off-screen and destroy it
    if (this.gameObj && this.gameObj.pos.x < -100) {
      this.destroy();
    }
  }

  private createObstacle(): void {
    const k = this.k;

    // Clear previous components
    this.components = [];
    this.tags = [];
    this.props = {};

    try {
      // Try to use the obstacles sprite sheet
      this.addComponent(
        k.sprite("obstacles", {
          noError: true,
          frame: this.spriteIndex,
        })
      );
    } catch (_error) {
      console.warn("Failed to add obstacle sprite, using fallback rectangle");
      // Fallback to rectangle with random color if sprite loading fails
      this.addComponent(k.rect(60, 60));

      // Add random color for variety
      const r = k.randi(100, 255);
      const g = k.randi(100, 255);
      const b = k.randi(100, 255);
      this.addComponent(k.color(r, g, b));
    }

    // Add outline if showBorders is true
    if (this.showBorders) {
      this.addComponent(k.outline(2, k.rgb(255, 0, 0)));
    }

    // Add common components
    this.addComponent(k.pos(GameConfig.CANVAS_WIDTH, this.lanes[this.lane]));
    this.addComponent(k.anchor("center"));
    this.addComponent(k.area({ scale: 0.8 }));
    this.addComponent(k.move(k.LEFT, this.speed));
    this.addComponent(k.scale(GameConfig.OBSTACLE_SCALE));

    // Add tag
    this.addTag("obstacle");

    // Add custom draw function to handle white pixels
    this.addProp("draw", function (this: GameObj) {
      // This is effectively saying "use the sprite but make white transparent"
      this.use(k.color(255, 255, 255, 0));
    });

    // Create the game object
    this.createGameObj();
  }

  private createHitbox(): void {
    if (!this.gameObj) return;

    const k = this.k;
    const hitboxWidth = this.gameObj.width * 0.8;
    const hitboxHeight = this.gameObj.height * 0.8;

    this.hitbox = k.add([
      k.rect(hitboxWidth, hitboxHeight),
      k.pos(this.gameObj.pos.x, this.gameObj.pos.y),
      k.anchor("center"),
      k.outline(2, k.rgb(255, 0, 0)),
      k.color(255, 0, 0, 0.3),
      k.move(k.LEFT, this.speed),
    ]);
  }

  public override destroy(): void {
    if (this.hitbox) {
      this.hitbox.destroy();
      this.hitbox = null;
    }
    super.destroy();
  }
}
