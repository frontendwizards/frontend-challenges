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
}

export default class Coin extends GameObject {
  private lane: number = 0;
  private lanes: number[] = [];
  private speed: number = 0;
  private showHitboxes: boolean = false;
  private hitbox: GameObj | null = null;

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

    // Update coin movement speed in case the game speed changes
    if (this.gameObj && this.gameObj.exists()) {
      this.gameObj.use(this.k.move(this.k.LEFT, this.speed));

      // Update animation
      this.updateAnimation(deltaTime);

      // Update hitbox position if it exists
      if (this.hitbox && this.hitbox.exists()) {
        this.hitbox.pos = this.gameObj.pos;
      }
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
    if (!this.exists()) return;

    // mark as collected
    this.addProp("collected", true);

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
