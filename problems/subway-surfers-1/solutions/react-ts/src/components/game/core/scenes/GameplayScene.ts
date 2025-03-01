import {
  KaboomInterface,
  ActionReturnType,
  GameObj,
} from "../../types/KaboomTypes";
import { BaseScene } from "./BaseScene";
import GameConfig from "../../config/GameConfig";
import Player from "../../objects/entities/Player";
import Obstacle from "../../objects/entities/Obstacle";
import Coin from "../../objects/entities/Coin";
import Environment from "../../objects/environment/Environment";
import HealthBar from "../../objects/ui/HealthBar";
import ScoreDisplay from "../../objects/ui/ScoreDisplay";

export interface GameplaySceneOptions {
  showHitboxes: boolean;
  showBorders: boolean;
  difficulty: string;
  debugLanes?: boolean;
}

export default class GameplayScene extends BaseScene {
  private score = 0;
  private gameTime = 0;
  private currentLane = GameConfig.PLAYER_INITIAL_LANE;
  private lanes = GameConfig.getLanePositions();
  private showHitboxes: boolean;
  private showBorders: boolean;
  private difficulty: string;
  private debugLanes: boolean;
  private currentObstacleSpeed = 0;
  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];
  private player: Player | null = null;
  private environment: Environment | null = null;
  private healthBar: HealthBar | null = null;
  private scoreDisplay: ScoreDisplay | null = null;
  private obstacleSpawnTimer: ActionReturnType | null = null;
  private coinSpawnTimer: ActionReturnType | null = null;

  // Store lane debug objects
  private laneDebugObjects: GameObj[] = [];

  constructor(
    kaboomInstance: KaboomInterface,
    spriteLoaded: boolean,
    options: GameplaySceneOptions
  ) {
    super(kaboomInstance);
    this.showHitboxes = options.showHitboxes;
    this.showBorders = options.showBorders;
    this.difficulty = options.difficulty;
    this.debugLanes = options.debugLanes || false;
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
    this.obstacles = [];
    this.coins = [];

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
    this.setupGameLoop();
    this.startObstacleSpawning(difficultySettings.spawnInterval);
    this.startCoinSpawning();
  }

  private setupEnvironment(): void {
    // Create environment (sky, ground, sun, clouds)
    this.environment = new Environment(this.k);
    this.environment.init();
  }

  private setupPlayer(): void {
    // Create player
    this.player = new Player(this.k, {
      initialLane: this.currentLane,
      lanes: this.lanes,
      showHitboxes: this.showHitboxes,
      onHealthChange: (health: number) => {
        if (this.healthBar) {
          this.healthBar.updateHealth(health);
        }
      },
    });
    this.player.init();

    // Set score callback
    this.player.setCurrentScoreCallback(() => this.score);
  }

  private setupUI(): void {
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const k = this.k;

    // Create health bar
    this.healthBar = new HealthBar(k, {
      x: WIDTH - 120,
      y: 20,
      width: 80,
      height: 10,
      maxHealth: GameConfig.PLAYER_INITIAL_HEALTH,
    });
    this.healthBar.init();

    // Create score display
    this.scoreDisplay = new ScoreDisplay(k, {
      x: 24,
      y: 24,
      width: 165,
      height: 40,
    });
    this.scoreDisplay.init();
  }

  private setupControls(): void {
    const k = this.k;

    // Player controls (move up and down between lanes)
    k.onKeyPress("up", () => {
      if (this.player) {
        this.player.moveUp();
      }
    });

    k.onKeyPress("down", () => {
      if (this.player) {
        this.player.moveDown();
      }
    });
  }

  private setupGameLoop(): void {
    const k = this.k;

    // Set up global collision handlers
    k.onCollide("player", "coin", () => {
      // Increase score (handled here rather than in Player to keep score in GameplayScene)
      this.score += GameConfig.COIN_SCORE_VALUE;

      // Update score display immediately
      if (this.scoreDisplay) {
        this.scoreDisplay.updateScore(this.score);
      }
    });

    // Main game update loop
    k.onUpdate(() => {
      if (!this.player || !this.player.isPlayerAlive()) return;

      // Make sure we have a valid dt value
      const deltaTime = isNaN(k.dt) || k.dt === 0 ? 1 / 60 : k.dt;

      // Update game time and score
      this.gameTime += deltaTime;
      this.score += deltaTime;

      // Update score display
      if (this.scoreDisplay) {
        this.scoreDisplay.updateScore(this.score);
      }

      // Update player animation
      if (this.player) {
        this.player.update(deltaTime);
      }

      // Update environment
      if (this.environment) {
        this.environment.update(deltaTime);
      }

      // Update obstacles
      this.obstacles.forEach((obstacle, index) => {
        obstacle.update(deltaTime);

        // Remove destroyed obstacles from array
        if (!obstacle.exists()) {
          this.obstacles.splice(index, 1);
        }
      });

      // Update coins
      this.coins.forEach((coin, index) => {
        coin.update();

        // Remove destroyed coins from array
        if (!coin.exists()) {
          this.coins.splice(index, 1);
        }
      });

      // Increase obstacle speed gradually over time
      const speedIncrease = Math.min(
        GameConfig.MAX_SPEED_INCREASE,
        Math.floor(this.gameTime / 10) * 20 // Increase by 20 every 10 seconds
      );
      this.currentObstacleSpeed =
        GameConfig.getDifficultySettings(this.difficulty).obstacleSpeed +
        speedIncrease;

      // Draw debug lanes if enabled
      if (this.debugLanes) {
        this.drawDebugLanes();
      }
    });
  }

  private startObstacleSpawning(spawnInterval: [number, number]): void {
    const k = this.k;

    const spawn = () => {
      if (!this.player || !this.player.isPlayerAlive()) return;

      // Randomly choose a lane (0, 1, or 2)
      const obstacleLane = k.randi(0, GameConfig.LANE_COUNT - 1);

      // Create obstacle
      const obstacle = new Obstacle(this.k, {
        lane: obstacleLane,
        lanes: this.lanes,
        speed: this.currentObstacleSpeed,
        showHitboxes: this.showHitboxes,
        showBorders: this.showBorders,
      });
      obstacle.init();

      // Add to obstacles array
      this.obstacles.push(obstacle);

      // Calculate next spawn time - gradually decrease as score increases
      const minSpawnTime = Math.max(spawnInterval[0] - this.gameTime / 60, 0.3);
      const maxSpawnTime = Math.max(
        spawnInterval[1] - this.gameTime / 30,
        minSpawnTime + 0.5
      );

      // Schedule next obstacle spawn
      this.obstacleSpawnTimer = k.wait(
        k.rand(minSpawnTime, maxSpawnTime),
        spawn
      );
    };

    // Start spawning obstacles
    spawn();
  }

  private startCoinSpawning(): void {
    const k = this.k;

    const spawnCoin = () => {
      if (!this.player || !this.player.isPlayerAlive()) return;

      // Choose a random lane for the coin
      const coinLane = k.randi(0, GameConfig.LANE_COUNT - 1);

      // Check if this lane already has an obstacle near the spawn point
      const hasNearbyObstacle = this.obstacles.some((obstacle) => {
        // If obstacle is in same lane and near the right edge of the screen
        const obstacleObj = obstacle.getGameObj();
        if (
          obstacle.getLane &&
          obstacle.getLane() === coinLane &&
          obstacleObj
        ) {
          // Get screen width
          let screenWidth = 1000; // Default fallback
          try {
            // Use a safer approach to get width
            if (typeof k.width === "function") {
              try {
                screenWidth = (k.width as () => number)();
              } catch (e) {
                console.warn("Error calling width as function", e);
              }
            } else if (typeof k.width === "number") {
              screenWidth = k.width;
            }
          } catch (e) {
            console.warn("Error accessing width", e);
          }
          const distance = obstacleObj.pos.x - screenWidth;
          return (
            Math.abs(distance) < GameConfig.COIN_MIN_DISTANCE_FROM_OBSTACLE
          );
        }
        return false;
      });

      // Only spawn if no nearby obstacles in same lane
      if (!hasNearbyObstacle) {
        // Create coin
        const coin = new Coin(this.k, {
          lane: coinLane,
          lanes: this.lanes,
          speed: this.currentObstacleSpeed,
          showHitboxes: this.showHitboxes,
          showBorders: this.showBorders,
        });
        coin.init();

        // Add to coins array
        this.coins.push(coin);
      }

      // Calculate next spawn time
      const minSpawnTime = GameConfig.COIN_SPAWN_INTERVAL[0];
      const maxSpawnTime = GameConfig.COIN_SPAWN_INTERVAL[1];

      // Schedule next coin spawn
      this.coinSpawnTimer = k.wait(
        k.rand(minSpawnTime, maxSpawnTime),
        spawnCoin
      );
    };

    // Start spawning coins
    spawnCoin();
  }

  public destroy(): void {
    // Clean up all debug objects
    this.laneDebugObjects.forEach((obj) => {
      if (obj.exists()) {
        obj.destroy();
      }
    });
    this.laneDebugObjects = [];

    // Clean up all game objects
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    if (this.environment) {
      this.environment.destroy();
      this.environment = null;
    }

    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }

    if (this.scoreDisplay) {
      this.scoreDisplay.destroy();
      this.scoreDisplay = null;
    }

    // Clean up all obstacles
    this.obstacles.forEach((obstacle) => obstacle.destroy());
    this.obstacles = [];

    // Clean up all coins
    this.coins.forEach((coin) => coin.destroy());
    this.coins = [];

    // Cancel obstacle spawning
    if (this.obstacleSpawnTimer) {
      this.obstacleSpawnTimer.cancel();
      this.obstacleSpawnTimer = null;
    }

    // Cancel coin spawning
    if (this.coinSpawnTimer) {
      this.coinSpawnTimer.cancel();
      this.coinSpawnTimer = null;
    }
  }

  public getCurrentScore(): number {
    return Math.floor(this.score);
  }

  // Add a dedicated function for drawing debug lanes
  private drawDebugLanes(): void {
    // First destroy previous debug objects to avoid accumulation
    this.laneDebugObjects.forEach((obj) => {
      if (obj.exists()) {
        obj.destroy();
      }
    });
    this.laneDebugObjects = [];

    // Draw lanes as red rectangles
    this.lanes.forEach((lane, index) => {
      // Use rect() instead of drawRect()
      const laneRect = this.k.add([
        this.k.rect(GameConfig.CANVAS_WIDTH, 10),
        this.k.pos(0, lane),
        this.k.color(255, 0, 0),
        this.k.z(100), // High z-index to ensure lanes are visible on top
        this.k.outline(2, this.k.rgb(255, 255, 255)),
      ]);

      // Add lane number for easier debugging
      const laneText = this.k.add([
        this.k.text(`Lane ${index}`, { size: 16 }),
        this.k.pos(50, lane - 15),
        this.k.color(255, 255, 0),
        this.k.z(100),
      ]);

      // Store these objects for cleanup on next frame
      this.laneDebugObjects.push(laneRect, laneText);
    });
  }
}
