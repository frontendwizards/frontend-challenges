import { KaboomInterface, GameObj } from "../../types/KaboomTypes";
import GameObject from "../base/GameObject";

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
  private container: GameObj | null = null;
  private label: GameObj | null = null;

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
    const health = this.currentHealth;

    // Clear previous components
    this.components = [];
    this.tags = [];
    this.props = {};

    // Add health bar components
    this.addComponent(
      k.rect(this.barWidth * (health / this.maxHealth), this.barHeight)
    );
    this.addComponent(k.pos(this.x + 10, this.y + 40));

    // Update color based on health level
    if (health <= this.maxHealth / 3) {
      // Red for low health
      this.addComponent(k.color(255, 0, 0));
    } else if (health <= (this.maxHealth * 2) / 3) {
      // Yellow for medium health
      this.addComponent(k.color(255, 255, 0));
    } else {
      // Green for high health
      this.addComponent(k.color(0, 255, 0));
    }

    // Add z-index property
    this.addProp("z", 101);

    // Create the game object
    this.createGameObj();
  }

  public updateHealth(health: number): void {
    if (!this.gameObj) return;
    this.currentHealth = health;

    // Only destroy the health bar itself, not the container or label
    this.gameObj.destroy();
    this.gameObj = null;

    // Then create a new health bar with the updated health
    this.createHealthBar();
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
