export interface KaboomInterface {
  canvas: HTMLCanvasElement;
  add: (components: unknown[]) => GameObj;
  loadSpriteAtlas: (
    img: HTMLImageElement,
    atlas: Record<string, SpriteAtlasDefinition>
  ) => void;
  loadSprite: (name: string, src: HTMLImageElement) => void;
  rect: (
    width: number,
    height: number,
    options?: Record<string, unknown>
  ) => CompType;
  pos: (x: number, y: number) => CompType;
  outline: (width: number, color: ColorComp) => CompType;
  color: (r: number, g: number, b: number, a?: number) => ColorComp;
  text: (text: string, options?: TextOptions) => CompType;
  anchor: (anchor: string) => CompType;
  circle: (radius: number) => CompType;
  area: (options?: AreaOptions) => CompType;
  scale: (factor: number) => CompType;
  sprite: (name: string, options?: SpriteOptions) => CompType;
  LEFT: string;
  move: (direction: string, speed: number) => CompType;
  wait: (time: number, action: () => void) => ActionReturnType;
  rand: (min: number, max: number) => number;
  randi: (min: number, max: number) => number;
  shake: (intensity: number) => void;
  go: (scene: string, data?: unknown) => void;
  center: () => [number, number];
  scene: (name: string, callback: (data?: unknown) => void) => void;
  onKeyPress: (key: string, callback: () => void) => void;
  onUpdate: (callback: () => void) => void;
  onClick: (tag: string, callback: () => void) => void;
  dt: number;
  rgb: (r: number, g: number, b: number) => ColorComp;
  fixed: () => CompType;
}

export interface SpriteAtlasDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextOptions {
  size?: number;
  align?: string;
}

export interface AreaOptions {
  scale?: number;
}

export interface SpriteOptions {
  noError?: boolean;
}

export interface GameObj {
  exists: () => boolean;
  destroy: () => void;
  pos: Vector2;
  width: number;
  height: number;
  onUpdate: (callback: () => void) => void;
  onCollide: (tag: string, callback: (obj: GameObj) => void) => void;
  isAlive?: boolean;
  health?: number;
  updateHealth?: (health: number) => void;
  value?: number;
  text?: string;
  use: (component: CompType) => void;
  moveTo: (x: number, y: number) => void;
  frame?: number;
  speed?: number;
  cloudParts?: GameObj[];
  offsetX?: number;
  offsetY?: number;
  parentCloud?: GameObj;
}

export interface CompType {
  id: string;
}

export interface ColorComp extends CompType {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface ActionReturnType {
  cancel: () => void;
}

// Declare the kaboom function as a global
export declare global {
  const kaboom: (config?: KaboomConfig) => KaboomInterface;
}

export interface KaboomConfig {
  width?: number;
  height?: number;
  background?: string;
  scale?: number;
  debug?: boolean;
  canvas?: HTMLCanvasElement;
  global?: boolean;
}
