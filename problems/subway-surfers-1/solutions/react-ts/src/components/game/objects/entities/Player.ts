import { KaboomInterface, GameObj } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";

export interface PlayerOptions {
  useSprite: boolean;
  initialLane: number;
  lanes: number[];
  showHitboxes: boolean;
}

export default class Player extends GameObject {
  private currentLane: number;
  private lanes: number[];
  private useSprite: boolean;
  private currentFrame: number = 0;
  private animationTimer: number = 0;
  private isAlive: boolean = true;
  private health: number = GameConfig.PLAYER_INITIAL_HEALTH;
  private hitbox: GameObj | null = null;
  private showHitboxes: boolean;

  constructor(kaboomInstance: KaboomInterface, options: PlayerOptions) {
    super(kaboomInstance);
    this.currentLane = options.initialLane;
    this.lanes = options.lanes;
    this.useSprite = options.useSprite;
    this.showHitboxes = options.showHitboxes;
  }

  public init(): void {
    this.createPlayer();
    this.setupCollision();

    if (this.showHitboxes) {
      this.createHitbox();
    }
  }

  public update(dt: number): void {
    if (!this.isAlive || !this.useSprite) return;

    // Update animation
    this.animationTimer += dt;
    if (this.animationTimer > 0.1) {
      this.animationTimer = 0;
      this.updateAnimation();
    }

    // Update hitbox position if it exists
    if (this.hitbox && this.gameObj) {
      this.hitbox.pos = this.gameObj.pos;
    }
  }

  private createPlayer(): void {
    const k = this.k;

    // Clear previous components
    this.components = [];
    this.tags = [];
    this.props = {};

    // Add sprite or circle component
    if (this.useSprite) {
      this.addComponent(k.sprite(`run${this.currentFrame}`, { noError: true }));
    } else {
      this.addComponent(k.circle(20));
      this.addComponent(k.outline(2, k.rgb(255, 255, 255)));
      this.addComponent(k.color(255, 0, 0));
    }

    // Add common components
    this.addComponent(
      k.pos(GameConfig.PLAYER_POSITION_X, this.lanes[this.currentLane])
    );
    this.addComponent(k.anchor("center"));
    this.addComponent(k.area({ scale: 0.7 }));
    this.addComponent(k.scale(GameConfig.SPRITE_SCALE));

    // Add tag
    this.addTag("player");

    // Add properties
    this.addProp("speed", GameConfig.PLAYER_SPEED);
    this.addProp("isAlive", this.isAlive);
    this.addProp("health", this.health);

    // Create the game object
    this.createGameObj();
  }

  private createHitbox(): void {
    if (!this.gameObj) return;

    const k = this.k;
    this.hitbox = k.add([
      k.rect(this.gameObj.width * 0.7, this.gameObj.height * 0.7),
      k.pos(this.gameObj.pos.x, this.gameObj.pos.y),
      k.anchor("center"),
      k.outline(2, k.rgb(0, 255, 0)),
      k.color(0, 255, 0, 0.3),
      "playerHitbox",
    ]);
  }

  private updateAnimation(): void {
    if (!this.gameObj || !this.isAlive) return;

    // Update to next frame
    this.currentFrame = (this.currentFrame + 1) % 10;

    // Save current state
    const oldHealth = this.health;

    // Destroy old player
    this.destroy();

    // Recreate with new frame
    this.health = oldHealth;
    this.createPlayer();
    this.setupCollision();
  }

  private setupCollision(): void {
    if (!this.gameObj) return;

    const k = this.k;

    // Collision detection
    this.gameObj.onCollide("obstacle", (obstacle: GameObj) => {
      // Remove the obstacle when hit
      obstacle.destroy();

      // Decrease health
      this.health--;

      // Update health property on game object
      if (this.gameObj) {
        this.gameObj.health = this.health;
      }

      // Shake screen for feedback
      k.shake(5);

      // Check if player ran out of health
      if (this.health <= 0) {
        this.isAlive = false;
        if (this.gameObj) {
          this.gameObj.isAlive = false;
        }
        k.shake(12);
        k.wait(0.4, () => {
          k.go("gameover", Math.floor(0)); // Score will be passed from scene
        });
      }
    });
  }

  public moveUp(): void {
    if (!this.isAlive || this.currentLane <= 0) return;

    this.currentLane--;
    if (this.gameObj) {
      this.gameObj.moveTo(
        GameConfig.PLAYER_POSITION_X,
        this.lanes[this.currentLane]
      );
    }
  }

  public moveDown(): void {
    if (!this.isAlive || this.currentLane >= 2) return;

    this.currentLane++;
    if (this.gameObj) {
      this.gameObj.moveTo(
        GameConfig.PLAYER_POSITION_X,
        this.lanes[this.currentLane]
      );
    }
  }

  public isPlayerAlive(): boolean {
    return this.isAlive;
  }

  public getHealth(): number {
    return this.health;
  }

  public setHealth(health: number): void {
    this.health = health;
    if (this.gameObj) {
      this.gameObj.health = health;
    }
  }

  public getCurrentLane(): number {
    return this.currentLane;
  }

  public override destroy(): void {
    if (this.hitbox) {
      this.hitbox.destroy();
      this.hitbox = null;
    }
    super.destroy();
  }
}
