import { BaseScene } from "./BaseScene";

export default class SpritePreviewScene extends BaseScene {
  public getName(): string {
    return "spritePreview";
  }

  public create(): void {
    const k = this.k;
    const WIDTH = 1000; // Use GameConfig in a real implementation
    const HEIGHT = 600;

    // Background
    k.add([
      k.rect(WIDTH, HEIGHT),
      k.color(20, 20, 20), // Dark gray background
    ]);

    // Add title
    k.add([
      k.text("Sprite Animation Preview", { size: 32 }),
      k.pos(WIDTH / 2, 50),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    // Try to add the animated sprite
    try {
      k.add([
        k.sprite("run0", { noError: true }),
        k.pos(WIDTH / 2, HEIGHT / 2),
        k.anchor("center"),
        k.scale(0.3), // Scale down to proper size
      ]);
    } catch (_error) {
      // If sprite loading fails, add a message
      k.add([
        k.text("Sprite could not be loaded", { size: 20 }),
        k.pos(WIDTH / 2, HEIGHT / 2),
        k.anchor("center"),
        k.color(255, 100, 100),
      ]);
    }

    // Instructions for going back to the game
    k.add([
      k.text("Press SPACE to go to the game", { size: 16 }),
      k.pos(WIDTH / 2, HEIGHT - 20),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    // Key binding to switch to game
    k.onKeyPress("space", () => {
      k.go("game");
    });
  }
}
