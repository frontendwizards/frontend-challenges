import { Vec2 } from "kaboom";

export interface KaboomInterface {
  canvas: HTMLCanvasElement;
  add: (components: unknown[]) => GameObj;
  loadSpriteAtlas: (
    img: HTMLImageElement,
    atlas: Record<string, SpriteAtlasDefinition>
  ) => void;
  loadSprite: (
    name: string,
    src: string | HTMLImageElement,
    options?: LoadSpriteOptions
  ) => void;
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
  onDraw: (callback: () => void) => void;
  onClick: (tag: string, callback: () => void) => void;
  dt: number;
  rgb: (r: number, g: number, b: number) => ColorComp;
  fixed: () => CompType;
  destroyAll: () => void;
  scenes: Record<string, unknown>;
  assets: Record<string, unknown>;
  onCollide: (
    tag1: string,
    tag2: string,
    callback: (a: GameObj, b: GameObj) => void
  ) => void;
  layers: (layers: string[], def?: string) => void;
  layer: (layer: string) => CompType;
  z: (z: number) => CompType;
  width: number;
  height: number;
  debug: DebugInfo;
  vec2: (x: number, y: number) => Vec2;
}

export interface DebugInfo {
  paused: boolean;
  timeScale: number;
  showLog: boolean;
  fps: number;
  objCount: number;
  drawCalls: number;
}

export interface LoadSpriteOptions {
  sliceX?: number;
  sliceY?: number;
  anims?: Record<string, AnimationDefinition>;
  noError?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface AnimationDefinition {
  from: number;
  to: number;
  speed: number;
  loop?: boolean;
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
  width?: number;
  font?: string;
  lineSpacing?: number;
  letterSpacing?: number;
  transform?: (idx: number, char: string) => unknown;
}

export interface AreaOptions {
  scale?: number;
  width?: number;
  height?: number;
  offset?: Vector2;
  shape?: "rect" | "polygon";
  cursor?: string;
}

export interface SpriteOptions {
  noError?: boolean;
  animSpeed?: number;
  frame?: number;
  flipX?: boolean;
  flipY?: boolean;
  width?: number;
  height?: number;
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
  play: (anim: string, options?: { loop?: boolean }) => void;
  scale: Vector2 | number;
  flipX: boolean;
  flipY: boolean;
  hidden: boolean;
  paused: boolean;
  add: (comp: CompType) => void;
  remove: (comp: CompType) => void;
  onDestroy: (callback: () => void) => void;
  z: number;
  isCollected?: boolean;
  unuse: (component: string) => void;
  get: (component: string) => CompType;
  color: ColorComp;
  icon: GameObj;
  opacity: number;
  vec2: (x: number, y: number) => Vec2;
  lerp: (a: number, b: number, t: number) => number;
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
declare global {
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
  crisp?: boolean;
  touchToMouse?: boolean;
  pixelDensity?: number;
  stretch?: boolean;
  letterbox?: boolean;
}
