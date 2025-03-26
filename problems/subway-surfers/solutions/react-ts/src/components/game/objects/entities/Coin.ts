import { GameObj, KaboomInterface } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";
import AudioPlayer from "../../services/audio/AudioPlayer";
import { TimeManager } from "../../utils/TimeManager";
import { CollectionAnimation } from "../../animations/CollectionAnimation";

export interface CoinOptions {
  lane: number;
  lanes: number[];
  speed: number;
  showHitboxes?: boolean;
  onCollect?: (score: number) => void;
}

export default class Coin extends GameObject {
  private lane: number = 0;
  private lanes: number[] = [];
  private speed: number = 0;
  private showHitboxes: boolean = false;
  private hitbox: GameObj | null = null;
  private isCollecting: boolean = false;
  private onCollect: ((score: number) => void) | undefined;
  private collectionAnimation: CollectionAnimation;

  // Animation properties
  private currentFrame: number = 0;
  private animationTimer: number = 0;
  protected animationSpeed: number = 0.1; // Time between frames (in seconds)

  constructor(kaboomInstance: KaboomInterface, options: CoinOptions) {
    super(kaboomInstance);
    this.lane = options.lane;
    this.lanes = options.lanes;
    this.speed = options.speed;
    this.showHitboxes = options.showHitboxes || false;
    this.onCollect = options.onCollect;

    // Initialize collection animation
    this.collectionAnimation = new CollectionAnimation(kaboomInstance, {
      duration: 0.5,
      arcHeight: 100,
      scaleAmount: 0.2,
      fadeSpeed: 0.5,
      targetPosition: kaboomInstance.vec2(100, 80), // Score display position
    });
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
    if (this.isCollecting && this.gameObj) {
      const isComplete = this.collectionAnimation.update(
        deltaTime,
        this.gameObj,
        this.hitbox
      );
      if (isComplete) {
        this.destroy();
      }
      return;
    }

    // Normal update logic
    this.updateNormalMovement(deltaTime);
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

    // Update to next frame when timer passes the animation speed
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
    if (this.gameObj) {
      this.collectionAnimation.start(this.gameObj.pos);
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
}
