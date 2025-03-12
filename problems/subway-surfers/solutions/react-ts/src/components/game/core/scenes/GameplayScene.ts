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
  private isPaused: boolean = false;
  private isSpawning: boolean = false;

  // Store lane debug objects
  private laneDebugObjects: GameObj[] = [];

  constructor(kaboomInstance: KaboomInterface, options: GameplaySceneOptions) {
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

    // Start obstacle spawning immediately
    this.startObstacleSpawning(difficultySettings.spawnInterval);

    // Delay coin spawning to prevent initial overlap
    this.k.wait(1.5, () => {
      this.startCoinSpawning();
    });
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
      sceneManager: this.sceneManager!,
      onHealthChange: (health: number) => {
        this.healthBar?.updateHealth(health);
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
      width: 110,
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
      // Skip update if game is paused or player is dead
      if (this.isPaused || !this.player || !this.player.isPlayerAlive()) return;

      // Make sure we have a valid dt value
      const deltaTime = isNaN(k.dt) || k.dt === 0 ? 1 / 60 : k.dt;

      // Update game time and score
      this.gameTime += deltaTime;
      this.score += deltaTime;

      // Update score display
      this.scoreDisplay?.updateScore(this.score);

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

  /**
   * Shuffles an array in place
   */
  private shuffleArray<T>(array: T[]): T[] {
    const k = this.k;
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(k.rand(0, 1) * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Checks if a lane has any obstacles too close to a specific position
   */
  private isLaneSafeForSpawning(
    lane: number,
    spawnPosX: number,
    safetyDistance: number
  ): boolean {
    let obstacleX = null;
    // Check if any obstacle is too close
    const obstacleCollision = this.obstacles.some((obstacle) => {
      // Skip obstacles that aren't in the same lane
      if (obstacle.getLane() !== lane) return false;

      const obstacleObj = obstacle.getGameObj();
      if (!obstacleObj) return false;

      // Check if obstacle is too close to spawn position
      const obstaclePos = obstacleObj.pos.x;
      console.log({ obstacleObj: obstacleObj.pos.x });

      // Consider obstacle width for more accurate safety check
      const obstacleWidth = obstacleObj.width || 0;
      const entityWidth = 40; // Approximate width of a coin
      const minSafeDistance = obstacleWidth / 2 + entityWidth / 2;

      // Use the larger of safetyDistance or the physical space needed
      const effectiveSafetyDistance = Math.max(safetyDistance, minSafeDistance);

      console.log({
        obstacleWidth,
      });

      const distance = Math.abs(obstaclePos - spawnPosX);
      const isTooClose = distance < effectiveSafetyDistance;

      if (isTooClose) {
        console.log(
          `Lane ${lane}: Obstacle too close! Distance: ${distance.toFixed(
            0
          )}, Required: ${effectiveSafetyDistance.toFixed(0)}`
        );
      } else {
        obstacleX = obstaclePos;
      }

      return isTooClose;
    });

    // Log when a lane is detected as safe
    if (!obstacleCollision) {
      console.log(
        // `Lane ${lane} is safe for spawning at position ${spawnPosX} with safety distance ${safetyDistance}, obstaclePos: ${obstacleX}`
        `spawned at ${spawnPosX}, obstacleX: ${obstacleX}, distance: ${safetyDistance}`
      );
    }

    return !obstacleCollision;
  }

  /**
   * Creates a coin at the specified lane
   */
  private createCoin(lane: number): Coin {
    const coin = new Coin(this.k, {
      lane: lane,
      lanes: this.lanes,
      speed: this.currentObstacleSpeed,
      showHitboxes: this.showHitboxes,
      showBorders: this.showBorders,
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
      showBorders: this.showBorders,
    });
    obstacle.init();
    this.obstacles.push(obstacle);
    return obstacle;
  }

  /**
   * Find the safest lane for spawning an entity
   */
  private findSafeLane(
    safetyDistance: number,
    minAcceptableDistance: number = GameConfig.COIN_MIN_DISTANCE_FROM_OBSTACLE
  ): number {
    const spawnPosX = GameConfig.CANVAS_WIDTH;

    console.log(
      `Finding safe lane with safety distance: ${safetyDistance}, min acceptable: ${minAcceptableDistance}`
    );

    // Create shuffled list of lane indices
    const availableLanes = Array.from(
      { length: GameConfig.LANE_COUNT },
      (_, i) => i
    );
    this.shuffleArray(availableLanes);

    // First try: find a lane with no obstacles nearby
    console.log(
      `Step 1: Looking for a completely safe lane with no obstacles closer than ${safetyDistance}`
    );
    for (const lane of availableLanes) {
      const isSafe = this.isLaneSafeForSpawning(
        lane,
        spawnPosX,
        safetyDistance
      );
      if (isSafe) {
        console.log(`Found completely safe lane: ${lane}`);
        return lane;
      }
    }

    console.log(`No safe lane found, all lanes have obstacles too close`);
    return -1; // No safe lane found
  }

  private startObstacleSpawning(spawnInterval: [number, number]): void {
    const k = this.k;

    const spawn = () => {
      if (!this.player || !this.player.isPlayerAlive()) return;

      // Check if something else is already spawning
      if (this.isSpawning) {
        // If locked, retry after a short delay
        this.obstacleSpawnTimer = k.wait(0.1, spawn);
        return;
      }

      // Set the spawn lock
      this.isSpawning = true;

      // Find a safe lane for the obstacle (similar to coins)
      const safetyDistance = GameConfig.COIN_MIN_DISTANCE_FROM_OBSTACLE * 2;

      // Create shuffled list of lane indices
      const availableLanes = Array.from(
        { length: GameConfig.LANE_COUNT },
        (_, i) => i
      );
      this.shuffleArray(availableLanes);

      // Try to find a safe lane
      let selectedLane = -1;
      for (const lane of availableLanes) {
        // Check if this lane is safe for an obstacle (use different offset than coins)
        if (this.isLaneSafeForObstacle(lane, safetyDistance)) {
          selectedLane = lane;
          break;
        }
      }

      // If no safe lane found, wait and try again instead of using random lane
      if (selectedLane === -1) {
        console.log("No safe lane for obstacle, waiting to try again");

        // Release the spawn lock
        this.isSpawning = false;

        // Try again after a short delay
        this.obstacleSpawnTimer = k.wait(0.1, spawn);
        return;
      } else {
        console.log("Found safe lane for obstacle: " + selectedLane);

        // Create obstacle in the selected lane
        this.createObstacle(selectedLane);

        // Calculate next spawn time - gradually decrease as score increases
        const minSpawnTime = Math.max(
          spawnInterval[0] - this.gameTime / 60,
          0.3
        );
        const maxSpawnTime = Math.max(
          spawnInterval[1] - this.gameTime / 30,
          minSpawnTime + 0.5
        );

        // Release the spawn lock
        this.isSpawning = false;

        // Schedule next obstacle spawn
        this.obstacleSpawnTimer = k.wait(
          k.rand(minSpawnTime, maxSpawnTime),
          spawn
        );
      }
    };

    // Start spawning obstacles
    spawn();
  }

  /**
   * Checks if a lane is safe for spawning an obstacle
   */
  private isLaneSafeForObstacle(lane: number, safetyDistance: number): boolean {
    // Use a different spawn position than coins
    const spawnPosX = GameConfig.CANVAS_WIDTH;

    // Create a snapshot of the current coins to prevent race conditions
    const currentCoins = [...this.coins];

    // Check if any coin is too close
    const coinCollision = currentCoins.some((coin) => {
      // Skip coins that aren't in the same lane
      if (coin.getLane() !== lane) return false;

      const coinObj = coin.getGameObj();
      if (!coinObj) return false;

      // Check if coin is too close to spawn position
      const coinPos = coinObj.pos.x;

      // Consider coin width for accurate safety check
      const coinWidth = coinObj.width || 40; // Approximate width
      const obstacleWidth = 60; // Approximate width
      const minSafeDistance = coinWidth / 2 + obstacleWidth / 2;

      // Use the larger of safetyDistance or the physical space needed
      const effectiveSafetyDistance = Math.max(safetyDistance, minSafeDistance);

      const distance = Math.abs(coinPos - spawnPosX);
      const isTooClose = distance < effectiveSafetyDistance;

      return isTooClose;
    });

    // Also check if other obstacles are too close
    const obstacleCollision = this.obstacles.some((obstacle) => {
      // Skip obstacles that aren't in the same lane
      if (obstacle.getLane() !== lane) return false;

      const obstacleObj = obstacle.getGameObj();
      if (!obstacleObj) return false;

      const obstaclePos = obstacleObj.pos.x;

      // Consider obstacle widths
      const obstacleWidth = obstacleObj.width || 60;
      const minSafeDistance = obstacleWidth;

      // Use the larger of safetyDistance or the physical space needed
      const effectiveSafetyDistance = Math.max(safetyDistance, minSafeDistance);

      const distance = Math.abs(obstaclePos - spawnPosX);
      const isTooClose = distance < effectiveSafetyDistance;

      return isTooClose;
    });

    return !coinCollision && !obstacleCollision;
  }

  private startCoinSpawning(): void {
    const k = this.k;

    const spawnCoin = () => {
      if (!this.player || !this.player.isPlayerAlive()) return;

      // Check if something else is already spawning
      if (this.isSpawning) {
        // If locked, retry after a short delay
        this.coinSpawnTimer = k.wait(0.1, spawnCoin);
        return;
      }

      // Set the spawn lock
      this.isSpawning = true;

      // Use a larger safety margin to keep coins further from obstacles
      // Increase the multiplier to ensure coins are far from obstacles
      const safetyMarginMultiplier = 3.5; // Increased from 2.5 to 3.5
      const minSafeDistance =
        GameConfig.COIN_MIN_DISTANCE_FROM_OBSTACLE * safetyMarginMultiplier;
      const minAcceptableDistance =
        GameConfig.COIN_MIN_DISTANCE_FROM_OBSTACLE * 1.5; // Increased minimum acceptable distance

      console.log(
        `Attempting to spawn coin with safe distance: ${minSafeDistance}, min acceptable: ${minAcceptableDistance}`
      );

      // Find a safe lane for spawning
      const selectedLane = this.findSafeLane(
        minSafeDistance,
        minAcceptableDistance
      );

      // If we found a suitable lane, spawn the coin there
      if (selectedLane !== -1) {
        console.log(`Spawning coin in lane ${selectedLane}`);
        this.createCoin(selectedLane);

        // Release the spawn lock
        this.isSpawning = false;

        // Schedule next coin spawn
        // Random time between 1 and 1.5 seconds for next coin
        this.coinSpawnTimer = k.wait(k.rand(1, 1.5), spawnCoin);
      } else {
        // Release the spawn lock
        this.isSpawning = false;

        // Try again after a short delay
        this.coinSpawnTimer = k.wait(0.1, spawnCoin);
      }
    };

    // Start spawning coins
    spawnCoin();
  }

  public destroy(): void {
    console.log("log: GameplayScene destroy");
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

  public pause(): void {
    if (this.isPaused) return;

    this.isPaused = true;

    // Store current timer actions so we can cancel and recreate them later
    if (this.obstacleSpawnTimer) {
      this.obstacleSpawnTimer.cancel();
      this.obstacleSpawnTimer = null;
    }

    if (this.coinSpawnTimer) {
      this.coinSpawnTimer.cancel();
      this.coinSpawnTimer = null;
    }
  }

  public resume(): void {
    if (!this.isPaused) return;

    this.isPaused = false;

    // Restart timers with appropriate difficulty settings
    const difficultySettings = GameConfig.getDifficultySettings(
      this.difficulty
    );

    // Only restart timers if they're not already running
    if (!this.obstacleSpawnTimer) {
      this.startObstacleSpawning(difficultySettings.spawnInterval);
    }

    if (!this.coinSpawnTimer) {
      this.startCoinSpawning();
    }
  }
}
