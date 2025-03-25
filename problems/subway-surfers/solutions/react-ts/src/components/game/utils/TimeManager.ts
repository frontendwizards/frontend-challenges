import { KaboomInterface } from "../types/KaboomTypes";

export class TimeManager {
  private static instance: TimeManager | null = null;
  private static readonly DEFAULT_DT = 1 / 60; // 60 FPS as fallback
  private k: KaboomInterface;

  private constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  public static initialize(kaboomInstance: KaboomInterface): void {
    if (!TimeManager.instance) {
      TimeManager.instance = new TimeManager(kaboomInstance);
    }
  }

  public static getInstance(): TimeManager {
    if (!TimeManager.instance) {
      throw new Error(
        "TimeManager must be initialized with a KaboomInterface first"
      );
    }
    return TimeManager.instance;
  }

  /**
   * Gets the delta time in seconds, with safety checks
   */
  public getDeltaTime(): number {
    try {
      if (typeof this.k.dt === "function") {
        const dt = (this.k.dt as () => number)();
        return this.validateDeltaTime(dt);
      } else if (typeof this.k.dt === "number") {
        return this.validateDeltaTime(this.k.dt);
      }
    } catch (e) {
      console.warn("Error getting delta time", e);
    }
    return TimeManager.DEFAULT_DT;
  }

  private validateDeltaTime(dt: number): number {
    // Prevent zero or negative dt
    if (isNaN(dt) || dt <= 0) {
      return TimeManager.DEFAULT_DT;
    }

    // Cap maximum dt to prevent large jumps
    const MAX_DT = 0.1; // 100ms maximum frame time
    return Math.min(dt, MAX_DT);
  }
}
