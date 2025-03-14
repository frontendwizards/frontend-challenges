import { KaboomInterface, GameObj } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";

export interface CloudOptions {
  x?: number;
  y?: number;
  size?: number;
  speed?: number;
}

export default class Cloud extends GameObject {
  private cloudParts: GameObj[] = [];
  private size: number;
  private speed: number;
  private x: number;
  private y: number;

  constructor(kaboomInstance: KaboomInterface, options: CloudOptions = {}) {
    super(kaboomInstance);

    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    this.size = options.size || this.k.rand(40, 80);
    this.speed = options.speed || this.k.rand(10, 30);
    this.x = options.x !== undefined ? options.x : this.k.rand(0, WIDTH);
    this.y =
      options.y !== undefined
        ? options.y
        : this.k.rand(10, HEIGHT * SKY_PERCENTAGE * 0.8);
  }

  public init(): void {
    this.createCloud();
  }

  public update(dt: number): void {
    if (!this.gameObj) return;

    // Move the cloud
    this.gameObj.pos.x -= this.speed * dt;

    // Move all child parts along with the main cloud
    this.cloudParts.forEach((part) => {
      if (part.offsetX !== undefined) {
        part.pos.x = this.gameObj!.pos.x + part.offsetX;
      }
    });

    // If cloud moves off-screen, reposition to the right side
    if (this.gameObj.pos.x < -100) {
      const HEIGHT = GameConfig.CANVAS_HEIGHT;
      const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

      // Reset to right side with new height
      this.gameObj.pos.x = GameConfig.CANVAS_WIDTH + 100;
      this.gameObj.pos.y = this.k.rand(10, HEIGHT * SKY_PERCENTAGE * 0.8);

      // Update child parts positions
      this.cloudParts.forEach((part) => {
        if (part.offsetY !== undefined) {
          part.pos.y = this.gameObj!.pos.y + part.offsetY;
        }
      });
    }
  }

  private createCloud(): void {
    const k = this.k;

    // Clear previous components
    this.components = [];
    this.tags = [];
    this.props = {};

    // Add main cloud circle
    this.addComponent(k.circle(this.size / 2));
    this.addComponent(k.pos(this.x, this.y));
    this.addComponent(k.color(
      GameConfig.CLOUD_COLOR[0],
      GameConfig.CLOUD_COLOR[1],
      GameConfig.CLOUD_COLOR[2],
      GameConfig.CLOUD_COLOR[3]
    ));

    // Add z-index property
    this.addProp("z", -190);

    // Add custom properties for animation
    this.addProp("speed", this.speed);
    this.addProp("cloudParts", this.cloudParts);

    // Create the main cloud object
    this.createGameObj();

    // Add additional circles to make the cloud fluffy
    this.createCloudParts();
  }

  private createCloudParts(): void {
    if (!this.gameObj) return;

    const k = this.k;

    // Clear any existing cloud parts
    this.cloudParts.forEach((part) => part.destroy());
    this.cloudParts = [];

    // Add 3 additional circles to make the cloud fluffy
    for (let i = 0; i < 3; i++) {
      const offsetX = k.rand(-this.size / 2, this.size / 2);
      const offsetY = k.rand(-this.size / 4, this.size / 4);

      const cloudPart = k.add([
        k.circle(this.size / 2.5),
        k.pos(this.gameObj.pos.x + offsetX, this.gameObj.pos.y + offsetY),
        k.color(
          GameConfig.CLOUD_COLOR[0],
          GameConfig.CLOUD_COLOR[1],
          GameConfig.CLOUD_COLOR[2],
          GameConfig.CLOUD_COLOR[3]
        ),
        {
          z: -190,
          parentCloud: this.gameObj,
          offsetX: offsetX,
          offsetY: offsetY,
        },
      ]);

      // Add this part to the cloud parts array
      this.cloudParts.push(cloudPart);
    }

    // Update the cloudParts property on the game object
    if (this.gameObj.cloudParts) {
      this.gameObj.cloudParts = this.cloudParts;
    }
  }

  public override destroy(): void {
    // Destroy all cloud parts
    this.cloudParts.forEach((part) => part.destroy());
    this.cloudParts = [];

    // Destroy the main cloud
    super.destroy();
  }
}
