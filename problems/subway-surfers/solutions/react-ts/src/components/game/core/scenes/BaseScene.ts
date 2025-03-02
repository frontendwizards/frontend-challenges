import { KaboomInterface } from "../../types/KaboomTypes";
import type SceneManager from "../SceneManager";

// Base class for scenes with common functionality
export abstract class BaseScene {
  protected k: KaboomInterface;

  constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  public abstract getName(): string;

  public abstract create(data?: unknown): void;

  public register(sceneManager: SceneManager): void {
    sceneManager.registerScene({
      name: this.getName(),
      create: (_k, data) => this.create(data),
    });
  }

  // Optional destroy method for cleanup
  public destroy(): void {}
}
