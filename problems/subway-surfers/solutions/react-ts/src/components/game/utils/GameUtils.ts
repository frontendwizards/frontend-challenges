export class GameUtils {
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
}
