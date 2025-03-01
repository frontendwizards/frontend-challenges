export interface DifficultySettings {
  obstacleSpeed: number;
  spawnInterval: [number, number]; // [min, max] spawn interval in seconds
}

export default class GameConfig {
  // Game canvas settings
  public static readonly CANVAS_WIDTH = 1000;
  public static readonly CANVAS_HEIGHT = 600;
  public static readonly BACKGROUND_COLOR = "#d9b98e";

  // Environment settings
  public static readonly SKY_PERCENTAGE = 0.35; // 35% of the screen

  // Player settings
  public static readonly PLAYER_SPEED = 520;
  public static readonly PLAYER_INITIAL_HEALTH = 3;
  public static readonly PLAYER_INITIAL_LANE = 1;
  public static readonly PLAYER_POSITION_X = 150;

  // Asset settings
  public static readonly SPRITE_SCALE = 0.2;
  public static readonly OBSTACLE_SCALE = 0.8;

  // Game difficulty presets
  public static readonly DIFFICULTY_SETTINGS: Record<
    string,
    DifficultySettings
  > = {
    easy: {
      obstacleSpeed: 250,
      spawnInterval: [1.2, 3.0],
    },
    normal: {
      obstacleSpeed: 320,
      spawnInterval: [0.8, 2.5],
    },
    hard: {
      obstacleSpeed: 450,
      spawnInterval: [0.5, 1.5],
    },
  };

  // Game progression settings
  public static readonly MAX_SPEED_INCREASE = 300; // Maximum speed increase over time

  // Calculate game dimensions based on settings
  public static getLanePositions(): number[] {
    const groundStartY = this.CANVAS_HEIGHT * this.SKY_PERCENTAGE;
    const groundHeight = this.CANVAS_HEIGHT * (1 - this.SKY_PERCENTAGE);

    return [
      groundStartY + groundHeight * 0.25, // Top lane on the ground
      groundStartY + groundHeight * 0.5, // Middle lane on the ground
      groundStartY + groundHeight * 0.75, // Bottom lane on the ground
    ];
  }

  public static getDifficultySettings(difficulty: string): DifficultySettings {
    return (
      this.DIFFICULTY_SETTINGS[difficulty] || this.DIFFICULTY_SETTINGS.normal
    );
  }
}
