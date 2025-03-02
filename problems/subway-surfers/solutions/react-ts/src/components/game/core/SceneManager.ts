import { KaboomInterface } from "../types/KaboomTypes";

export interface GameSceneConfig {
  name: string;
  create: (k: KaboomInterface, data?: unknown) => void;
}

export default class SceneManager {
  private k: KaboomInterface;
  private scenes: Map<string, GameSceneConfig> = new Map();
  private currentScene: string | null = null;

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

    this.currentScene = name;
    this.k.go(name, data);
  }

  public getCurrentScene(): string | null {
    return this.currentScene;
  }
}

export { default as GameplayScene } from "./scenes/GameplayScene";
export { default as GameOverScene } from "./scenes/GameOverScene";