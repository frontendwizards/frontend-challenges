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
  private road: GameObj | null = null;
  private roadLines: GameObj[] = [];
  private rocks: GameObj[] = [];

  constructor(kaboomInstance: KaboomInterface) {
    super(kaboomInstance);
  }

  public init(): void {
    this.createSky();
    this.createGround();
    this.createSun();
    this.createRoad();
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
      k.color(10, 17, 40), // Dark blue night sky
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

    // Night desert ground - darker cooler tones
    this.ground = k.add([
      k.rect(WIDTH, HEIGHT * (1 - SKY_PERCENTAGE) + 10), // Slight overlap to avoid gaps
      k.pos(0, HEIGHT * SKY_PERCENTAGE - 5), // Start below the sky with slight overlap
      k.color(71, 66, 79), // Dark desert color with blue/purple tint for night
      { z: -180 }, // In front of sky but behind other elements
    ]);
  }

  private createSun(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Add a moon in the corner
    this.sun = k.add([
      k.circle(60),
      k.pos(WIDTH - 100, HEIGHT * SKY_PERCENTAGE * 0.3), // Position relative to sky height
      k.color(232, 233, 235), // Off-white/silver color for moon
      { z: -150 },
    ]);

    // Add crescent moon effect by overlapping a slightly offset dark circle
    k.add([
      k.circle(55),
      k.pos(WIDTH - 80, HEIGHT * SKY_PERCENTAGE * 0.3 - 5), // Slightly offset to create crescent
      k.color(10, 17, 40), // Same as sky color
      { z: -149 }, // Slightly in front of moon
    ]);
  }

  private createRoad(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const lanes = GameConfig.getLanePositions();
    const BOTTOM_MARGIN = HEIGHT * GameConfig.BOTTOM_MARGIN_PERCENTAGE;

    // Calculate road placement with respect to the bottom margin
    const roadTop = lanes[0] - 30; // Start a bit above the first lane
    const roadBottom = lanes[lanes.length - 1] + 80; // End a bit below the last lane
    const roadHeight = roadBottom - roadTop;

    // Add the main road (dark asphalt)
    this.road = k.add([
      k.rect(WIDTH, roadHeight),
      k.pos(0, roadTop),
      k.color(30, 30, 35), // Darker asphalt color for night
      { z: -170 }, // In front of ground but behind game elements
    ]);

    // Add road edges (slightly lighter than road)
    k.add([
      k.rect(WIDTH, 5),
      k.pos(0, roadTop),
      k.color(60, 60, 65), // Light gray for edge
      { z: -169 },
    ]);

    k.add([
      k.rect(WIDTH, 5),
      k.pos(0, roadBottom - 5),
      k.color(60, 60, 65), // Light gray for edge
      { z: -169 },
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

    // Destroy road
    if (this.road) {
      this.road.destroy();
      this.road = null;
    }

    // Destroy road lines
    this.roadLines.forEach((line) => {
      if (line) line.destroy();
    });
    this.roadLines = [];

    // Destroy rocks
    this.rocks.forEach((rock) => rock.destroy());
    this.rocks = [];

    super.destroy();
  }
}
