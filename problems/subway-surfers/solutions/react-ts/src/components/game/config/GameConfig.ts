import { Color } from "../types/KaboomTypes";

export interface DifficultySettings {
  obstacleSpeed: number;
  spawnInterval: [number, number];
  speedIncreaseFactor: number;
}

const BASE_URL =
  "https://raw.githubusercontent.com/frontendwizards/frontend-challenges/main/problems/subway-surfers/solutions/react-ts/public";

export default class GameConfig {
  static readonly CANVAS_WIDTH = 900;
  static readonly CANVAS_HEIGHT = 600;
  static readonly CANVAS_BACKGROUND_COLOR = "#000000";

  // Environment settings
  static readonly SKY_PERCENTAGE = 0.37;
  static readonly GROUND_COLOR = "#47424f";
  static readonly SKY_COLOR = "#0a1128";
  static readonly HORIZON_COLOR = "#27294B";
  static readonly CLOUD_COLOR: Color = [180, 190, 220, 0.4];
  static readonly BOTTOM_MARGIN_PERCENTAGE = 0.15;

  // Player settings
  static readonly PLAYER_POSITION_X = 200;
  static readonly PLAYER_INITIAL_LANE = 1;
  static readonly PLAYER_SPEED = 2;
  static readonly PLAYER_INITIAL_HEALTH = 3;
  static readonly SPRITE_SCALE = 0.25;

  // Sprite paths
  static readonly SPRITE_PATH = `${BASE_URL}/assets/characters/templerun/`;
  static readonly CHARACTER_SPRITE_COUNT = 10;
  static readonly OBSTACLE_SPRITE_COUNT = 10;
  static readonly OBSTACLE_SCALE = 0.3;

  // Coin settings
  static readonly COIN_SPRITE_PATH = `${BASE_URL}/assets/coins/MonedaD.png`;
  static readonly COIN_SPRITE_FRAMES = 5;
  static readonly COIN_SCALE = 3;
  static readonly COIN_WIDTH = 40;
  static readonly COIN_HEIGHT = 40;
  static readonly COIN_SCORE_VALUE = 10;
  static readonly COIN_MIN_DISTANCE_FROM_OBSTACLE = 300;
  static readonly COIN_SOUND_PATH = `${BASE_URL}/assets/sounds/subway-surfers-coin-collect.mp3`;

  // Lane settings
  static readonly LANE_COUNT = 3;
  static readonly LANE_SPACING = 150;
  static readonly MAX_SPEED_INCREASE = 400;
  static readonly OBSTACLE_SPRITE_PATH = `${BASE_URL}/assets/obstacles.png`;

  // Difficulty settings
  static readonly OBSTACLE_WIDTH = 60;
  static readonly OBSTACLE_HEIGHT = 60;

  static readonly DIFFICULTY_SETTINGS: Record<string, DifficultySettings> = {
    easy: {
      obstacleSpeed: 400,
      spawnInterval: [1.5, 2.5],
      speedIncreaseFactor: 0.5,
    },
    medium: {
      obstacleSpeed: 500,
      spawnInterval: [1.0, 2.0],
      speedIncreaseFactor: 1.0,
    },
    hard: {
      obstacleSpeed: 500,
      spawnInterval: [0.2, 0.4],
      speedIncreaseFactor: 1.5,
    },
  };

  static readonly CLOUD_SPEED = -320;
  static readonly CLOUD_SPAWN_INTERVAL = 3;

  static readonly OBSTACLE_SPAWN_INTERVAL = 2;
  static readonly MIN_OBSTACLE_SPACING = 200;
  static readonly OBSTACLE_TYPES = ["rock", "tree", "barrier"];

  static getLanePositions(): number[] {
    const skyHeight = this.CANVAS_HEIGHT * this.SKY_PERCENTAGE;
    const usableGroundHeight =
      this.CANVAS_HEIGHT -
      skyHeight -
      this.CANVAS_HEIGHT * this.BOTTOM_MARGIN_PERCENTAGE;
    const laneHeight = usableGroundHeight / this.LANE_COUNT;

    return [
      skyHeight + laneHeight / 2,
      skyHeight + laneHeight + laneHeight / 2,
      skyHeight + 2 * laneHeight + laneHeight / 2,
    ];
  }

  static getLanePosition(laneIndex: number): number {
    if (laneIndex < 0 || laneIndex >= this.LANE_COUNT) {
      console.warn(`Invalid lane index: ${laneIndex}, using default lane 1`);
      laneIndex = 1;
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

  static getRandomLane(): number {
    return Math.floor(Math.random() * this.LANE_COUNT);
  }
}
