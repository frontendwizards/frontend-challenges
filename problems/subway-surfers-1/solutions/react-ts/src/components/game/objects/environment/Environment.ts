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
    // this.createHorizon();
    this.createSun();
    this.createRoad();
    // this.createRocks();
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

    // Desert sand ground
    this.ground = k.add([
      k.rect(WIDTH, HEIGHT * (1 - SKY_PERCENTAGE) + 10), // Slight overlap to avoid gaps
      k.pos(0, HEIGHT * SKY_PERCENTAGE - 5), // Start below the sky with slight overlap
      k.color(237, 201, 175), // Sandy desert color
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

    // Add the main road (black asphalt)
    this.road = k.add([
      k.rect(WIDTH, roadHeight),
      k.pos(0, roadTop),
      k.color(40, 40, 40), // Dark asphalt color
      { z: -170 }, // In front of ground but behind game elements
    ]);

    // Add yellow center dividing lines
    const lineWidth = 8;
    const lineLength = 40;
    const gapLength = 30;
    const totalSegmentLength = lineLength + gapLength;
    const numberOfSegments = Math.ceil(WIDTH / totalSegmentLength) + 1;

    // Create center dividing line (double yellow lines)
    for (let i = 0; i < numberOfSegments; i++) {
      // Yellow line
      // this.roadLines.push(
      //   k.add([
      //     k.rect(lineLength, lineWidth),
      //     k.pos(
      //       i * totalSegmentLength,
      //       roadTop + roadHeight / 2 - lineWidth / 2
      //     ),
      //     k.color(255, 215, 0), // Yellow
      //     { z: -169 }, // Slightly in front of road
      //   ])
      // );
    }

    // Add road edges (slightly lighter than road)
    k.add([
      k.rect(WIDTH, 5),
      k.pos(0, roadTop),
      k.color(80, 80, 80), // Light gray
      { z: -169 },
    ]);

    k.add([
      k.rect(WIDTH, 5),
      k.pos(0, roadBottom - 5),
      k.color(80, 80, 80), // Light gray
      { z: -169 },
    ]);
  }

  private createRocks(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;
    const BOTTOM_MARGIN_PERCENTAGE = GameConfig.BOTTOM_MARGIN_PERCENTAGE;

    // Calculate the bottom margin area
    const bottomMarginStart = HEIGHT * (1 - BOTTOM_MARGIN_PERCENTAGE);

    // Add rocks in the bottom margin area
    for (let i = 0; i < 15; i++) {
      const rockSize = k.rand(10, 25);
      const xPos = k.rand(0, WIDTH);
      const yPos = k.rand(bottomMarginStart + 20, HEIGHT - rockSize);

      // Add rock shadow first (behind the rock)
      k.add([
        k.circle(rockSize * 1.1),
        k.pos(xPos + 4, yPos + 4),
        k.color(0, 0, 0, 0.3), // Semi-transparent shadow
        { z: -171 }, // Behind the rock
      ]);

      // Add the rock
      this.rocks.push(
        k.add([
          k.circle(rockSize),
          k.pos(xPos, yPos),
          k.color(60, 60, 60), // Dark gray color for rocks
          { z: -170 }, // In front of road but behind game elements
        ])
      );
    }

    // Add smaller rocks/pebbles in the bottom margin area
    for (let i = 0; i < 30; i++) {
      const rockSize = k.rand(3, 8);
      const xPos = k.rand(0, WIDTH);
      const yPos = k.rand(bottomMarginStart + 10, HEIGHT - rockSize);

      // Add the pebble
      this.rocks.push(
        k.add([
          k.circle(rockSize),
          k.pos(xPos, yPos),
          k.color(80, 80, 80), // Lighter gray color for pebbles
          { z: -170 }, // In front of road but behind game elements
        ])
      );
    }

    // Add some rocks alongside the road too
    const lanes = GameConfig.getLanePositions();
    const roadTop = lanes[0] - 30;
    const roadBottom = lanes[lanes.length - 1] + 30;

    // Rocks on the side of the road
    for (let i = 0; i < 12; i++) {
      const rockSize = k.rand(8, 15);
      const xPos = k.rand(0, WIDTH);
      // Place rocks just outside the road on both top and bottom
      const yPos =
        k.randi(0, 1) === 0
          ? k.rand(roadTop - rockSize * 2, roadTop - rockSize / 2)
          : k.rand(roadBottom + rockSize / 2, roadBottom + rockSize * 2);

      // Add rock shadow
      k.add([
        k.circle(rockSize * 1.1),
        k.pos(xPos + 3, yPos + 3),
        k.color(0, 0, 0, 0.3), // Semi-transparent shadow
        { z: -171 }, // Behind the rock
      ]);

      // Add the rock
      this.rocks.push(
        k.add([
          k.circle(rockSize),
          k.pos(xPos, yPos),
          k.color(60, 60, 60), // Dark gray color for rocks
          { z: -170 }, // In front of road but behind game elements
        ])
      );
    }
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
