export interface DifficultySettings {
  obstacleSpeed: number;
  spawnInterval: [number, number]; // [min, max] spawn interval in seconds
  speedIncreaseFactor: number;
}

export default class GameConfig {
  // Canvas settings
  static readonly CANVAS_WIDTH = 1000;
  static readonly CANVAS_HEIGHT = 600;
  static readonly CANVAS_BACKGROUND_COLOR = "#000000";

  // Environment settings
  static readonly SKY_PERCENTAGE = 0.36;
  static readonly GROUND_COLOR = "#2F3136"; // Dark ground color for night
  static readonly SKY_COLOR = "#0A1128"; // Dark blue night sky
  static readonly HORIZON_COLOR = "#27294B"; // Dark blue-purple horizon
  static readonly SUN_COLOR = "#E8E9EB"; // Off-white/silver color for moon
  static readonly CLOUD_COLOR = [210, 210, 220, 0.4]; // Semi-transparent light color for night clouds

  // Player settings
  static readonly PLAYER_POSITION_X = 200; // Player's horizontal position
  static readonly PLAYER_INITIAL_LANE = 1; // Start in the middle lane (0-2)
  static readonly PLAYER_SPEED = 400; // Base movement speed
  static readonly PLAYER_INITIAL_HEALTH = 3; // Starting health
  static readonly SPRITE_SCALE = 0.3; // Scale for player sprite

  // Asset settings
  static readonly SPRITE_PATH = "/assets/characters/templerun"; // Path to sprite assets
  static readonly CHARACTER_SPRITE_COUNT = 10; // Number of character animation frames
  static readonly OBSTACLE_SPRITE_COUNT = 10; // Number of obstacle types
  static readonly OBSTACLE_SCALE = .5; // Scale for obstacle sprites

  // Game mechanics
  static readonly LANE_COUNT = 3; // Number of lanes
  static readonly LANE_SPACING = 150; // Distance between lanes
  static readonly MAX_SPEED_INCREASE = 300; // Maximum speed increase over time

  // Difficulty presets
  static readonly DIFFICULTY_SETTINGS = {
    easy: {
      obstacleSpeed: 300,
      spawnInterval: [1.8, 3.0], // Min and max time between obstacles
      speedIncreaseFactor: 0.5, // How quickly speed increases
    },
    medium: {
      obstacleSpeed: 400,
      spawnInterval: [1.2, 2.5],
      speedIncreaseFactor: 1.0,
    },
    hard: {
      obstacleSpeed: 500,
      spawnInterval: [0.8, 2.0],
      speedIncreaseFactor: 1.5,
    },
  };

  // Sky configuration
  static readonly SKY_HEIGHT_PERCENTAGE = 35; // 35% of canvas height for sky

  // Cloud configuration
  static readonly CLOUD_SPEED = -120; // Negative value makes clouds move left
  static readonly CLOUD_SPAWN_INTERVAL = 3; // Spawn new cloud every 3 seconds

  // Obstacle configuration
  static readonly OBSTACLE_SPAWN_INTERVAL = 2; // Spawn new obstacle every 2 seconds
  static readonly MIN_OBSTACLE_SPACING = 200; // Minimum pixels between obstacles
  static readonly OBSTACLE_TYPES = ["rock", "tree", "barrier"]; // Example obstacle types

  // Helper methods
  static getLanePositions(): number[] {
    const centerY = this.CANVAS_HEIGHT / 2;
    return [centerY - this.LANE_SPACING, centerY, centerY + this.LANE_SPACING];
  }

  static getDifficultySettings(difficulty: string): DifficultySettings {
    const validDifficulty =
      difficulty in this.DIFFICULTY_SETTINGS ? difficulty : "medium";

    return this.DIFFICULTY_SETTINGS[
      validDifficulty as keyof typeof this.DIFFICULTY_SETTINGS
    ];
  }
}
