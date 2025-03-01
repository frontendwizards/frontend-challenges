import { KaboomInterface, GameObj } from "../types/KaboomTypes";
import GameConfig from "../config/GameConfig";

export interface GameSceneConfig {
  name: string;
  create: (k: KaboomInterface, data?: unknown) => void;
}

export default class SceneManager {
  private k: KaboomInterface;
  private scenes: Map<string, GameSceneConfig> = new Map();
  private currentScene: string | null = null;

  constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  public registerScene(config: GameSceneConfig): void {
    this.scenes.set(config.name, config);

    // Register scene with Kaboom
    this.k.scene(config.name, (data: unknown) => {
      config.create(this.k, data);
    });
  }

  public startScene(name: string, data?: unknown): void {
    if (!this.scenes.has(name)) {
      console.error(`Scene ${name} not found`);
      return;
    }

    this.currentScene = name;
    this.k.go(name, data);
  }

  public getCurrentScene(): string | null {
    return this.currentScene;
  }
}

// Base class for scenes with common functionality
export abstract class BaseScene {
  protected k: KaboomInterface;

  constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  public abstract getName(): string;

  public abstract create(data?: unknown): void;

  public register(sceneManager: SceneManager): void {
    sceneManager.registerScene({
      name: this.getName(),
      create: (k, data) => this.create(data),
    });
  }
}

// Game specific scenes
export class GameplayScene extends BaseScene {
  private score = 0;
  private player: GameObj | null = null;
  private currentLane = 1;
  private gameTime = 0;
  private spriteLoadSuccess: boolean;
  private showHitboxes: boolean;
  private showBorders: boolean;
  private difficulty: string;
  private lanes: number[] = [];
  private clouds: GameObj[] = [];
  private currentFrame = 0;
  private animationTimer = 0;
  private healthBar: GameObj | null = null;
  private scoreLabel: GameObj | null = null;
  private currentObstacleSpeed = 0;

  constructor(
    kaboomInstance: KaboomInterface,
    spriteLoaded: boolean,
    options: {
      showHitboxes: boolean;
      showBorders: boolean;
      difficulty: string;
    }
  ) {
    super(kaboomInstance);
    this.spriteLoadSuccess = spriteLoaded;
    this.showHitboxes = options.showHitboxes;
    this.showBorders = options.showBorders;
    this.difficulty = options.difficulty;
  }

  public getName(): string {
    return "game";
  }

  public create(): void {
    // Initialize game variables
    this.score = 0;
    this.gameTime = 0;
    this.currentLane = GameConfig.PLAYER_INITIAL_LANE;
    this.lanes = GameConfig.getLanePositions();

    // Get difficulty settings
    const difficultySettings = GameConfig.getDifficultySettings(
      this.difficulty
    );
    this.currentObstacleSpeed = difficultySettings.obstacleSpeed;

    // Set up game elements
    this.setupEnvironment();
    this.setupPlayer();
    this.setupUI();
    this.setupControls();
    this.setupCloudAnimation();
    this.setupScoreAndDifficulty();
    this.startObstacleSpawning(difficultySettings.spawnInterval);
  }

  private setupEnvironment(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Blue sky (configurable height)
    k.add([
      k.rect(WIDTH, HEIGHT * SKY_PERCENTAGE),
      k.pos(0, 0),
      k.color(135, 206, 235), // Sky blue color
      { z: -200 }, // Place behind everything
    ]);

    // Desert sand (remaining screen height)
    k.add([
      k.rect(WIDTH, HEIGHT * (1 - SKY_PERCENTAGE) + 10), // Slight overlap to avoid gaps
      k.pos(0, HEIGHT * SKY_PERCENTAGE - 5), // Start below the sky with slight overlap
      k.color(217, 185, 142), // Desert sand color
      { z: -180 }, // In front of sky but behind other elements
    ]);

    // Horizon line where sky meets desert
    k.add([
      k.rect(WIDTH, 4),
      k.pos(0, HEIGHT * SKY_PERCENTAGE - 2),
      k.color(200, 170, 120), // Slightly darker than sand
      { z: -185 },
    ]);

    // Add a sun in the corner
    k.add([
      k.circle(60),
      k.pos(WIDTH - 100, HEIGHT * SKY_PERCENTAGE * 0.4), // Position relative to sky height
      k.color(255, 220, 100),
      { z: -150 },
    ]);

    // Add clouds
    this.createClouds();
  }

  private createClouds(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;
    const SKY_PERCENTAGE = GameConfig.SKY_PERCENTAGE;

    // Create moving clouds in the sky
    for (let i = 0; i < 8; i++) {
      const cloudSize = k.rand(40, 80);
      const xPos = k.rand(0, WIDTH);
      const yPos = k.rand(10, HEIGHT * SKY_PERCENTAGE * 0.8); // Keep clouds in the sky
      const cloudSpeed = k.rand(10, 30); // Random speed for each cloud

      // Create a cloud object with multiple circles
      const mainCloud = k.add([
        k.circle(cloudSize / 2),
        k.pos(xPos, yPos),
        k.color(255, 255, 255, 0.8),
        { z: -190 },
        // Add custom properties for animation
        {
          speed: cloudSpeed,
          cloudParts: [] as GameObj[], // Store additional cloud circles
        },
      ]);

      // Add additional circles to make the cloud fluffy
      for (let j = 0; j < 3; j++) {
        const offsetX = k.rand(-cloudSize / 2, cloudSize / 2);
        const offsetY = k.rand(-cloudSize / 4, cloudSize / 4);

        const cloudPart = k.add([
          k.circle(cloudSize / 2.5),
          k.pos(xPos + offsetX, yPos + offsetY),
          k.color(255, 255, 255, 0.7),
          { z: -190 },
          {
            parentCloud: mainCloud,
            offsetX: offsetX,
            offsetY: offsetY,
          },
        ]);

        // Add this part to the main cloud's parts array
        mainCloud.cloudParts.push(cloudPart);
      }

      // Add the cloud to our tracking array
      this.clouds.push(mainCloud);
    }
  }

  private setupCloudAnimation(): void {
    const k = this.k;

    // Cloud movement animation in game update loop
    k.onUpdate(() => {
      // Move all clouds
      this.clouds.forEach((cloud) => {
        // Make sure we have a valid dt value (fallback to 1/60 if dt is NaN or 0)
        const deltaTime = isNaN(k.dt) || k.dt === 0 ? 1 / 60 : k.dt;

        // Move the main cloud part
        cloud.pos.x -= cloud.speed * deltaTime;

        // Move all child parts along with the main cloud
        cloud.cloudParts.forEach((part) => {
          part.pos.x = cloud.pos.x + part.offsetX;
        });

        // If cloud moves off-screen, reposition to the right side
        if (cloud.pos.x < -100) {
          // Reset to right side with new height
          cloud.pos.x = GameConfig.CANVAS_WIDTH + 100;
          cloud.pos.y = k.rand(
            10,
            GameConfig.CANVAS_HEIGHT * GameConfig.SKY_PERCENTAGE * 0.8
          );

          // Update child parts positions
          cloud.cloudParts.forEach((part) => {
            part.pos.y = cloud.pos.y + part.offsetY;
          });
        }
      });
    });
  }

  private setupPlayer(): void {
    const k = this.k;
    const spriteLoadSuccess = this.spriteLoadSuccess;

    // Add player character
    this.player = k.add([
      k.sprite("run0", { noError: true }) || k.circle(20),
      // Add outline and color only if using circle
      ...(spriteLoadSuccess
        ? []
        : [k.outline(2, k.rgb(255, 255, 255)), k.color(255, 0, 0)]),
      k.pos(GameConfig.PLAYER_POSITION_X, this.lanes[this.currentLane]),
      k.anchor("center"),
      k.area({ scale: 0.7 }),
      "player",
      {
        speed: GameConfig.PLAYER_SPEED,
        isAlive: true,
        health: GameConfig.PLAYER_INITIAL_HEALTH,
      },
      k.scale(GameConfig.SPRITE_SCALE),
    ]);

    // If showing hitboxes, add a visible outline to the player's collision area
    if (this.showHitboxes && this.player) {
      const playerHitbox = k.add([
        k.rect(this.player.width * 0.7, this.player.height * 0.7),
        k.pos(GameConfig.PLAYER_POSITION_X, this.lanes[this.currentLane]),
        k.anchor("center"),
        k.outline(2, k.rgb(0, 255, 0)),
        k.color(0, 255, 0, 0.3),
        "playerHitbox",
      ]);

      // Keep hitbox synced with player
      k.onUpdate(() => {
        if (this.player && this.player.isAlive && playerHitbox) {
          playerHitbox.pos = this.player.pos;
        }
      });
    }

    // Animate character manually
    this.setupPlayerAnimation();
  }

  private setupPlayerAnimation(): void {
    const k = this.k;
    const spriteLoadSuccess = this.spriteLoadSuccess;

    // Animate Temple Run character manually without breaking collision
    k.onUpdate(() => {
      if (this.player && this.player.isAlive && spriteLoadSuccess) {
        // Make sure we have a valid dt value (fallback to 1/60 if dt is NaN or 0)
        const deltaTime = isNaN(k.dt) || k.dt === 0 ? 1 / 60 : k.dt;

        this.animationTimer += deltaTime;
        if (this.animationTimer > 0.1) {
          // Change frame every 100ms
          this.animationTimer = 0;
          const newFrame = (this.currentFrame + 1) % 10;

          // Save current position and state
          const oldLane = this.currentLane;
          const oldHealth =
            this.player.health || GameConfig.PLAYER_INITIAL_HEALTH;

          // Destroy old player
          this.player.destroy();

          // Recreate player with new frame
          this.player = k.add([
            k.sprite(`run${newFrame}`, { noError: true }) || k.circle(20),
            ...(spriteLoadSuccess
              ? []
              : [k.outline(2, k.rgb(255, 255, 255)), k.color(255, 0, 0)]),
            k.pos(GameConfig.PLAYER_POSITION_X, this.lanes[oldLane]),
            k.anchor("center"),
            k.area({ scale: 0.7 }),
            "player",
            {
              speed: GameConfig.PLAYER_SPEED,
              isAlive: true,
              health: oldHealth,
            },
            k.scale(GameConfig.SPRITE_SCALE),
          ]);

          // Update collision handler
          this.setupPlayerCollision();

          // Update current frame
          this.currentFrame = newFrame;
        }
      }
    });
  }

  private setupPlayerCollision(): void {
    const k = this.k;

    if (this.player) {
      // Collision detection
      this.player.onCollide("obstacle", (obstacle: GameObj) => {
        // Remove the obstacle when hit
        obstacle.destroy();

        if (this.player) {
          // Decrease health
          if (this.player.health) {
            this.player.health--;
          }

          if (this.healthBar && this.healthBar.updateHealth) {
            this.healthBar.updateHealth(this.player.health || 0);
          }

          // Shake screen for feedback
          k.shake(5);

          // Check if player ran out of health
          if (this.player.health && this.player.health <= 0) {
            this.player.isAlive = false;
            k.shake(12);
            k.wait(0.4, () => {
              k.go("gameover", Math.floor(this.score));
            });
          }
        }
      });
    }
  }

  private setupUI(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;

    // Health display
    k.add([
      k.rect(100, 60), // Make taller to include both text and bar
      k.pos(WIDTH - 120, 20),
      k.outline(2, k.rgb(255, 255, 255)),
      k.color(0, 0, 0, 0.7), // Semi-transparent black
      { z: 100 }, // Keep above other elements
    ]);

    k.add([
      k.text("HEALTH", { size: 16 }),
      k.pos(WIDTH - 120 + 50, 20 + 15),
      k.anchor("center"),
      k.color(255, 255, 255),
      { z: 101 }, // Above container
    ]);

    this.healthBar = k.add([
      k.rect(80, 10),
      k.pos(WIDTH - 110, 60),
      k.color(0, 255, 0),
      {
        z: 101, // Above container
        updateHealth: function (health: number) {
          this.width = (health / 3) * 80;
          if (health <= 1) this.color = k.rgb(255, 0, 0);
          else if (health === 2) this.color = k.rgb(255, 255, 0);
        },
      },
    ]);

    // Score display
    k.add([
      k.rect(150, 40), // Background size for score
      k.pos(24, 24),
      k.color(0, 0, 0, 0.7), // Semi-transparent black background
      k.fixed(),
      k.outline(2, k.rgb(255, 255, 255)),
      { z: 100 }, // Ensure it's above other elements
    ]);

    this.scoreLabel = k.add([
      k.text("Score: 0", { size: 24 }),
      k.pos(24 + 10, 24 + 20), // Slight padding inside the background
      k.anchor("left"),
      k.color(255, 255, 255), // Keep white text but now against dark background
      k.fixed(),
      { value: 0, z: 101 }, // Ensure text is above background
    ]);
  }

  private setupControls(): void {
    const k = this.k;

    // Player controls (move up and down between lanes)
    k.onKeyPress("up", () => {
      if (this.player && this.player.isAlive && this.currentLane > 0) {
        this.currentLane--;
        this.player.moveTo(
          GameConfig.PLAYER_POSITION_X,
          this.lanes[this.currentLane]
        );
      }
    });

    k.onKeyPress("down", () => {
      if (this.player && this.player.isAlive && this.currentLane < 2) {
        this.currentLane++;
        this.player.moveTo(
          GameConfig.PLAYER_POSITION_X,
          this.lanes[this.currentLane]
        );
      }
    });
  }

  private setupScoreAndDifficulty(): void {
    const k = this.k;

    // Update score and progressively increase difficulty
    k.onUpdate(() => {
      if (this.player && this.player.isAlive) {
        // Make sure we have a valid dt value (fallback to 1/60 if dt is NaN or 0)
        const deltaTime = isNaN(k.dt) || k.dt === 0 ? 1 / 60 : k.dt;

        // Update game time and score
        this.gameTime += deltaTime;
        this.score += deltaTime;

        if (this.scoreLabel) {
          this.scoreLabel.value = Math.floor(this.score);
          this.scoreLabel.text = `Score: ${this.scoreLabel.value}`;
        }

        // Increase obstacle speed gradually over time
        // This makes the game progressively harder the longer you play
        const speedIncrease = Math.min(
          GameConfig.MAX_SPEED_INCREASE,
          Math.floor(this.gameTime / 10) * 20 // Increase by 20 every 10 seconds
        );
        this.currentObstacleSpeed =
          GameConfig.getDifficultySettings(this.difficulty).obstacleSpeed +
          speedIncrease;
      }
    });
  }

  private startObstacleSpawning(spawnInterval: [number, number]): void {
    const k = this.k;
    const spawn = () => {
      if (!this.player || !this.player.isAlive) return;

      // Randomly choose a lane
      const obstacleLane = k.randi(0, 3);

      // Randomly choose one of the 10 obstacle sprites
      const obstacleIndex = k.randi(0, 10);
      const spriteName = `obstacle${obstacleIndex}`;

      // Random size variation to make gameplay more dynamic
      const sizeVariation = k.rand(0.7, 1.1);

      // Make sure we have a valid speed value
      const speed = isNaN(this.currentObstacleSpeed)
        ? GameConfig.getDifficultySettings(this.difficulty).obstacleSpeed
        : this.currentObstacleSpeed;

      // Create obstacle
      const obstacleObj = k.add([
        k.sprite(spriteName, { noError: true }) || k.rect(60, 60),
        // Add outline based on showBorders state
        ...(this.showBorders ? [k.outline(2, k.rgb(255, 0, 0))] : []),
        k.pos(GameConfig.CANVAS_WIDTH, this.lanes[obstacleLane]),
        k.anchor("center"),
        k.area({ scale: 0.8 }), // More accurate hitbox
        k.move(k.LEFT, speed), // Use the current speed that increases over time
        "obstacle",
        k.scale(GameConfig.OBSTACLE_SCALE * sizeVariation), // Add some size variation
        {
          // Override default render function to handle white pixels
          draw() {
            // This is effectively saying "use the sprite but make white transparent"
            this.use(k.color(255, 255, 255, 0));
          },
        },
      ]);

      // If showing hitboxes, draw a visible outline around the hitbox
      if (this.showHitboxes) {
        const hitboxWidth = obstacleObj.width * 0.8;
        const hitboxHeight = obstacleObj.height * 0.8;

        const hitbox = k.add([
          k.rect(hitboxWidth, hitboxHeight),
          k.pos(obstacleObj.pos.x, obstacleObj.pos.y),
          k.anchor("center"),
          k.outline(2, k.rgb(255, 0, 0)),
          k.color(255, 0, 0, 0.3),
          k.move(k.LEFT, speed),
        ]);

        // Keep the hitbox visualization synced with the obstacle
        hitbox.onUpdate(() => {
          if (obstacleObj.exists()) {
            hitbox.pos = obstacleObj.pos;
          } else {
            hitbox.destroy();
          }
        });
      }

      // Calculate next spawn time - gradually decrease as score increases
      const minSpawnTime = Math.max(spawnInterval[0] - this.gameTime / 60, 0.3);
      const maxSpawnTime = Math.max(
        spawnInterval[1] - this.gameTime / 30,
        minSpawnTime + 0.5
      );

      // Schedule next obstacle spawn
      k.wait(k.rand(minSpawnTime, maxSpawnTime), spawn);
    };

    // Start spawning obstacles
    spawn();
  }
}

export class GameOverScene extends BaseScene {
  public getName(): string {
    return "gameover";
  }

  public create(finalScore?: unknown): void {
    const k = this.k;
    const center = k.center();

    // Create game over UI with score and restart option
    k.add([
      k.text(`Game Over!\nScore: ${finalScore}\nPress space to restart`, {
        size: 36,
        align: "center",
      }),
      k.pos(center[0], center[1]),
      k.anchor("center"),
    ]);

    // Restart game on spacebar press
    k.onKeyPress("space", () => {
      k.go("game");
    });
  }
}

export class SpritePreviewScene extends BaseScene {
  public getName(): string {
    return "spritePreview";
  }

  public create(): void {
    const k = this.k;
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const HEIGHT = GameConfig.CANVAS_HEIGHT;

    // Background
    k.add([
      k.rect(WIDTH, HEIGHT),
      k.color(20, 20, 20), // Dark gray background
    ]);

    // Add title
    k.add([
      k.text("Sprite Animation Preview", { size: 32 }),
      k.pos(WIDTH / 2, 50),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    // Try to add the animated sprite
    try {
      const animatedSprite = k.add([
        k.sprite("run0", { noError: true }),
        k.pos(WIDTH / 2, HEIGHT / 2),
        k.anchor("center"),
        k.scale(0.3), // Scale down to proper size
      ]);
    } catch (e) {
      // If sprite loading fails, add a message
      k.add([
        k.text("Sprite could not be loaded", { size: 20 }),
        k.pos(WIDTH / 2, HEIGHT / 2),
        k.anchor("center"),
        k.color(255, 100, 100),
      ]);
    }

    // Instructions for going back to the game
    k.add([
      k.text("Press SPACE to go to the game", { size: 16 }),
      k.pos(WIDTH / 2, HEIGHT - 20),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    // Key binding to switch to game
    k.onKeyPress("space", () => {
      k.go("game");
    });
  }
}
