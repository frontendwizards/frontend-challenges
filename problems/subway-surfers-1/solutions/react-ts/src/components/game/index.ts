// Main game component
export { default as EndlessRunner } from "./EndlessRunner";

// Core game engine
export { default as GameEngine } from "./core/GameEngine";
export { default as AssetLoader } from "./core/AssetLoader";
export { default as SceneManager } from "./core/SceneManager";

// Game configuration
export { default as GameConfig } from "./config/GameConfig";

// Game objects
export { default as GameObject } from "./objects/base/GameObject";
export { default as Player } from "./objects/entities/Player";
export { default as Obstacle } from "./objects/entities/Obstacle";
export { default as Cloud } from "./objects/environment/Cloud";
export { default as Environment } from "./objects/environment/Environment";
export { default as HealthBar } from "./objects/ui/HealthBar";
export { default as ScoreDisplay } from "./objects/ui/ScoreDisplay";

// Game scenes
export { default as GameplayScene } from "./core/scenes/GameplayScene";
export { default as GameOverScene } from "./core/scenes/GameOverScene";
export { BaseScene } from "./core/scenes/BaseScene";

// Types
export * from "./types/KaboomTypes";
