import { KaboomInterface, GameObj } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";
import Cloud from "./Cloud";

export default class Environment extends GameObject {
  private clouds: Cloud[] = [];
  private sky: GameObj | null = null;
  private ground: GameObj | null = null;
  private horizon: GameObj | null = null;
  private sun: GameObj | null = null;

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

    // Night sky
    this.sky = k.add([
      k.rect(WIDTH, HEIGHT * SKY_PERCENTAGE),
      k.pos(0, 0),
      k.color(k.rgb(GameConfig.SKY_COLOR)),
      { z: -200 }, // Place behind everything
    ]);

    // Add some stars to the night sky
    for (let i = 0; i < 50; i++) {
      k.add([
        k.circle(k.rand(1, 2)),
        k.pos(k.rand(0, WIDTH), k.rand(0, HEIGHT * SKY_PERCENTAGE * 0.9)),
        k.color(255, 255, 255, k.rand(0.5, 1)),
        { z: -199 }, // Just in front of sky
      ]);
    }
  }

  private createGround(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Dark ground for night scene
    this.ground = k.add([
      k.rect(WIDTH, HEIGHT * (1 - SKY_PERCENTAGE) + 10), // Slight overlap to avoid gaps
      k.pos(0, HEIGHT * SKY_PERCENTAGE - 5), // Start below the sky with slight overlap
      k.color(k.rgb(GameConfig.GROUND_COLOR)),
      { z: -180 }, // In front of sky but behind other elements
    ]);
  }

  private createHorizon(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Horizon line where sky meets ground
    this.horizon = k.add([
      k.rect(WIDTH, 4),
      k.pos(0, HEIGHT * SKY_PERCENTAGE - 2),
      k.color(k.rgb(GameConfig.HORIZON_COLOR)),
      { z: -185 },
    ]);
  }

  private createSun(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Add a moon in the corner (renamed method but kept the same for compatibility)
    this.sun = k.add([
      k.circle(60),
      k.pos(WIDTH - 100, HEIGHT * SKY_PERCENTAGE * 0.3), // Position relative to sky height
      k.color(k.rgb(GameConfig.SUN_COLOR)),
      { z: -150 },
    ]);

    // Add crescent moon effect by overlapping a slightly offset dark circle
    k.add([
      k.circle(55),
      k.pos(WIDTH - 80, HEIGHT * SKY_PERCENTAGE * 0.3 - 5), // Slightly offset to create crescent
      k.color(k.rgb(GameConfig.SKY_COLOR)), // Same as sky color
      { z: -149 }, // Slightly in front of moon
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
