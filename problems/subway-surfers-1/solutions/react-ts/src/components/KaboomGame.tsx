import React, { useEffect, useRef, useState } from "react";

// Import kaboom as a type to avoid TypeScript errors
declare const kaboom: any;

const KaboomGame: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showSpritePreview, setShowSpritePreview] = useState(false);

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
      // Initialize Kaboom
      const k = kaboom({
        width: 800,
        height: 400,
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
      const LANE_HEIGHT = 400;
      const LANE_WIDTH = 800;
      const LANE_Y = [LANE_HEIGHT / 4, LANE_HEIGHT / 2, (3 * LANE_HEIGHT) / 4]; // Three lanes
      const PLAYER_X = 120;
      const SPEED = 320;
      const OBSTACLE_SPEED = 320;
      const SPAWN_INTERVAL = [0.8, 2.5]; // Random interval between obstacle spawns

      // Track loaded assets
      let assetsLoaded = 0;
      const assetsToLoad = 2;

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

      // Load the sprite sheet for the player
      const runnerImage = new Image();
      runnerImage.src = "/run.png"; // Make sure your image is in the public folder

      runnerImage.onload = () => {
        // Load the sprite atlas once the image is loaded
        k.loadSpriteAtlas(runnerImage, {
          runner: {
            x: 0,
            y: 0,
            width: runnerImage.width,
            height: runnerImage.height,
            sliceX: 5, // 5 columns in the sprite sheet
            sliceY: 2, // 2 rows in the sprite sheet
            anims: {
              run: {
                from: 0,
                to: 9, // Total of 10 frames (5x2 grid)
                speed: 5,
                loop: true,
              },
            },
          },
        });
        checkAllAssetsLoaded();
      };

      runnerImage.onerror = () => {
        console.error("Failed to load player sprite");
        checkAllAssetsLoaded();
      };

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
          // Game area - draw outline border
          k.add([
            k.rect(LANE_WIDTH, LANE_HEIGHT),
            k.pos(0, 0),
            k.outline(2, k.rgb(255, 255, 255)),
            k.color(0, 0, 0, 0), // Transparent fill
          ]);

          // Add player character
          let currentLane = 1; // Start in middle lane
          const player = k.add([
            // Try to use the sprite if it's loaded, otherwise use circle
            k.sprite("runner", { noError: true }) || k.circle(20),
            // Add outline and color only if using circle
            ...(k.sprite("runner", { noError: true })
              ? []
              : [k.outline(2, k.rgb(255, 255, 255)), k.color(255, 0, 0)]),
            k.pos(PLAYER_X, LANE_Y[currentLane]),
            k.anchor("center"),
            k.area(),
            "player",
            {
              speed: SPEED,
              isAlive: true,
              health: 3,
            },
            k.scale(0.3),
          ]);

          // Start running animation if using sprite
          if (k.sprite("runner", { noError: true })) {
            player.play("run");
          }

          // Health display
          const healthLabel = k.add([
            k.rect(100, 30),
            k.pos(LANE_WIDTH - 120, 20),
            k.outline(2, k.rgb(255, 255, 255)),
            k.color(0, 0, 0, 0), // Transparent fill
          ]);

          const healthText = k.add([
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
              updateHealth: function (health) {
                this.width = (health / 3) * 80;
                if (health <= 1) this.color = k.rgb(255, 0, 0);
                else if (health === 2) this.color = k.rgb(255, 255, 0);
              },
            },
          ]);

          // Add preview button
          k.add([
            k.rect(120, 30),
            k.pos(LANE_WIDTH - 120, LANE_HEIGHT - 50),
            k.outline(2, k.rgb(255, 255, 255)),
            k.color(0, 0, 0, 0),
            k.area(),
            k.anchor("center"),
            "previewBtn",
            {
              clicked: false,
            },
          ]);

          k.add([
            k.text("Sprite Preview", { size: 14 }),
            k.pos(LANE_WIDTH - 120, LANE_HEIGHT - 50),
            k.anchor("center"),
            k.color(255, 255, 255),
          ]);

          // Allow clicking on preview button
          k.onClick("previewBtn", () => {
            setShowSpritePreview(true);
            k.go("spritePreview");
          });

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

            // Determine scale based on obstacle size (you may need to adjust this)
            const scale = 0.7;

            // Create obstacle with sprite or fallback to rectangle if sprite loading failed
            const obstacle = k.add([
              k.sprite(spriteName, { noError: true }) ||
                k.rect(60, 60, { outline: 2 }),
              // Only add outline if using fallback rectangle
              ...(k.sprite(spriteName, { noError: true })
                ? []
                : [k.outline(2, k.rgb(255, 255, 255)), k.color(0, 0, 0, 0)]),
              k.pos(LANE_WIDTH, LANE_Y[obstacleLane]),
              k.anchor("center"),
              k.area({ scale: 0.8 }), // Slightly smaller hitbox than visual size
              k.move(k.LEFT, OBSTACLE_SPEED),
              "obstacle",
              k.scale(.2),
              // replace bg with transparent color
            ]);

            // Schedule next obstacle spawn
            k.wait(k.rand(SPAWN_INTERVAL[0], SPAWN_INTERVAL[1]), spawnObstacle);
          }

          // Start spawning obstacles
          spawnObstacle();

          // Collision detection
          player.onCollide("obstacle", (obstacle) => {
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
                k.go("gameover", scoreLabel.value);
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
  }, [showSpritePreview]);

  return (
    <div>
      <div
        ref={gameContainerRef}
        style={{
          width: "800px",
          height: "400px",
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
          }}
        >
          {showSpritePreview ? "Go to Game" : "View Sprite Animation"}
        </button>
      </div>
    </div>
  );
};

export default KaboomGame;
