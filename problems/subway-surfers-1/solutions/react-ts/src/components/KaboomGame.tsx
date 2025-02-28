import React, { useEffect, useRef, useState } from "react";

// Import kaboom as a type to avoid TypeScript errors
interface KaboomInterface {
  canvas: HTMLCanvasElement;
  add: (components: any[]) => any;
  loadSpriteAtlas: (img: any, atlas: any) => void;
  rect: (width: number, height: number, options?: any) => any;
  pos: (x: number, y: number) => any;
  outline: (width: number, color: any) => any;
  color: (r: number, g: number, b: number, a?: number) => any;
  text: (text: string, options?: any) => any;
  anchor: (anchor: string) => any;
  circle: (radius: number) => any;
  area: (options?: any) => any;
  scale: (factor: number) => any;
  sprite: (name: string, options?: any) => any;
  LEFT: string;
  move: (direction: string, speed: number) => any;
  wait: (time: number, action: () => void) => any;
  rand: (min: number, max: number) => number;
  randi: (min: number, max: number) => number;
  shake: (intensity: number) => void;
  go: (scene: string, data?: any) => void;
  center: () => [number, number];
  scene: (name: string, callback: (data?: any) => void) => void;
  onKeyPress: (key: string, callback: () => void) => void;
  onUpdate: (callback: () => void) => void;
  onClick: (tag: string, callback: () => void) => void;
  dt: number;
}

declare const kaboom: () => KaboomInterface;

const KaboomGame: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showSpritePreview, setShowSpritePreview] = useState(false);
  const [showBorders, setShowBorders] = useState(false);

  useEffect(() => {
    // Make sure the container is available
    if (!gameContainerRef.current) return;

    // Ensure we can access the container element
    const gameContainer = gameContainerRef.current;

    // Clean up the container
    gameContainer.innerHTML = "";

    // Load Kaboom script dynamically
    const script = document.createElement("script");
    script.src = "https://unpkg.com/kaboom@3000.0.0-beta.2/dist/kaboom.js";
    script.async = true;

    script.onload = () => {
      // Initialize Kaboom with larger game window
      const k = kaboom({
        width: 1000, // Increased from 800
        height: 600, // Increased from 400
        background: [0, 0, 0], // Black background
        scale: 1,
        debug: false,
        canvas: document.createElement("canvas"),
        global: true,
      });

      // Append canvas to our container
      if (k.canvas) {
        gameContainer.appendChild(k.canvas);
      }

      // Game variables
      let score = 0;
      const LANE_HEIGHT = 600; // Updated
      const LANE_WIDTH = 1000; // Updated
      const LANE_Y = [LANE_HEIGHT / 4, LANE_HEIGHT / 2, (3 * LANE_HEIGHT) / 4]; // Three lanes
      const PLAYER_X = 150; // Adjusted for larger screen
      const SPEED = 520;
      const OBSTACLE_SPEED = 320;
      const SPAWN_INTERVAL = [0.8, 2.5]; // Random interval between obstacle spawns

      // Track loaded assets
      let assetsLoaded = 0;
      const assetsToLoad = 2; // We'll load temple run character instead

      // Function to check if all assets are loaded
      const checkAllAssetsLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded >= assetsToLoad) {
          // Now that assets are loaded, start the appropriate scene
          if (showSpritePreview) {
            k.go("spritePreview");
          } else {
            startGame();
          }
        }
      };

      // Load the Temple Run character sprites
      let spriteLoadSuccess = false;

      // Try to load all individual frames
      for (let i = 0; i < 10; i++) {
        const img = new Image();
        img.src = `/assets/characters/templerun/Run__00${i}.png`;
        img.onload = () => {
          // Just register each sprite individually without trying to make a sprite sheet
          k.loadSprite(`run${i}`, img);

          // Mark first sprite loaded to indicate we have characters available
          if (i === 0) {
            spriteLoadSuccess = true;
            checkAllAssetsLoaded();
          }
        };

        img.onerror = () => {
          console.error(`Failed to load Temple Run sprite ${i}`);
          if (i === 0) {
            checkAllAssetsLoaded(); // Continue even if loading fails
          }
        };
      }

      // Load obstacle sprites
      const obstaclesImage = new Image();
      obstaclesImage.src = "/obstacles.jpg"; // Make sure this is in your public folder

      obstaclesImage.onload = () => {
        // Create a sprite atlas for obstacles
        k.loadSpriteAtlas(obstaclesImage, {
          obstacle0: {
            x: 0,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle1: {
            x: obstaclesImage.width / 5,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle2: {
            x: (2 * obstaclesImage.width) / 5,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle3: {
            x: (3 * obstaclesImage.width) / 5,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle4: {
            x: (4 * obstaclesImage.width) / 5,
            y: 0,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle5: {
            x: 0,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle6: {
            x: obstaclesImage.width / 5,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle7: {
            x: (2 * obstaclesImage.width) / 5,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle8: {
            x: (3 * obstaclesImage.width) / 5,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
          obstacle9: {
            x: (4 * obstaclesImage.width) / 5,
            y: obstaclesImage.height / 2,
            width: obstaclesImage.width / 5,
            height: obstaclesImage.height / 2,
          },
        });
        checkAllAssetsLoaded();
      };

      obstaclesImage.onerror = () => {
        console.error("Failed to load obstacles sprite");
        checkAllAssetsLoaded();
      };

      // Create a sprite preview scene
      k.scene("spritePreview", () => {
        // Background
        k.add([
          k.rect(LANE_WIDTH, LANE_HEIGHT),
          k.color(20, 20, 20), // Dark gray background
        ]);

        // Add title
        k.add([
          k.text("Sprite Animation Preview", { size: 32 }),
          k.pos(LANE_WIDTH / 2, 50),
          k.anchor("center"),
          k.color(255, 255, 255),
        ]);

        // Add the animated sprite
        const animatedSprite = k.add([
          k.sprite("runner"),
          k.pos(LANE_WIDTH / 2, LANE_HEIGHT / 2),
          k.anchor("center"),
          k.scale(0.3), // Scale down to proper size
        ]);

        // Play the running animation
        animatedSprite.play("run");

        // Add obstacle preview
        if (obstaclesImage.complete) {
          // Add title for obstacles
          k.add([
            k.text("Obstacles", { size: 20 }),
            k.pos(LANE_WIDTH / 2, LANE_HEIGHT - 100),
            k.anchor("center"),
            k.color(255, 255, 255),
          ]);

          // Show some sample obstacles
          for (let i = 0; i < 5; i++) {
            k.add([
              k.sprite(`obstacle${i}`),
              k.pos(100 + i * 150, LANE_HEIGHT - 60),
              k.anchor("center"),
              k.scale(0.6),
            ]);
          }
        }

        // Instructions for going back to the game
        k.add([
          k.text("Press SPACE to go to the game", { size: 16 }),
          k.pos(LANE_WIDTH / 2, LANE_HEIGHT - 20),
          k.anchor("center"),
          k.color(255, 255, 255),
        ]);

        // Key binding to switch to game
        k.onKeyPress("space", () => {
          setShowSpritePreview(false);
          k.go("game");
        });
      });

      // Game scene
      function startGame() {
        k.scene("game", () => {
          // add grey background
          k.add([
            k.rect(LANE_WIDTH, LANE_HEIGHT),
            k.color(100, 100, 100),
          ]);

          // Add player character
          let currentLane = 1;
          let currentFrame = 0;

          let player = k.add([
            k.sprite("run0", { noError: true }) || k.circle(20),
            // Add outline and color only if using circle
            ...(spriteLoadSuccess
              ? []
              : [k.outline(2, k.rgb(255, 255, 255)), k.color(255, 0, 0)]),
            k.pos(PLAYER_X, LANE_Y[currentLane]),
            k.anchor("center"),
            k.area({ scale: 0.7 }),
            "player",
            {
              speed: SPEED,
              isAlive: true,
              health: 3,
              // Add custom animation method
              changeFrame(newFrame) {
                currentFrame = newFrame;
                // Create a new sprite object but don't change component structure
                this.frame = newFrame;
              },
            },
            k.scale(0.2),
          ]);

          // Animate Temple Run character manually without breaking collision
          let animationTimer = 0;
          k.onUpdate(() => {
            if (player.isAlive) {
              animationTimer += k.dt();
              if (animationTimer > 0.1) {
                // Change frame every 100ms
                animationTimer = 0;
                const newFrame = (currentFrame + 1) % 10;

                // Simply destroy and recreate the player with new sprite
                // Save current position and state
                const oldLane = currentLane;
                const oldHealth = player.health;

                // Create a new sprite at same position with new frame
                player.destroy();

                // Recreate player with new frame
                const newPlayer = k.add([
                  k.sprite(`run${newFrame}`, { noError: true }) || k.circle(20),
                  ...(spriteLoadSuccess
                    ? []
                    : [k.outline(2, k.rgb(255, 255, 255)), k.color(255, 0, 0)]),
                  k.pos(PLAYER_X, LANE_Y[oldLane]),
                  k.anchor("center"),
                  k.area({ scale: 0.7 }),
                  "player",
                  {
                    speed: SPEED,
                    isAlive: true,
                    health: oldHealth,
                  },
                  k.scale(0.2),
                ]);

                // Update player reference
                player = newPlayer;
                currentFrame = newFrame;
              }
            }
          });

          // Add UI elements
          // Health display
          const healthContainer = k.add([
            k.rect(100, 30),
            k.pos(LANE_WIDTH - 120, 20),
            k.outline(2, k.rgb(255, 255, 255)),
            k.color(0, 0, 0, 0), // Transparent fill
          ]);

          const healthDisplay = k.add([
            k.text("HEALTH", { size: 16 }),
            k.pos(LANE_WIDTH - 120 + 50, 20 + 15),
            k.anchor("center"),
            k.color(255, 255, 255),
          ]);

          const healthBar = k.add([
            k.rect(80, 10),
            k.pos(LANE_WIDTH - 110, 60),
            k.color(0, 255, 0),
            {
              updateHealth: function (health: number) {
                this.width = (health / 3) * 80;
                if (health <= 1) this.color = k.rgb(255, 0, 0);
                else if (health === 2) this.color = k.rgb(255, 255, 0);
              },
            },
          ]);

          // Player controls (move up and down between lanes)
          k.onKeyPress("up", () => {
            if (player.isAlive && currentLane > 0) {
              currentLane--;
              player.moveTo(PLAYER_X, LANE_Y[currentLane]);
            }
          });

          k.onKeyPress("down", () => {
            if (player.isAlive && currentLane < 2) {
              currentLane++;
              player.moveTo(PLAYER_X, LANE_Y[currentLane]);
            }
          });

          // Score display
          const scoreLabel = k.add([
            k.text("Score: 0", { size: 24 }),
            k.pos(24, 24),
            k.fixed(),
            { value: 0 },
          ]);

          // Update score
          k.onUpdate(() => {
            if (player.isAlive) {
              score += k.dt();
              scoreLabel.value = Math.floor(score);
              scoreLabel.text = `Score: ${scoreLabel.value}`;
            }
          });

          // Obstacle spawning
          function spawnObstacle() {
            if (!player.isAlive) return;

            // Randomly choose a lane
            const obstacleLane = k.randi(0, 3);

            // Randomly choose one of the 10 obstacle sprites
            const obstacleIndex = k.randi(0, 10);
            const spriteName = `obstacle${obstacleIndex}`;

            // Create obstacle with transparent background
            const obstacleObj = k.add([
              k.sprite(spriteName, { noError: true }) || k.rect(60, 60),
              // Add outline based on showBorders state
              ...(showBorders ? [k.outline(2, k.rgb(255, 0, 0))] : []),
              k.pos(LANE_WIDTH, LANE_Y[obstacleLane]),
              k.anchor("center"),
              k.area({ scale: 0.8 }), // More accurate hitbox
              k.move(k.LEFT, OBSTACLE_SPEED),
              "obstacle",
              k.scale(0.2),
              // Remove white background by making it transparent
              k.color(255, 255, 255, 0),
            ]);

            // Schedule next obstacle spawn
            k.wait(k.rand(SPAWN_INTERVAL[0], SPAWN_INTERVAL[1]), spawnObstacle);
          }

          // Start spawning obstacles
          spawnObstacle();

          // Collision detection
          player.onCollide("obstacle", (obstacle: any) => {
            // Remove the obstacle when hit
            obstacle.destroy();

            // Decrease health
            player.health--;
            healthBar.updateHealth(player.health);

            // Shake screen for feedback
            k.shake(5);

            // Check if player ran out of health
            if (player.health <= 0) {
              player.isAlive = false;
              k.shake(12);
              k.wait(0.4, () => {
                k.go("gameover", score);
              });
            }
          });
        });

        // Game over scene
        k.scene("gameover", (score: number) => {
          k.add([
            k.text(`Game Over!\nScore: ${score}\nPress space to restart`, {
              size: 36,
              align: "center",
            }),
            k.pos(k.center()),
            k.anchor("center"),
          ]);

          // Restart game
          k.onKeyPress("space", () => {
            score = 0;
            k.go("game");
          });
        });

        // Start the game
        k.go("game");
      }
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      gameContainer.innerHTML = "";
    };
  }, [showSpritePreview, showBorders]); // Added showBorders to dependency array

  return (
    <div>
      <div
        ref={gameContainerRef}
        style={{
          width: "1000px", // Increased from 800px
          height: "600px", // Increased from 400px
          margin: "0 auto",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
        }}
      />
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <button
          onClick={() => setShowSpritePreview(!showSpritePreview)}
          style={{
            padding: "8px 16px",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          {showSpritePreview ? "Go to Game" : "View Sprite Animation"}
        </button>
        <button
          onClick={() => setShowBorders(!showBorders)}
          style={{
            padding: "8px 16px",
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {showBorders ? "Hide Borders" : "Show Borders"}
        </button>
      </div>
    </div>
  );
};

export default KaboomGame;
