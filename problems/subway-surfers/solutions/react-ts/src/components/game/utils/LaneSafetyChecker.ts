import GameConfig from "../config/GameConfig";
import Obstacle from "../objects/entities/Obstacle";
import Coin from "../objects/entities/Coin";
import { GameUtils } from "./GameUtils";

export class LaneSafetyChecker {
  static readonly NO_SAFE_LANE = -1;

  /**
   * Checks if a lane has any obstacles too close to a specific position
   */
  static isLaneSafeFromObstacles(
    obstacles: Obstacle[],
    lane: number,
    spawnPosX: number,
    safetyDistance: number
  ): boolean {
    const lastObstacleInLane = [...obstacles]
      .reverse()
      .find((obs) => obs.getLane() === lane);

    if (!lastObstacleInLane) {
      return true;
    }

    const obstacleObj = lastObstacleInLane.getGameObj();
    if (!obstacleObj) return true;

    const obstaclePos = obstacleObj.pos.x;
    const obstacleWidth = obstacleObj.width;
    const entityWidth = GameConfig.COIN_WIDTH;
    const minSafeDistance = obstacleWidth / 2 + entityWidth / 2;
    const effectiveSafetyDistance = Math.max(safetyDistance, minSafeDistance);

    const distance = Math.abs(obstaclePos - spawnPosX);
    return distance >= effectiveSafetyDistance;
  }

  static isLaneSafeFromCoins(
    coins: Coin[],
    lane: number,
    spawnPosX: number,
    safetyDistance: number
  ): boolean {
    const lastCoinInLane = [...coins]
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
    const effectiveSafetyDistance = Math.max(safetyDistance, minSafeDistance);

    const distance = Math.abs(coinPos - spawnPosX);
    return distance >= effectiveSafetyDistance;
  }

  /**
   * Find the safest lane for spawning an entity
   */
  static findSafeLane(
    obstacles: Obstacle[],
    coins: Coin[],
    safetyDistance: number
  ): number {
    const spawnPosX = GameConfig.CANVAS_WIDTH;
    const availableLanes = Array.from(
      { length: GameConfig.LANE_COUNT },
      (_, i) => i
    );
    GameUtils.shuffle(availableLanes);

    // Check both coins and obstacles in a single pass
    for (const lane of availableLanes) {
      const isSafeFromCoins = this.isLaneSafeFromCoins(
        coins,
        lane,
        spawnPosX,
        safetyDistance
      );
      const isSafeFromObstacles = this.isLaneSafeFromObstacles(
        obstacles,
        lane,
        spawnPosX,
        safetyDistance
      );

      if (isSafeFromCoins && isSafeFromObstacles) {
        return lane;
      }
    }

    return LaneSafetyChecker.NO_SAFE_LANE;
  }
}
