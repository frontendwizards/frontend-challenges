import { KaboomInterface, GameObj } from "../../types/KaboomTypes";
import { BaseScene } from "./BaseScene";

export default class GameOverScene extends BaseScene {
  private messageText: GameObj | null = null;

  constructor(kaboomInstance: KaboomInterface) {
    super(kaboomInstance);
  }

  public getName(): string {
    return "gameover";
  }

  public create(finalScore?: unknown): void {
    const k = this.k;
    const center = k.center();

    // Create game over UI with score and restart option
    this.messageText = k.add([
      k.text(`Game Over!\nScore: ${finalScore}\nPress space to restart`, {
        size: 36,
        align: "center",
      }),
      k.pos(center[0], center[1]),
      k.anchor("center"),
    ]);

    // Restart game on spacebar press
    k.onKeyPress("space", () => {
      k.go("game");
    });
  }

  public destroy(): void {
    if (this.messageText) {
      this.messageText.destroy();
      this.messageText = null;
    }
  }
}
