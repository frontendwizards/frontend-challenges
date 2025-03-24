import { GameObj, KaboomInterface } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";
import AudioPlayer from "../../services/audio/AudioPlayer";

export interface CoinOptions {
  lane: number;
  lanes: number[];
  speed: number;
  showHitboxes?: boolean;
}

export default class Coin extends GameObject {
  private lane: number = 0;
  private lanes: number[] = [];
  private speed: number = 0;
  private showHitboxes: boolean = false;
  private hitbox: GameObj | null = null;

  // Animation properties, similar to Player
  private currentFrame: number = 0;
  private animationTimer: number = 0;
  protected animationSpeed: number = 0.1; // Time between frames (seconds)

  constructor(kaboomInstance: KaboomInterface, options: CoinOptions) {
    super(kaboomInstance);
    this.lane = options.lane;
    this.lanes = options.lanes;
    this.speed = options.speed;
    this.showHitboxes = options.showHitboxes || false;
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

    // Update coin movement speed in case the game speed changes
    if (this.gameObj && this.gameObj.exists()) {
      this.gameObj.use(this.k.move(this.k.LEFT, this.speed));

      // Update animation
      this.updateAnimation();

      // Update hitbox position if it exists
      if (this.hitbox && this.hitbox.exists()) {
        this.hitbox.pos = this.gameObj.pos;
      }
    }
  }

  private updateAnimation(): void {
    if (!this.gameObj) return;

    // Get dt as a number (assume 1/60 if not available)
    let dt = 1 / 60;
    try {
      if (typeof this.k.dt === "function") {
        dt = (this.k.dt as () => number)();
      } else if (typeof this.k.dt === "number") {
        dt = this.k.dt;
      }
    } catch (e) {
      console.warn("Error getting dt", e);
    }

    // Update animation timer
    this.animationTimer += dt;

    // Update to next frame when timer exceeds animation speed
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
    if (!this.exists()) return;

    try {
      AudioPlayer.playCoinCollectSound();
    } catch (e) {
      console.warn("Could not create coin sound", e);
    }

    this.destroy();
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
