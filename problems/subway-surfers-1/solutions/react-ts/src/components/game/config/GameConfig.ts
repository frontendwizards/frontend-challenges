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
  static readonly SKY_PERCENTAGE = 0.37; // Sky takes 30% of screen height
  static readonly GROUND_COLOR = "#47424f"; // Darker desert color with blue/purple tint for night
  static readonly SKY_COLOR = "#0a1128"; // Deep night sky color
  static readonly HORIZON_COLOR = "#27294B"; // Dark blue-purple horizon
  static readonly SUN_COLOR = "#E8E9EB"; // Off-white/silver color for moon
  static readonly CLOUD_COLOR = [210, 210, 220, 0.3]; // Semi-transparent light color for night clouds
  static readonly BOTTOM_MARGIN_PERCENTAGE = 0.15; // Bottom margin (15% of the canvas height)

  // Player settings
  static readonly PLAYER_POSITION_X = 200; // Player's horizontal position
  static readonly PLAYER_INITIAL_LANE = 1; // Start in the middle lane (0-2)
  static readonly PLAYER_SPEED = 400; // Base movement speed
  static readonly PLAYER_INITIAL_HEALTH = 3; // Starting health
  static readonly SPRITE_SCALE = 0.25; // Scale for player sprite (reduced from 0.3)

  // Asset settings
  static readonly SPRITE_PATH = "/assets/characters/templerun"; // Path to sprite assets
  static readonly CHARACTER_SPRITE_COUNT = 10; // Number of character animation frames
  static readonly OBSTACLE_SPRITE_COUNT = 10; // Number of obstacle types
  static readonly OBSTACLE_SCALE = 0.3; // Scale for obstacle sprites (reduced from 0.5)

  // Coin settings
  static readonly COIN_SPRITE_PATH = "/assets/coins/MonedaD.png"; // Path to coin sprite
  static readonly COIN_SPRITE_FRAMES = 5; // Number of animation frames
  static readonly COIN_SCALE = 3; // Scale for coin sprite (adjusted for new lane sizes)
  static readonly COIN_SCORE_VALUE = 10; // Score value for collecting a coin
  static readonly COIN_SPAWN_INTERVAL = [1.0, 3.0]; // Min and max time between coins
  static readonly COIN_MIN_DISTANCE_FROM_OBSTACLE = 150; // Minimum distance from obstacles
  static readonly COIN_SOUND_PATH = "/sounds/coin-collect.mp3"; // Path to coin sound
  // Game mechanics
  static readonly LANE_COUNT = 3; // Number of lanes
  static readonly LANE_SPACING = 150; // Distance between lanes
  static readonly MAX_SPEED_INCREASE = 300; // Maximum speed increase over time

  // Difficulty presets
  static readonly DIFFICULTY_SETTINGS: Record<string, DifficultySettings> = {
    easy: {
      obstacleSpeed: 300,
      spawnInterval: [1.8, 3.0] as [number, number], // Min and max time between obstacles
      speedIncreaseFactor: 0.5, // How quickly speed increases
    },
    medium: {
      obstacleSpeed: 400,
      spawnInterval: [1.2, 2.5] as [number, number],
      speedIncreaseFactor: 1.0,
    },
    hard: {
      obstacleSpeed: 500,
      spawnInterval: [0.5, .8] as [number, number],
      speedIncreaseFactor: 1.5,
    },
  };

  // Cloud configuration
  static readonly CLOUD_SPEED = -120; // Negative value makes clouds move left
  static readonly CLOUD_SPAWN_INTERVAL = 3; // Spawn new cloud every 3 seconds

  // Obstacle configuration
  static readonly OBSTACLE_SPAWN_INTERVAL = 2; // Spawn new obstacle every 2 seconds
  static readonly MIN_OBSTACLE_SPACING = 200; // Minimum pixels between obstacles
  static readonly OBSTACLE_TYPES = ["rock", "tree", "barrier"]; // Example obstacle types

  // Helper methods
  static getLanePositions(): number[] {
    // Get the starting Y position where the ground begins (after sky)
    const skyHeight = this.CANVAS_HEIGHT * this.SKY_PERCENTAGE;

    // Calculate the total height of the ground area minus the bottom margin
    const usableGroundHeight =
      this.CANVAS_HEIGHT -
      skyHeight -
      this.CANVAS_HEIGHT * this.BOTTOM_MARGIN_PERCENTAGE;

    // Evenly divide the usable ground area into 3 equal parts for the lanes
    const laneHeight = usableGroundHeight / this.LANE_COUNT;

    // Position lanes at the centers of each third of the usable ground area
    return [
      skyHeight + laneHeight / 2, // First lane (center of first third)
      skyHeight + laneHeight + laneHeight / 2, // Middle lane (center of second third)
      skyHeight + 2 * laneHeight + laneHeight / 2, // Bottom lane (center of last third)
    ];
  }

  // Get the lane Y position by index (0, 1, or 2)
  static getLanePosition(laneIndex: number): number {
    if (laneIndex < 0 || laneIndex >= this.LANE_COUNT) {
      console.warn(`Invalid lane index: ${laneIndex}, using default lane 1`);
      laneIndex = 1; // Default to middle lane
    }

    return this.getLanePositions()[laneIndex];
  }

  static getDifficultySettings(difficulty: string): DifficultySettings {
    const validDifficulty =
      difficulty in this.DIFFICULTY_SETTINGS ? difficulty : "medium";

    return this.DIFFICULTY_SETTINGS[
      validDifficulty as keyof typeof this.DIFFICULTY_SETTINGS
    ];
  }
}
