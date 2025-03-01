import { KaboomInterface } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";
import GameConfig from "../../config/GameConfig";

export interface HealthBarOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  maxHealth: number;
}

export default class HealthBar extends GameObject {
  private x: number;
  private y: number;
  private barWidth: number;
  private barHeight: number;
  private maxHealth: number;
  private currentHealth: number;
  private container: any = null;
  private label: any = null;

  constructor(kaboomInstance: KaboomInterface, options: HealthBarOptions) {
    super(kaboomInstance);
    this.x = options.x;
    this.y = options.y;
    this.barWidth = options.width;
    this.barHeight = options.height;
    this.maxHealth = options.maxHealth;
    this.currentHealth = options.maxHealth;
  }

  public init(): void {
    this.createContainer();
    this.createLabel();
    this.createHealthBar();
  }

  public update(dt: number): void {
    // Health bar doesn't need per-frame updates
  }

  private createContainer(): void {
    const k = this.k;

    // Create container for health bar
    this.container = k.add([
      k.rect(100, 60), // Make taller to include both text and bar
      k.pos(this.x, this.y),
      k.outline(2, k.rgb(255, 255, 255)),
      k.color(0, 0, 0, 0.7), // Semi-transparent black
      { z: 100 }, // Keep above other elements
    ]);
  }

  private createLabel(): void {
    const k = this.k;

    // Create health label
    this.label = k.add([
      k.text("HEALTH", { size: 16 }),
      k.pos(this.x + 50, this.y + 15),
      k.anchor("center"),
      k.color(255, 255, 255),
      { z: 101 }, // Above container
    ]);
  }

  private createHealthBar(): void {
    const k = this.k;

    // Clear previous components
    this.components = [];
    this.tags = [];
    this.props = {};

    // Add health bar components
    this.addComponent(k.rect(this.barWidth, this.barHeight));
    this.addComponent(k.pos(this.x + 10, this.y + 40));
    this.addComponent(k.color(0, 255, 0));

    // Add z-index property
    this.addProp("z", 101);

    // Add custom update health method
    this.addProp("updateHealth", (health: number) => {
      this.updateHealth(health);
    });

    // Create the game object
    this.createGameObj();
  }

  public updateHealth(health: number): void {
    if (!this.gameObj) return;

    this.currentHealth = health;

    // Update health bar width based on current health
    this.gameObj.width = (health / this.maxHealth) * this.barWidth;

    // Update color based on health level
    if (health <= this.maxHealth / 3) {
      this.gameObj.color = this.k.rgb(255, 0, 0); // Red for low health
    } else if (health <= (this.maxHealth * 2) / 3) {
      this.gameObj.color = this.k.rgb(255, 255, 0); // Yellow for medium health
    } else {
      this.gameObj.color = this.k.rgb(0, 255, 0); // Green for high health
    }
  }

  public override destroy(): void {
    // Destroy container and label
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    if (this.label) {
      this.label.destroy();
      this.label = null;
    }

    // Destroy the health bar
    super.destroy();
  }
}
