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
import DebugDisplay from "../../objects/ui/DebugDisplay";
import { GameUtils } from "../../utils/GameUtils";

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
  private gameTime = 0;
  private currentLane = GameConfig.PLAYER_INITIAL_LANE;
  private lanes = GameConfig.getLanePositions();
  private showHitboxes: boolean;
  private difficulty: string;
  private currentObstacleSpeed = 0;
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

  // Store lane debug objects
  private laneDebugObjects: GameObj[] = [];

  constructor(kaboomInstance: KaboomInterface, options: GameplaySceneOptions) {
    super(kaboomInstance);
    this.showHitboxes = options.showHitboxes;
    this.difficulty = options.difficulty;
  }

  private attemptSpawn(): void {
    const randomLane = this.findSafeLane(
      GameConfig.COIN_MIN_DISTANCE_FROM_OBSTACLE
    );

    console.log("nextSpawnType", this.nextSpawnType, randomLane);

    if (this.nextSpawnType === EntityType.OBSTACLE) {
      this.createObstacle(randomLane);
      this.nextSpawnType = EntityType.COIN;
    } else {
      this.createCoin(randomLane);
      this.nextSpawnType = EntityType.OBSTACLE;
    }
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

    // Start entity spawning system
    this.startEntitySpawning(difficultySettings.spawnInterval);
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

    // Create health bar (more minimal)
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
      if (!coin) {
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

      // Make sure we have a valid dt value
      const deltaTime = isNaN(k.dt) || k.dt === 0 ? 1 / 60 : k.dt;

      // Update game time and score
      this.gameTime += deltaTime;
      this.score += deltaTime;

      // Update score display
      this.scoreDisplay?.updateScore(this.score);

      // Update debug display
      this.debugDisplay?.update();

      // Update player animation
      this.player?.update(deltaTime);

      // Update environment
      this.environment?.update(deltaTime);

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
        Math.floor(this.gameTime / 10) * 20 // Increase by 20 every 10 seconds
      );
      this.currentObstacleSpeed =
        GameConfig.getDifficultySettings(this.difficulty).obstacleSpeed +
        speedIncrease;
    });
  }

  /**
   * Creates a coin at the specified lane
   */
  private createCoin(lane: number): Coin {
    const coin = new Coin(this.k, {
      lane,
      lanes: this.lanes,
      speed: this.currentObstacleSpeed,
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
      speed: this.currentObstacleSpeed,
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

      this.attemptSpawn();

      // Simple spawn timing with minimum safety threshold
      const [minTime, maxTime] = spawnInterval;

      // Schedule next spawn between min and max time
      const nextSpawnTime = k.rand(minTime, maxTime);

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
    const difficultySettings = GameConfig.getDifficultySettings(
      this.difficulty
    );
    if (!this.spawnTimer) {
      this.startEntitySpawning(difficultySettings.spawnInterval);
    }
  }

  /**
   * Checks if a lane has any obstacles too close to a specific position
   */
  private isLaneSafeFromObstacles(
    lane: number,
    spawnPosX: number,
    safetyDistance: number
  ): boolean {
    // Find the last obstacle in the specified lane (non-mutating approach)
    const lastObstacleInLane = [...this.obstacles]
      .reverse()
      .find((obs) => obs.getLane() === lane);

    if (!lastObstacleInLane) {
      return true;
    }

    const obstacleObj = lastObstacleInLane.getGameObj();
    if (!obstacleObj) return true;

    // Check if obstacle is too close to spawn position
    const obstaclePos = obstacleObj.pos.x;

    // Consider obstacle width for more accurate safety check
    const obstacleWidth = obstacleObj.width;
    const entityWidth = GameConfig.COIN_WIDTH;
    const minSafeDistance = obstacleWidth / 2 + entityWidth / 2;

    // Use the larger of safetyDistance or the physical space needed
    const effectiveSafetyDistance = Math.max(safetyDistance, minSafeDistance);

    const distance = Math.abs(obstaclePos - spawnPosX);
    const isTooClose = distance < effectiveSafetyDistance;

    return !isTooClose;
  }

  private isLaneSafeFromCoins(
    lane: number,
    spawnPosX: number,
    safetyDistance: number
  ): boolean {
    const lastCoinInLane = [...this.coins]
      .reverse()
      .find((coin) => coin.getLane() === lane);

    if (!lastCoinInLane) {
      return true;
    }

    const coinObj = lastCoinInLane.getGameObj();
    if (!coinObj) return true;

    const coinPos = coinObj.pos.x;
    const coinWidth = coinObj.width;
    const entityWidth = GameConfig.OBSTACLE_WIDTH;
    const minSafeDistance = coinWidth / 2 + entityWidth / 2;

    // Use the larger of safetyDistance or the physical space needed
    const effectiveSafetyDistance = Math.max(safetyDistance, minSafeDistance);

    const distance = Math.abs(coinPos - spawnPosX);
    const isTooClose = distance < effectiveSafetyDistance;

    return !isTooClose;
  }

  /**
   * Find the safest lane for spawning an entity
   */
  private findSafeLane(safetyDistance: number): number {
    const spawnPosX = GameConfig.CANVAS_WIDTH;
    const availableLanes = Array.from(
      { length: GameConfig.LANE_COUNT },
      (_, i) => i
    );
    GameUtils.shuffle(availableLanes);

    // Check both coins and obstacles in a single pass
    for (const lane of availableLanes) {
      const isSafeFromCoins = this.isLaneSafeFromCoins(
        lane,
        spawnPosX,
        safetyDistance
      );
      const isSafeFromObstacles = this.isLaneSafeFromObstacles(
        lane,
        spawnPosX,
        safetyDistance
      );

      if (isSafeFromCoins && isSafeFromObstacles) {
        return lane;
      }
    }

    // If no completely safe lane found, just return a random lane
    return availableLanes[0];
  }
}
