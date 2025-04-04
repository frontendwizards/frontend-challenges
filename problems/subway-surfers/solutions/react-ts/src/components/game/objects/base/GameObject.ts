import { KaboomInterface, GameObj, CompType } from "../../types/KaboomTypes";

/**
 * Base class for all game objects
 */
export default abstract class GameObject {
  protected k: KaboomInterface;
  protected gameObj: GameObj | null = null;
  protected components: CompType[] = [];
  protected tags: string[] = [];
  protected props: Record<string, unknown> = {};

  constructor(kaboomInstance: KaboomInterface) {
    this.k = kaboomInstance;
  }

  /**
   * Initialize the game object with components, tags, and properties
   */
  public abstract init(...args: unknown[]): void;

  /**
   * Update method called every frame
   */
  public update(_dt: number): void {}

  /**
   * Get the underlying Kaboom game object
   */
  public getGameObj(): GameObj | null {
    return this.gameObj;
  }

  /**
   * Add a component to the game object
   */
  protected addComponent(component: CompType): void {
    this.components.push(component);
  }

  /**
   * Add a tag to the game object
   */
  protected addTag(tag: string): void {
    this.tags.push(tag);
  }

  protected getTags(): string[] {
    return this.tags;
  }

  /**
   * Add a property to the game object
   */
  protected addProp(key: string, value: unknown): void {
    this.props[key] = value;
  }

  public hasProp(key: string): boolean {
    return this.props[key] !== undefined;
  }

  /**
   * Clear all components, tags, and properties
   */
  protected clearComponents(): void {
    this.components = [];
    this.tags = [];
    this.props = {};
  }

  /**
   * Create the game object with all components, tags, and properties
   */
  protected createGameObj(): void {
    if (this.components.length === 0) {
      throw new Error("Cannot create game object without components");
    }

    this.gameObj = this.k.add([...this.components, ...this.tags, this.props]);
  }

  /**
   * Destroy the game object
   */
  public destroy(): void {
    if (this.gameObj) {
      this.gameObj.destroy();
      this.gameObj = null;
    }
  }

  /**
   * Check if the game object exists
   */
  public exists(): boolean {
    return this.gameObj !== null && this.gameObj.exists();
  }

  public updateGameObjFrame(newFrame: number): void {
    if (this.gameObj) {
      this.gameObj.frame = newFrame;
    }
  }

  // Add a method to update the sprite of the existing gameObj
  public updateGameObjSprite(spriteName: string): void {
    if (!this.gameObj) return;

    try {
      // Remove the current sprite component
      const spriteComp = this.gameObj.get("sprite");
      if (spriteComp) {
        this.gameObj.unuse("sprite");
      }

      // Add the new sprite component
      this.gameObj.use(this.k.sprite(spriteName));
    } catch (error) {
      console.warn(`Failed to update player sprite to ${spriteName}`, error);
    }
  }
}
