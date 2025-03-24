import { KaboomInterface, GameObj } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";

export interface ObstacleOptions {
  lane: number;
  lanes: number[];
  speed: number;
  showHitboxes: boolean;
}

export default class Obstacle extends GameObject {
  private lane: number;
  private speed: number;
  private showHitboxes: boolean;
  private hitbox: GameObj | null = null;
  private spriteIndex: number;

  constructor(kaboomInstance: KaboomInterface, options: ObstacleOptions) {
    super(kaboomInstance);
    this.lane = options.lane;
    this.speed = options.speed;
    this.showHitboxes = options.showHitboxes;
    this.spriteIndex = this.k.randi(0, 10); // Random obstacle sprite
  }

  public init(): void {
    this.createObstacle();
  }

  public update(): void {
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
        k.sprite("obstacle", {
          noError: true,
          frame: this.spriteIndex,
        })
      );
    } catch (_error) {
      console.warn("Failed to add obstacle sprite, using fallback rectangle");
    }

    const lanes = GameConfig.getLanePositions();
    const randomLaneY = lanes[k.randi(0, lanes.length)];
    const laneX = GameConfig.CANVAS_WIDTH + GameConfig.OBSTACLE_WIDTH;

    // Add common components
    this.addComponent(k.pos(laneX, randomLaneY));
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

  public override destroy(): void {
    if (this.hitbox) {
      this.hitbox.destroy();
      this.hitbox = null;
    }
    super.destroy();
  }

  public getLane(): number {
    return this.lane;
  }
}
