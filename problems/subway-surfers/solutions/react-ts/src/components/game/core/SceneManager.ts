import { KaboomInterface } from "../types/KaboomTypes";

export interface GameSceneConfig {
  name: string;
  create: (k: KaboomInterface, data?: unknown) => void;
  destroy?: () => void;
}

export default class SceneManager {
  private k: KaboomInterface;
  private scenes: Map<string, GameSceneConfig> = new Map();
  private currentScene: string | null = null;
  private currentSceneInstance: { destroy?: () => void } | null = null;

  constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  public registerScene(config: GameSceneConfig): void {
    this.scenes.set(config.name, config);

    // Register scene with Kaboom
    this.k.scene(config.name, (data: unknown) => {
      config.create(this.k, data);
    });
  }

  public startScene(name: string, data?: unknown): void {
    if (!this.scenes.has(name)) {
      console.error(`Scene ${name} not found`);
      return;
    }

    console.log(
      `SceneManager: Transitioning from scene '${this.currentScene}' to '${name}'`
    );

    // Clean up current scene if it exists
    if (this.currentSceneInstance?.destroy) {
      console.log(`log: SceneManager: Cleaning up scene '${this.currentScene}'`);
      try {
        this.currentSceneInstance.destroy();
      } catch (error) {
        console.error(`Error cleaning up scene '${this.currentScene}':`, error);
      }
    }

    // Update current scene before going to the new scene
    this.currentScene = name;
    this.currentSceneInstance = null; // Clear current instance before creating new one

    // Go to the new scene - this will trigger the create function which will set the new currentSceneInstance
    console.log(`SceneManager: Starting scene '${name}'`);
    this.k.go(name, data);
  }

  public getCurrentScene(): string | null {
    return this.currentScene;
  }

  public setCurrentSceneInstance(instance: { destroy?: () => void }): void {
    this.currentSceneInstance = instance;
  }
}

export { default as GameplayScene } from "./scenes/GameplayScene";
export { default as GameOverScene } from "./scenes/GameOverScene";
