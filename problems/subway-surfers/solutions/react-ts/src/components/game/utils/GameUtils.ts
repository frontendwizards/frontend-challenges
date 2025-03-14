export class GameUtils {
  /**
   * Gets the rightmost (last spawned) entity from an array of game objects
   * @param entities Array of game objects to check
   * @returns The rightmost entity or null if array is empty
   */
  static getRightmostEntity<T extends { pos: { x: number } }>(
    entities: T[]
  ): T | null {
    if (!entities.length) return null;

    return entities.reduce((rightmost, current) => {
      return current.pos.x > rightmost.pos.x ? current : rightmost;
    }, entities[0]);
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   * @param array Array to shuffle
   * @returns Shuffled array
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Calculates the distance between two points
   * @param x1 First point x coordinate
   * @param y1 First point y coordinate
   * @param x2 Second point x coordinate
   * @param y2 Second point y coordinate
   * @returns The distance between the points
   */
  static getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Checks if an object is within a certain distance of another object
   * @param obj1 First object with position
   * @param obj2 Second object with position
   * @param distance The maximum distance to check
   * @returns Whether the objects are within the specified distance
   */
  static isWithinDistance(
    obj1: { pos: { x: number; y: number } },
    obj2: { pos: { x: number; y: number } },
    distance: number
  ): boolean {
    return (
      this.getDistance(obj1.pos.x, obj1.pos.y, obj2.pos.x, obj2.pos.y) <=
      distance
    );
  }

  /**
   * Gets a random number between min and max (inclusive)
   * @param min Minimum value
   * @param max Maximum value
   * @returns Random number between min and max
   */
  static getRandomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Gets a random item from an array
   * @param array Array to get item from
   * @returns Random item from array
   */
  static getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Clamps a number between min and max values
   * @param num Number to clamp
   * @param min Minimum value
   * @param max Maximum value
   * @returns Clamped number
   */
  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  /**
   * Formats a score number with commas and specified decimal places
   * @param score Score to format
   * @param decimals Number of decimal places
   * @returns Formatted score string
   */
  static formatScore(score: number, decimals: number = 0): string {
    return score.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
