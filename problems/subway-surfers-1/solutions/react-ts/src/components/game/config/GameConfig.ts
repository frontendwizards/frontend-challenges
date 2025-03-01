export interface DifficultySettings {
  obstacleSpeed: number;
  spawnInterval: [number, number]; // [min, max] spawn interval in seconds
}

export default class GameConfig {
  // Canvas settings
  static readonly CANVAS_WIDTH = 1000;
  static readonly CANVAS_HEIGHT = 600;
  static readonly CANVAS_BACKGROUND_COLOR = "#000000";

  // Environment settings
  static readonly SKY_PERCENTAGE = 0.6; // 60% of the screen is sky
  static readonly GROUND_COLOR = "#D9B98E"; // Desert sand color
  static readonly SKY_COLOR = "#87CEEB"; // Sky blue color
  static readonly HORIZON_COLOR = "#C8AA78"; // Slightly darker than sand
  static readonly SUN_COLOR = "#FFDC64"; // Bright yellow
  static readonly CLOUD_COLOR = "rgba(255, 255, 255, 0.8)"; // Semi-transparent white

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
  static readonly OBSTACLE_SCALE = 0.5; // Scale for obstacle sprites

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

  // Helper methods
  static getLanePositions(): number[] {
    const centerY = this.CANVAS_HEIGHT / 2;
    return [centerY - this.LANE_SPACING, centerY, centerY + this.LANE_SPACING];
  }

  static getDifficultySettings(difficulty: string): {
    obstacleSpeed: number;
    spawnInterval: [number, number];
    speedIncreaseFactor: number;
  } {
    const validDifficulty =
      difficulty in this.DIFFICULTY_SETTINGS ? difficulty : "medium";

    return this.DIFFICULTY_SETTINGS[
      validDifficulty as keyof typeof this.DIFFICULTY_SETTINGS
    ];
  }
}
