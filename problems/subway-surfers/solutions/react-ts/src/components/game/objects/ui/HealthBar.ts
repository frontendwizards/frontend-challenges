import { KaboomInterface, GameObj } from "../../types/KaboomTypes";

interface HealthBarOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  maxHealth: number;
}

export default class HealthBar {
  private k: KaboomInterface;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private maxHealth: number;
  private currentHealth: number;
  private background: GameObj | null = null;
  private foreground: GameObj | null = null;
  private icon: GameObj | null = null;

  constructor(k: KaboomInterface, options: HealthBarOptions) {
    this.k = k;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.maxHealth = options.maxHealth;
    this.currentHealth = options.maxHealth;
  }

  public init(): void {
    // Create heart icon
    this.icon = this.k.add([
      this.k.text("❤️", { size: 20 }),
      this.k.pos(this.x - 24, this.y - 2),
      this.k.fixed(),
      this.k.z(100),
    ]);

    // Create background (empty health bar) with rounded corners
    this.background = this.k.add([
      this.k.rect(this.width, this.height, { radius: 3 }),
      this.k.pos(this.x, this.y),
      this.k.color(40, 40, 40),
      this.k.fixed(),
      this.k.z(99),
    ]);

    // Create foreground (filled health bar) with rounded corners
    this.foreground = this.k.add([
      this.k.rect(this.width, this.height, { radius: 3 }),
      this.k.pos(this.x, this.y),
      this.k.color(50, 220, 50),
      this.k.fixed(),
      this.k.z(100),
    ]);
  }

  public updateHealth(newHealth: number): void {
    if (!this.foreground || !this.icon) return;

    this.currentHealth = Math.max(0, Math.min(newHealth, this.maxHealth));
    const healthPercentage = this.currentHealth / this.maxHealth;

    // Update health bar width
    this.foreground.width = this.width * healthPercentage;

    // Update colors based on health percentage
    if (healthPercentage > 0.6) {
      this.foreground.color = this.k.rgb(50, 220, 50); // Green
      this.icon.opacity = 1;
    } else if (healthPercentage > 0.3) {
      this.foreground.color = this.k.rgb(220, 220, 50); // Yellow
      this.icon.opacity = 0.8;
    } else {
      this.foreground.color = this.k.rgb(220, 50, 50); // Red
      this.icon.opacity = 0.6;
    }

    // Add pulsing effect when health is low
    if (healthPercentage <= 0.3) {
      const pulseScale = 1 + Math.sin(this.k.dt * 10) * 0.1;
      this.icon.scale = pulseScale;
    } else {
      this.icon.scale = 1;
    }
  }

  public destroy(): void {
    if (this.background && this.background.exists()) {
      this.background.destroy();
    }
    if (this.foreground && this.foreground.exists()) {
      this.foreground.destroy();
    }
    if (this.icon && this.icon.exists()) {
      this.icon.destroy();
    }
    this.background = null;
    this.foreground = null;
    this.icon = null;
  }
}
