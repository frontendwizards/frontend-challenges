import {
  KaboomInterface,
  ActionReturnType,
  GameObj,
} from "../../types/KaboomTypes";
import { BaseScene } from "./BaseScene";
import GameConfig, { DifficultySettings } from "../../config/GameConfig";
import Player from "../../objects/entities/Player";
import Obstacle from "../../objects/entities/Obstacle";
import Coin from "../../objects/entities/Coin";
import Environment from "../../objects/environment/Environment";
import HealthBar from "../../objects/ui/HealthBar";
import ScoreDisplay from "../../objects/ui/ScoreDisplay";
import DebugDisplay from "../../objects/ui/DebugDisplay";
import { LaneSafetyChecker } from "../../utils/LaneSafetyChecker";
import { TimeManager } from "../../utils/TimeManager";

export interface GameplaySceneOptions {
  showHitboxes: boolean;
  difficulty: string;
}

enum EntityType {
  OBSTACLE = "obstacle",
  COIN = "coin",
}

export default class GameplayScene extends BaseScene {
  private score = 0;
  private currentLane = GameConfig.PLAYER_INITIAL_LANE;
  private lanes = GameConfig.getLanePositions();
  private showHitboxes: boolean;
  private difficulty: string;
  private currentGameSpeed = 0;
  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];
  private player: Player | null = null;
  private environment: Environment | null = null;
  private healthBar: HealthBar | null = null;
  private scoreDisplay: ScoreDisplay | null = null;
  private debugDisplay: DebugDisplay | null = null;
  private spawnTimer: ActionReturnType | null = null;
  private isPaused: boolean = false;
  private nextSpawnType: EntityType = EntityType.OBSTACLE;
  private difficultySettings: DifficultySettings;

  // Store lane debug objects
  private laneDebugObjects: GameObj[] = [];

  constructor(kaboomInstance: KaboomInterface, options: GameplaySceneOptions) {
    super(kaboomInstance);
    this.showHitboxes = options.showHitboxes;
    this.difficulty = options.difficulty;
    // Get difficulty settings
    this.difficultySettings = GameConfig.getDifficultySettings(this.difficulty);
    // Initialize the TimeManager with Kaboom instance
    TimeManager.initialize(kaboomInstance);
  }

  private attemptSpawn(): number {
    const safeLane = this.findSafeLane(
      GameConfig.COIN_MIN_DISTANCE_FROM_OBSTACLE
    );

    if (safeLane === LaneSafetyChecker.NO_SAFE_LANE) {
      return LaneSafetyChecker.NO_SAFE_LANE;
    }

    if (this.nextSpawnType === EntityType.OBSTACLE) {
      this.createObstacle(safeLane);
      this.nextSpawnType = EntityType.COIN;
    } else {
      this.createCoin(safeLane);
      this.nextSpawnType = EntityType.OBSTACLE;
    }

    return safeLane;
  }

  public getName(): string {
    return "game";
  }

  public create(): void {
    // Initialize game variables
    this.score = 0;
    this.currentLane = GameConfig.PLAYER_INITIAL_LANE;
    this.lanes = GameConfig.getLanePositions();
    this.obstacles = [];
    this.coins = [];

    this.currentGameSpeed = this.difficultySettings.obstacleSpeed;

    // Set up game elements
    this.setupEnvironment();
    this.setupPlayer();
    this.setupUI();
    this.setupControls();
    this.setupGameLoop();

    // Start entity spawning system
    this.startEntitySpawning(this.difficultySettings.spawnInterval);
  }

  private setupEnvironment(): void {
    // Create environment (sky, ground, sun, clouds)
    this.environment = new Environment(this.k);
    this.environment.init();
  }

  private setupPlayer(): void {
    const getCurrentScore = () => this.score;
    // Create player
    this.player = new Player(this.k, {
      initialLane: this.currentLane,
      lanes: this.lanes,
      showHitboxes: this.showHitboxes,
      sceneManager: this.sceneManager!,
      onHealthChange: (health: number) => {
        this.healthBar?.updateHealth(health);
      },
      getCurrentScoreCallback: getCurrentScore,
    });

    this.player.init();
  }

  private setupUI(): void {
    const WIDTH = GameConfig.CANVAS_WIDTH;
    const k = this.k;

    // Create health bar
    this.healthBar = new HealthBar(k, {
      x: WIDTH - 120,
      y: 20,
      width: 100,
      height: 8,
      maxHealth: GameConfig.PLAYER_INITIAL_HEALTH,
    });
    this.healthBar.init();

    // Create score display
    this.scoreDisplay = new ScoreDisplay(k, {
      x: 20,
      y: 20,
      width: 120,
      height: 40,
    });
    this.scoreDisplay.init();

    // Create debug display
    this.debugDisplay = new DebugDisplay(k, {
      x: WIDTH - 120,
      y: 60,
    });
    this.debugDisplay.init();
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
      this.player?.moveDown();
    });
  }

  private setupGameLoop(): void {
    const k = this.k;

    // Set up global collision handlers
    k.onCollide("player", "coin", (_, coinObj) => {
      // Find the coin instance
      const coin = this.coins.find((c) => c.getGameObj() === coinObj);
      if (!coin || coin.hasProp("collected")) {
        return;
      }

      // Increase score
      this.score += GameConfig.COIN_SCORE_VALUE;
      // Update score display immediately
      this.scoreDisplay?.updateScore(this.score);
      // Collect the coin (which will play sound and destroy it)
      coin.collect();
    });

    // Main game update loop
    k.onUpdate(() => {
      // Skip update if game is paused or player is dead
      if (this.isPaused || !this.player || !this.player.isPlayerAlive()) return;

      // Get delta time from TimeManager singleton
      const deltaTime = TimeManager.getInstance().getDeltaTime();

      this.score += deltaTime;

      // Update score display
      this.scoreDisplay?.updateScore(this.score);

      // Update debug display
      this.debugDisplay?.update();

      // Update player animation
      this.player?.update();

      // Update environment
      this.environment?.update();

      // Update obstacles
      this.obstacles.forEach((obstacle, index) => {
        obstacle.update();

        // Remove destroyed obstacles from array
        if (!obstacle.exists()) {
          this.obstacles.splice(index, 1);
        }
      });

      this.scoreDisplay?.update();

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
        Math.floor(deltaTime / 10) * 20 // Increase by 20 every 10 seconds
      );

      this.currentGameSpeed =
        this.difficultySettings.obstacleSpeed + speedIncrease;
    });
  }

  /**
   * Creates a coin at the specified lane
   */
  private createCoin(lane: number): Coin {
    const coin = new Coin(this.k, {
      lane,
      lanes: this.lanes,
      speed: this.currentGameSpeed,
      showHitboxes: this.showHitboxes,
    });
    coin.init();
    this.coins.push(coin);
    return coin;
  }

  /**
   * Creates an obstacle at the specified lane
   */
  private createObstacle(lane: number): Obstacle {
    const obstacle = new Obstacle(this.k, {
      lane: lane,
      lanes: this.lanes,
      speed: this.currentGameSpeed,
      showHitboxes: this.showHitboxes,
    });
    obstacle.init();
    this.obstacles.push(obstacle);
    return obstacle;
  }

  private startEntitySpawning(spawnInterval: [number, number]): void {
    const k = this.k;

    const scheduleNextSpawn = () => {
      if (!this.player || !this.player.isPlayerAlive()) return;

      const safeLane = this.attemptSpawn();

      if (safeLane === LaneSafetyChecker.NO_SAFE_LANE) {
        // If no safe lane is found, try again after a short delay
        // Don't change nextSpawnType - keep trying same type until success
        this.spawnTimer = k.wait(0.1, scheduleNextSpawn);
        return;
      }

      const [minTime, maxTime] = spawnInterval;
      const nextSpawnTime = k.rand(minTime, maxTime);

      // Schedule next spawn
      this.spawnTimer = k.wait(nextSpawnTime, scheduleNextSpawn);
    };

    // Start spawning cycle
    scheduleNextSpawn();
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

    if (this.debugDisplay) {
      this.debugDisplay.destroy();
      this.debugDisplay = null;
    }

    // Clean up all obstacles
    this.obstacles.forEach((obstacle) => obstacle.destroy());
    this.obstacles = [];

    // Clean up all coins
    this.coins.forEach((coin) => coin.destroy());
    this.coins = [];

    // Update timer cleanup
    if (this.spawnTimer) {
      this.spawnTimer.cancel();
      this.spawnTimer = null;
    }
  }

  public getCurrentScore(): number {
    return Math.floor(this.score);
  }

  public pause(): void {
    if (this.isPaused) return;

    this.isPaused = true;

    if (this.spawnTimer) {
      this.spawnTimer.cancel();
      this.spawnTimer = null;
    }
  }

  public resume(): void {
    if (!this.isPaused) return;

    this.isPaused = false;

    // Restart spawn system with appropriate difficulty settings
    if (!this.spawnTimer) {
      this.startEntitySpawning(this.difficultySettings.spawnInterval);
    }
  }

  /**
   * Find the safest lane for spawning an entity
   */
  private findSafeLane(safetyDistance: number): number {
    return LaneSafetyChecker.findSafeLane(
      this.obstacles,
      this.coins,
      safetyDistance
    );
  }
}
