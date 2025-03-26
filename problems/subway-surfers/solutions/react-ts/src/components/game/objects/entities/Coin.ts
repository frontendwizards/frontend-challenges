import { GameObj, KaboomInterface } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";
import AudioPlayer from "../../services/audio/AudioPlayer";
import { TimeManager } from "../../utils/TimeManager";

export interface CoinOptions {
  lane: number;
  lanes: number[];
  speed: number;
  showHitboxes?: boolean;
  onCollect?: (score: number) => void; // Add callback for score updates
}

export default class Coin extends GameObject {
  private lane: number = 0;
  private lanes: number[] = [];
  private speed: number = 0;
  private showHitboxes: boolean = false;
  private hitbox: GameObj | null = null;
  private isCollecting: boolean = false;
  private collectionTimer: number = 0;
  private readonly COLLECTION_DURATION: number = 0.5; // Duration in seconds
  private startPos: { x: number; y: number } | null = null;
  private targetPos: { x: number; y: number } | null = null;
  private onCollect: ((score: number) => void) | undefined;

  // Animation properties
  private currentFrame: number = 0;
  private animationTimer: number = 0;
  protected animationSpeed: number = 0.1; // Time between frames (in seconds)

  // Animation constants
  private readonly ARC_HEIGHT: number = 100; // How high the coin flies
  private readonly SCALE_AMOUNT: number = 0.2; // How much the coin scales up/down
  private readonly FADE_SPEED: number = 0.5; // How quickly the coin fades out

  constructor(kaboomInstance: KaboomInterface, options: CoinOptions) {
    super(kaboomInstance);
    this.lane = options.lane;
    this.lanes = options.lanes;
    this.speed = options.speed;
    this.showHitboxes = options.showHitboxes || false;
    this.onCollect = options.onCollect;
  }

  public init(): void {
    this.createCoin();

    // Create hitbox if enabled
    if (this.showHitboxes && this.gameObj) {
      this.createHitbox();
    }
  }

  private createCoin(): void {
    const k = this.k;
    const laneY = this.lanes[this.lane];
    const laneX = GameConfig.CANVAS_WIDTH + GameConfig.COIN_WIDTH;

    this.components = [];
    this.tags = [];
    this.props = {};

    this.addComponent(
      k.sprite("coin", {
        frame: this.currentFrame,
        noError: true,
      })
    );

    this.addComponent(k.pos(laneX, laneY));
    this.addComponent(k.scale(GameConfig.COIN_SCALE));
    this.addComponent(
      k.area({
        width: GameConfig.COIN_WIDTH,
        height: GameConfig.COIN_HEIGHT,
      })
    );

    this.addComponent(k.anchor("center"));
    this.addComponent(k.z(5));
    this.addComponent(k.move(k.LEFT, this.speed));
    this.addTag("coin");
    this.createGameObj();

    this.gameObj?.onUpdate(() => {
      if (this.gameObj && this.gameObj?.pos.x < -50) {
        this.destroy();
      }
    });
  }

  // Create a visible hitbox for the coin
  private createHitbox(): void {
    if (!this.gameObj) return;

    const k = this.k;
    this.hitbox = k.add([
      k.rect(40, 40), // Use the same size as the coin's area
      k.pos(this.gameObj.pos.x, this.gameObj.pos.y),
      k.anchor("center"),
      k.outline(2, k.rgb(255, 0, 0)), // Red outline
      k.color(255, 0, 0, 0), // Semi-transparent red fill
      "coinHitbox",
    ]);
  }

  public update(): void {
    if (!this.exists()) return;

    const deltaTime = TimeManager.getInstance().getDeltaTime();

    // Handle collection animation
    if (this.isCollecting && this.gameObj && this.startPos && this.targetPos) {
      this.updateCollectionAnimation(deltaTime);
      return;
    }

    // Normal update logic
    this.updateNormalMovement(deltaTime);
  }

  private updateCollectionAnimation(deltaTime: number): void {
    this.collectionTimer += deltaTime;
    const progress = this.collectionTimer / this.COLLECTION_DURATION;

    if (progress >= 1) {
      this.destroy();
      return;
    }

    // Calculate new position and visual effects
    const newPosition = this.calculateCollectionPosition(progress);
    const visualEffects = this.calculateVisualEffects(progress);

    // Apply the changes
    this.applyCollectionAnimation(newPosition, visualEffects);
  }

  private calculateCollectionPosition(progress: number): {
    x: number;
    y: number;
  } {
    const easedProgress = this.easeOutQuad(progress);

    // Calculate base position (moving from start to target)
    const x =
      this.startPos!.x + (this.targetPos!.x - this.startPos!.x) * easedProgress;
    const y =
      this.startPos!.y + (this.targetPos!.y - this.startPos!.y) * easedProgress;

    // Add arc motion using sine wave
    const arcOffset = -Math.sin(progress * Math.PI) * this.ARC_HEIGHT;

    return { x, y: y + arcOffset };
  }

  private calculateVisualEffects(progress: number): {
    scale: number;
    opacity: number;
  } {
    // Calculate scale with a subtle bounce effect
    const scale = 1 + Math.sin(progress * Math.PI) * this.SCALE_AMOUNT;

    // Calculate opacity (slower fade out)
    const opacity = 1 - progress * this.FADE_SPEED;

    return { scale, opacity };
  }

  private applyCollectionAnimation(
    position: { x: number; y: number },
    effects: { scale: number; opacity: number }
  ): void {
    if (!this.gameObj) return;

    // Update position
    this.gameObj.pos = this.k.vec2(position.x, position.y);

    // Update visual effects
    this.gameObj.scale = this.k.vec2(effects.scale, effects.scale);
    this.gameObj.opacity = effects.opacity;

    // Update hitbox if it exists
    if (this.hitbox?.exists()) {
      this.hitbox.pos = this.gameObj.pos;
      this.hitbox.scale = this.k.vec2(effects.scale, effects.scale);
      this.hitbox.opacity = effects.opacity;
    }
  }

  private updateNormalMovement(deltaTime: number): void {
    if (!this.gameObj?.exists()) return;

    // Update position
    this.gameObj.use(this.k.move(this.k.LEFT, this.speed));

    // Update animation
    this.updateAnimation(deltaTime);

    // Update hitbox position
    if (this.hitbox?.exists()) {
      this.hitbox.pos = this.gameObj.pos;
    }
  }

  private updateAnimation(deltaTime: number): void {
    if (!this.gameObj) return;

    // Update animation timer
    this.animationTimer += deltaTime;

    // Update to next frame when timer passes the animation speed (aka time_passed > 100ms)
    if (this.animationTimer >= this.animationSpeed) {
      this.animationTimer = 0;

      // Update to next frame
      this.currentFrame =
        (this.currentFrame + 1) % GameConfig.COIN_SPRITE_FRAMES;

      // Apply the new frame to the sprite
      this.updateGameObjFrame(this.currentFrame);
    }
  }

  public collect(): void {
    if (!this.exists() || this.isCollecting) return;

    // Update score if callback exists
    this.onCollect?.(GameConfig.COIN_SCORE_VALUE);

    // Start collection animation
    this.isCollecting = true;
    this.collectionTimer = 0;

    // Store initial position and set target
    if (this.gameObj) {
      this.startPos = { x: this.gameObj.pos.x, y: this.gameObj.pos.y };
      this.targetPos = { x: 100, y: 80 }; // Score display position
    }

    // Play collection sound
    try {
      AudioPlayer.playCoinCollectSound();
    } catch (e) {
      console.warn("Could not create coin sound", e);
    }
  }

  public override destroy(): void {
    // Destroy the hitbox if it exists
    if (this.hitbox && this.hitbox.exists()) {
      this.hitbox.destroy();
      this.hitbox = null;
    }

    super.destroy();
  }

  public getLane(): number {
    return this.lane;
  }

  // Easing function for smooth motion
  private easeOutQuad(t: number): number {
    return t * (2 - t);
  }
}
