import React, { useEffect, useRef, useState } from "react";

// Import kaboom as a type to avoid TypeScript errors
interface KaboomInterface {
  canvas: HTMLCanvasElement;
  add: (components: any[]) => any;
  loadSpriteAtlas: (img: any, atlas: any) => void;
  loadSprite: (name: string, src: any) => void;
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
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [gameDifficulty, setGameDifficulty] = useState("hard"); // "easy", "normal", "hard"

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
        background: "#d9b98e", // Black background
        scale: 1,
        debug: showHitboxes, // Enable debug mode when hitboxes are shown
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

      // Make sky percentage easily configurable
      const SKY_PERCENTAGE = 0.35; // 35% of the screen

      // Update lane positions to be on the ground
      // Calculate lane positions based on the desert portion
      const groundStartY = LANE_HEIGHT * SKY_PERCENTAGE;
      const groundHeight = LANE_HEIGHT * (1 - SKY_PERCENTAGE);

      // Recalculate lane positions to be evenly distributed on the ground
      const LANE_Y_ADJUSTED = [
        groundStartY + groundHeight * 0.25, // Top lane on the ground
        groundStartY + groundHeight * 0.5, // Middle lane on the ground
        groundStartY + groundHeight * 0.75, // Bottom lane on the ground
      ];

      // Set game difficulty parameters
      const SPEED = 520;
      let OBSTACLE_SPEED = 320;
      let SPAWN_INTERVAL = [0.8, 2.5]; // [min, max] spawn interval

      // Adjust difficulty based on selection
      if (gameDifficulty === "easy") {
        OBSTACLE_SPEED = 250;
        SPAWN_INTERVAL = [1.2, 3.0];
      } else if (gameDifficulty === "hard") {
        OBSTACLE_SPEED = 450;
        SPAWN_INTERVAL = [0.5, 1.5];
      }

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
      obstaclesImage.src = "/obstacles.png"; // Make sure this is in your public folder

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
          // Blue sky (configurable height)
          k.add([
            k.rect(LANE_WIDTH, LANE_HEIGHT * SKY_PERCENTAGE),
            k.pos(0, 0),
            k.color(135, 206, 235), // Sky blue color
            { z: -200 }, // Place behind everything
          ]);

          // Desert sand (remaining screen height)
          k.add([
            k.rect(LANE_WIDTH, LANE_HEIGHT * (1 - SKY_PERCENTAGE) + 10), // Slight overlap to avoid gaps
            k.pos(0, LANE_HEIGHT * SKY_PERCENTAGE - 5), // Start below the sky with slight overlap
            k.color(217, 185, 142), // Same sand color
            { z: -180 }, // In front of sky but behind other elements
          ]);

          // Horizon line where sky meets desert
          k.add([
            k.rect(LANE_WIDTH, 4),
            k.pos(0, LANE_HEIGHT * SKY_PERCENTAGE - 2),
            k.color(200, 170, 120), // Slightly darker than sand
            { z: -185 },
          ]);

          // Add a sun in the corner
          k.add([
            k.circle(60),
            k.pos(LANE_WIDTH - 100, LANE_HEIGHT * SKY_PERCENTAGE * 0.4), // Position relative to sky height
            k.color(255, 220, 100),
            { z: -150 },
          ]);

          // Create an array to store cloud objects for animation
          const clouds = [];

          // Add moving clouds in the sky
          for (let i = 0; i < 8; i++) {
            const cloudSize = k.rand(40, 80);
            const xPos = k.rand(0, LANE_WIDTH);
            const yPos = k.rand(10, LANE_HEIGHT * SKY_PERCENTAGE * 0.8); // Keep clouds in the sky
            const cloudSpeed = k.rand(10, 30); // Random speed for each cloud

            // Create a cloud object with multiple circles
            const mainCloud = k.add([
              k.circle(cloudSize / 2),
              k.pos(xPos, yPos),
              k.color(255, 255, 255, 0.8),
              { z: -190 },
              // Add custom properties for animation
              {
                speed: cloudSpeed,
                cloudParts: [], // Store additional cloud circles
              },
            ]);

            // Add additional circles to make the cloud fluffy
            for (let j = 0; j < 3; j++) {
              const offsetX = k.rand(-cloudSize / 2, cloudSize / 2);
              const offsetY = k.rand(-cloudSize / 4, cloudSize / 4);

              const cloudPart = k.add([
                k.circle(cloudSize / 2.5),
                k.pos(xPos + offsetX, yPos + offsetY),
                k.color(255, 255, 255, 0.7),
                { z: -190 },
                {
                  parentCloud: mainCloud,
                  offsetX: offsetX,
                  offsetY: offsetY,
                },
              ]);

              // Add this part to the main cloud's parts array
              mainCloud.cloudParts.push(cloudPart);
            }

            // Add the cloud to our tracking array
            clouds.push(mainCloud);
          }

          // Cloud movement animation in game update loop
          k.onUpdate(() => {
            // Move all clouds
            clouds.forEach((cloud) => {
              // Move the main cloud part
              cloud.pos.x -= cloud.speed * k.dt();

              // Move all child parts along with the main cloud
              cloud.cloudParts.forEach((part) => {
                part.pos.x = cloud.pos.x + part.offsetX;
              });

              // If cloud moves off-screen, reposition to the right side
              if (cloud.pos.x < -100) {
                // Reset to right side with new height
                cloud.pos.x = LANE_WIDTH + 100;
                cloud.pos.y = k.rand(10, LANE_HEIGHT * SKY_PERCENTAGE * 0.8);

                // Update child parts positions
                cloud.cloudParts.forEach((part) => {
                  part.pos.y = cloud.pos.y + part.offsetY;
                });
              }
            });

            // Rest of game update logic...
          });

          // Add player character
          let currentLane = 1;
          let currentFrame = 0;

          // Progressive difficulty variables
          let gameTime = 0;
          let currentObstacleSpeed = OBSTACLE_SPEED;
          const MAX_SPEED_INCREASE = 300; // Maximum speed increase over time

          let player = k.add([
            k.sprite("run0", { noError: true }) || k.circle(20),
            // Add outline and color only if using circle
            ...(spriteLoadSuccess
              ? []
              : [k.outline(2, k.rgb(255, 255, 255)), k.color(255, 0, 0)]),
            k.pos(150, LANE_Y_ADJUSTED[currentLane]),
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

          // If showing hitboxes, add a visible outline to the player's collision area
          if (showHitboxes) {
            const playerHitbox = k.add([
              k.rect(player.width * 0.7, player.height * 0.7),
              k.pos(150, LANE_Y_ADJUSTED[currentLane]),
              k.anchor("center"),
              k.outline(2, k.rgb(0, 255, 0)),
              k.color(0, 255, 0, 0.3),
              "playerHitbox",
            ]);

            // Keep hitbox synced with player
            k.onUpdate(() => {
              if (player.isAlive) {
                playerHitbox.pos = player.pos;
              }
            });
          }

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
                  k.pos(150, LANE_Y_ADJUSTED[oldLane]),
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
            k.rect(100, 60), // Make taller to include both text and bar
            k.pos(LANE_WIDTH - 120, 20),
            k.outline(2, k.rgb(255, 255, 255)),
            k.color(0, 0, 0, 0.7), // Semi-transparent black
            { z: 100 }, // Keep above other elements
          ]);

          const healthDisplay = k.add([
            k.text("HEALTH", { size: 16 }),
            k.pos(LANE_WIDTH - 120 + 50, 20 + 15),
            k.anchor("center"),
            k.color(255, 255, 255),
            { z: 101 }, // Above container
          ]);

          const healthBar = k.add([
            k.rect(80, 10),
            k.pos(LANE_WIDTH - 110, 60),
            k.color(0, 255, 0),
            {
              z: 101, // Above container
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
              player.moveTo(150, LANE_Y_ADJUSTED[currentLane]);
            }
          });

          k.onKeyPress("down", () => {
            if (player.isAlive && currentLane < 2) {
              currentLane++;
              player.moveTo(150, LANE_Y_ADJUSTED[currentLane]);
            }
          });

          // Score display
          const scoreBackground = k.add([
            k.rect(150, 40), // Background size for score
            k.pos(24, 24),
            k.color(0, 0, 0, 0.7), // Semi-transparent black background
            k.fixed(),
            k.outline(2, k.rgb(255, 255, 255)),
            { z: 100 }, // Ensure it's above other elements
          ]);

          const scoreLabel = k.add([
            k.text("Score: 0", { size: 24 }),
            k.pos(24 + 10, 24 + 20), // Slight padding inside the background
            k.anchor("left"),
            k.color(255, 255, 255), // Keep white text but now against dark background
            k.fixed(),
            { value: 0, z: 101 }, // Ensure text is above background
          ]);

          // Update score and progressively increase difficulty
          k.onUpdate(() => {
            if (player.isAlive) {
              // Update game time and score
              gameTime += k.dt();
              score += k.dt();
              scoreLabel.value = Math.floor(score);
              scoreLabel.text = `Score: ${scoreLabel.value}`;

              // Increase obstacle speed gradually over time
              // This makes the game progressively harder the longer you play
              const speedIncrease = Math.min(
                MAX_SPEED_INCREASE,
                Math.floor(gameTime / 10) * 20 // Increase by 20 every 10 seconds
              );
              currentObstacleSpeed = OBSTACLE_SPEED + speedIncrease;
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

            // Random size variation to make gameplay more dynamic
            const sizeVariation = k.rand(0.7, 1.1);

            // Create obstacle with transparent background
            const obstacleObj = k.add([
              k.sprite(spriteName, { noError: true }) || k.rect(60, 60),
              // Add outline based on showBorders state
              ...(showBorders ? [k.outline(2, k.rgb(255, 0, 0))] : []),
              k.pos(LANE_WIDTH, LANE_Y_ADJUSTED[obstacleLane]),
              k.anchor("center"),
              k.area({ scale: 0.8 }), // More accurate hitbox
              k.move(k.LEFT, currentObstacleSpeed), // Use the current speed that increases over time
              "obstacle",
              k.scale(0.8 * sizeVariation), // Add some size variation
              // Apply two color transformations to handle white backgrounds
              k.color(255, 255, 255, 0.9), // First make it slightly transparent
              // Add custom properties to make white transparent
              {
                // Override default render function to handle white pixels
                draw() {
                  // This is effectively saying "use the sprite but make white transparent"
                  this.use(k.color(255, 255, 255, 0));
                },
              },
            ]);

            // If showing hitboxes, draw a visible outline around the hitbox
            if (showHitboxes) {
              const hitboxWidth = obstacleObj.width * 0.8;
              const hitboxHeight = obstacleObj.height * 0.8;

              const hitbox = k.add([
                k.rect(hitboxWidth, hitboxHeight),
                k.pos(obstacleObj.pos),
                k.anchor("center"),
                k.outline(2, k.rgb(255, 0, 0)),
                k.color(255, 0, 0, 0.3),
                k.move(k.LEFT, currentObstacleSpeed),
              ]);

              // Keep the hitbox visualization synced with the obstacle
              hitbox.onUpdate(() => {
                if (obstacleObj.exists()) {
                  hitbox.pos = obstacleObj.pos;
                } else {
                  hitbox.destroy();
                }
              });
            }

            // Calculate next spawn time - gradually decrease as score increases
            const minSpawnTime = Math.max(
              SPAWN_INTERVAL[0] - gameTime / 60,
              0.3
            );
            const maxSpawnTime = Math.max(
              SPAWN_INTERVAL[1] - gameTime / 30,
              minSpawnTime + 0.5
            );

            // Schedule next obstacle spawn
            k.wait(k.rand(minSpawnTime, maxSpawnTime), spawnObstacle);
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
  }, [showSpritePreview, showBorders, showHitboxes, gameDifficulty]); // Added new dependencies

  return (
    <div>
      <div
        ref={gameContainerRef}
        style={{
          width: "1000px",
          height: "600px",
          margin: "0 auto",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
        }}
      />
      <div
        style={{
          marginTop: "15px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Game controls */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={() => setShowSpritePreview(!showSpritePreview)}
            style={{
              padding: "8px 16px",
              background: "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {showSpritePreview ? "Go to Game" : "View Sprite Animation"}
          </button>
        </div>

        {/* Game settings */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "20px",
            padding: "15px",
            border: "1px solid #444",
            borderRadius: "8px",
            background: "#222",
            color: "white",
            width: "80%",
            maxWidth: "800px",
            justifyContent: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>Game Settings</h3>

          {/* Difficulty selector */}
          <div>
            <label style={{ marginRight: "10px" }}>Difficulty:</label>
            <select
              value={gameDifficulty}
              onChange={(e) => setGameDifficulty(e.target.value)}
              style={{
                padding: "5px 10px",
                background: "#333",
                color: "white",
                border: "1px solid #666",
                borderRadius: "4px",
                scale: ".7",
              }}
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Show borders checkbox */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="showBorders"
              checked={showBorders}
              onChange={() => setShowBorders(!showBorders)}
              style={{ marginRight: "8px" }}
            />
            <label htmlFor="showBorders">Show Object Borders</label>
          </div>

          {/* Show hitboxes checkbox */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="showHitboxes"
              checked={showHitboxes}
              onChange={() => setShowHitboxes(!showHitboxes)}
              style={{ marginRight: "8px" }}
            />
            <label htmlFor="showHitboxes">Show Collision Hitboxes</label>
          </div>
        </div>

        {/* Game instructions */}
        <div
          style={{
            marginTop: "15px",
            color: "#888",
            fontSize: "14px",
            maxWidth: "800px",
          }}
        >
          Use <strong>Up</strong> and <strong>Down</strong> arrow keys to switch
          lanes and avoid obstacles. Your speed increases over time making the
          game harder!
        </div>
      </div>
    </div>
  );
};

export default KaboomGame;
