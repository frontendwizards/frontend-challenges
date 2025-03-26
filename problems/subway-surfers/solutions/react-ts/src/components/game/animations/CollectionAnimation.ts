import { GameObj, KaboomInterface } from "../types/KaboomTypes";
import { Vec2 } from "kaboom";

export interface CollectionAnimationOptions {
  duration: number;
  arcHeight: number;
  scaleAmount: number;
  fadeSpeed: number;
  targetPosition: Vec2;
}

export class CollectionAnimation {
  private isAnimating: boolean = false;
  private timer: number = 0;
  private startPos: Vec2 | null = null;
  private readonly options: CollectionAnimationOptions;

  constructor(private k: KaboomInterface, options: CollectionAnimationOptions) {
    this.options = options;
  }

  public start(startPosition: Vec2): void {
    this.isAnimating = true;
    this.timer = 0;
    this.startPos = startPosition;
  }

  public update(
    deltaTime: number,
    gameObj: GameObj,
    hitbox?: GameObj | null
  ): boolean {
    if (!this.isAnimating || !this.startPos) return false;

    this.timer += deltaTime;
    const progress = this.timer / this.options.duration;

    if (progress >= 1) {
      return true; // Animation complete
    }

    // Calculate new position and visual effects
    const newPosition = this.calculatePosition(progress);
    const effects = this.calculateEffects(progress);

    // Apply the changes
    this.applyAnimation(gameObj, newPosition, effects, hitbox);

    return false; // Animation still running
  }

  private calculatePosition(progress: number): Vec2 {
    const easedProgress = this.easeOutQuad(progress);

    // Calculate base position (moving from start to target)
    const x =
      this.startPos!.x +
      (this.options.targetPosition.x - this.startPos!.x) * easedProgress;
    const y =
      this.startPos!.y +
      (this.options.targetPosition.y - this.startPos!.y) * easedProgress;

    // Add arc motion using sine wave
    const arcOffset = -Math.sin(progress * Math.PI) * this.options.arcHeight;

    return this.k.vec2(x, y + arcOffset);
  }

  private calculateEffects(progress: number): {
    scale: number;
    opacity: number;
  } {
    // Calculate scale with a subtle bounce effect
    const scale = 1 + Math.sin(progress * Math.PI) * this.options.scaleAmount;

    // Calculate opacity (slower fade out)
    const opacity = 1 - progress * this.options.fadeSpeed;

    return { scale, opacity };
  }

  private applyAnimation(
    gameObj: GameObj,
    position: Vec2,
    effects: { scale: number; opacity: number },
    hitbox?: GameObj | null
  ): void {
    // Update position
    gameObj.pos = position;

    // Update visual effects
    gameObj.scale = this.k.vec2(effects.scale, effects.scale);
    gameObj.opacity = effects.opacity;

    // Update hitbox if it exists
    if (hitbox?.exists()) {
      hitbox.pos = gameObj.pos;
      hitbox.scale = this.k.vec2(effects.scale, effects.scale);
      hitbox.opacity = effects.opacity;
    }
  }

  // Easing function for smooth motion
  private easeOutQuad(t: number): number {
    return t * (2 - t);
  }
}
