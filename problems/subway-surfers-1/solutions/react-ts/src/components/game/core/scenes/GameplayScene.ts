import { KaboomInterface, ActionReturnType } from "../../types/KaboomTypes";
import { BaseScene } from "./BaseScene";
import GameConfig from "../../config/GameConfig";
import Player from "../../objects/entities/Player";
import Obstacle from "../../objects/entities/Obstacle";
import Environment from "../../objects/environment/Environment";
import HealthBar from "../../objects/ui/HealthBar";
import ScoreDisplay from "../../objects/ui/ScoreDisplay";

export interface GameplaySceneOptions {
  showHitboxes: boolean;
  showBorders: boolean;
  difficulty: string;
}

export default class GameplayScene extends BaseScene {
  private score: number = 0;
  private gameTime: number = 0;
  private currentLane: number = 1;
  private lanes: number[] = [];
  private spriteLoadSuccess: boolean;
  private showHitboxes: boolean;
  private showBorders: boolean;
  private difficulty: string;
  private currentObstacleSpeed: number = 0;
  private obstacles: Obstacle[] = [];
  private player: Player | null = null;
  private environment: Environment | null = null;
  private healthBar: HealthBar | null = null;
  private scoreDisplay: ScoreDisplay | null = null;
  private obstacleSpawnTimer: ActionReturnType | null = null;

  constructor(
    kaboomInstance: KaboomInterface,
    spriteLoaded: boolean,
    options: GameplaySceneOptions
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
    this.obstacles = [];

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
    });
    this.player.init();
  }

  private setupUI(): void {
    const WIDTH = GameConfig.CANVAS_WIDTH;

    // Create health bar
    this.healthBar = new HealthBar(this.k, {
      x: WIDTH - 120,
      y: 20,
      width: 80,
      height: 10,
      maxHealth: GameConfig.PLAYER_INITIAL_HEALTH,
    });
    this.healthBar.init();

    // Create score display
    this.scoreDisplay = new ScoreDisplay(this.k, {
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

  private startObstacleSpawning(spawnInterval: [number, number]): void {
    const k = this.k;

    const spawn = () => {
      if (!this.player || !this.player.isPlayerAlive()) return;

      // Randomly choose a lane
      const obstacleLane = k.randi(0, 3);

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

  public destroy(): void {
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

    // Cancel obstacle spawning
    if (this.obstacleSpawnTimer) {
      this.obstacleSpawnTimer.cancel();
      this.obstacleSpawnTimer = null;
    }
  }
}
