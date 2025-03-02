import { KaboomInterface } from "../../types/KaboomTypes";
import type SceneManager from "../SceneManager";

// Base class for scenes with common functionality
export abstract class BaseScene {
  protected k: KaboomInterface;
  protected sceneManager: SceneManager | null = null;

  constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  public abstract getName(): string;

  public abstract create(data?: unknown): void;

  public register(sceneManager: SceneManager): void {
    this.sceneManager = sceneManager;
    sceneManager.registerScene({
      name: this.getName(),
      create: (_k, data) => {
        this.create(data);
        // Register this scene instance as the current scene instance
        sceneManager.setCurrentSceneInstance(this);
      },
    });
  }

  // Optional destroy method for cleanup
  public destroy(): void {}
}
