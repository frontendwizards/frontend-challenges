import { GameObj, KaboomInterface } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";
import AudioPlayer from "../../services/audio/AudioPlayer";

export interface CoinOptions {
  lane: number;
  lanes: number[];
  speed: number;
  showHitboxes?: boolean;
  showBorders?: boolean;
}

export default class Coin extends GameObject {
  private lane: number = 0;
  private lanes: number[] = [];
  private speed: number = 0;
  private showHitboxes: boolean = false;
  private showBorders: boolean = false;
  private isCollected = false;
  private hitbox: GameObj | null = null;

  // Animation properties, similar to Player
  private currentFrame: number = 0;
  private animationTimer: number = 0;
  private animationSpeed: number = 0.1; // Time between frames (seconds)

  constructor(kaboomInstance: KaboomInterface, options: CoinOptions) {
    super(kaboomInstance);
    this.lane = options.lane;
    this.lanes = options.lanes;
    this.speed = options.speed;
    this.showHitboxes = options.showHitboxes || false;
    this.showBorders = options.showBorders || false;
  }

  // Static factory method to create a Coin instance from an existing GameObj
  static fromGameObj(kaboomInstance: KaboomInterface, coinObj: GameObj): Coin {
    // Create a minimal coin instance
    const coin = new Coin(kaboomInstance, {
      lane: 0, // Default lane
      lanes: [], // Empty lanes array
      speed: 0, // No speed needed for collection
    });

    // Directly set the gameObj property
    coin.gameObj = coinObj;
    if (!coin.tags?.length) {
      coin.tags = ["coin"];
    }

    return coin;
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

    // Clear previous components
    this.components = [];
    this.tags = [];
    this.props = {};

    // Add sprite component with initial frame
    this.addComponent(
      k.sprite("coin", {
        frame: this.currentFrame, // Start with the current frame
        noError: true,
      })
    );

    // Add position and movement components
    this.addComponent(k.pos(GameConfig.CANVAS_WIDTH, laneY));
    this.addComponent(k.scale(GameConfig.COIN_SCALE));
    this.addComponent(
      k.area({
        width: 40,
        height: 40,
      })
    );

    this.addComponent(k.anchor("center"));
    this.addComponent(k.z(5)); // Above the background, below the player
    this.addComponent(k.move(k.LEFT, this.speed));

    // Add tag
    this.addTag("coin");

    // Show borders if enabled
    if (this.showBorders) {
      this.addComponent(k.outline(2, k.rgb(255, 255, 0)));
    }

    // Create the game object
    this.createGameObj();

    // Add destroy when off-screen behavior
    if (this.gameObj) {
      this.gameObj.onUpdate(() => {
        if (this.gameObj && this.gameObj.pos.x < -50) {
          this.destroy();
        }
      });
    }
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
    if (!this.exists() || this.isCollected) return;

    // Update coin movement speed in case the game speed changes
    if (this.gameObj && this.gameObj.exists()) {
      this.gameObj.use(this.k.move(this.k.LEFT, this.speed));

      // Update animation (only if not collected)
      this.updateAnimation();

      // Update hitbox position if it exists
      if (this.hitbox && this.hitbox.exists()) {
        this.hitbox.pos = this.gameObj.pos;
      }
    }
  }

  private updateAnimation(): void {
    if (!this.gameObj || this.isCollected) return;

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
      this.gameObj.frame = this.currentFrame;
    }
  }

  public collect(): void {
    if (!this.exists() || this.isCollected) return;

    // Destroy the hitbox if it exists
    if (this.hitbox && this.hitbox.exists()) {
      this.hitbox.destroy();
      this.hitbox = null;
    }

    this.destroy();

    console.log("Coin collected");

    // Play collection sound - only once and asynchronously
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
