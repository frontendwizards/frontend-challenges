import { KaboomInterface } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";
import Cloud from "./Cloud";

export default class Environment extends GameObject {
  private clouds: Cloud[] = [];
  private sky: any = null;
  private ground: any = null;
  private horizon: any = null;
  private sun: any = null;

  constructor(kaboomInstance: KaboomInterface) {
    super(kaboomInstance);
  }

  public init(): void {
    this.createSky();
    this.createGround();
    this.createHorizon();
    this.createSun();
    this.createClouds();
  }

  public update(dt: number): void {
    // Update all clouds
    this.clouds.forEach((cloud) => cloud.update(dt));
  }

  private createSky(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Blue sky (configurable height)
    this.sky = k.add([
      k.rect(WIDTH, HEIGHT * SKY_PERCENTAGE),
      k.pos(0, 0),
      k.color(135, 206, 235), // Sky blue color
      { z: -200 }, // Place behind everything
    ]);
  }

  private createGround(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Desert sand (remaining screen height)
    this.ground = k.add([
      k.rect(WIDTH, HEIGHT * (1 - SKY_PERCENTAGE) + 10), // Slight overlap to avoid gaps
      k.pos(0, HEIGHT * SKY_PERCENTAGE - 5), // Start below the sky with slight overlap
      k.color(217, 185, 142), // Desert sand color
      { z: -180 }, // In front of sky but behind other elements
    ]);
  }

  private createHorizon(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Horizon line where sky meets desert
    this.horizon = k.add([
      k.rect(WIDTH, 4),
      k.pos(0, HEIGHT * SKY_PERCENTAGE - 2),
      k.color(200, 170, 120), // Slightly darker than sand
      { z: -185 },
    ]);
  }

  private createSun(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Add a sun in the corner
    this.sun = k.add([
      k.circle(60),
      k.pos(WIDTH - 100, HEIGHT * SKY_PERCENTAGE * 0.4), // Position relative to sky height
      k.color(255, 220, 100),
      { z: -150 },
    ]);
  }

  private createClouds(): void {
    // Create 8 clouds
    for (let i = 0; i < 8; i++) {
      const cloud = new Cloud(this.k);
      cloud.init();
      this.clouds.push(cloud);
    }
  }

  public override destroy(): void {
    // Destroy all clouds
    this.clouds.forEach((cloud) => cloud.destroy());
    this.clouds = [];

    // Destroy environment elements
    if (this.sky) {
      this.sky.destroy();
      this.sky = null;
    }

    if (this.ground) {
      this.ground.destroy();
      this.ground = null;
    }

    if (this.horizon) {
      this.horizon.destroy();
      this.horizon = null;
    }

    if (this.sun) {
      this.sun.destroy();
      this.sun = null;
    }

    super.destroy();
  }
}
