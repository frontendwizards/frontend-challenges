import kaboom from "kaboom";

// Initialize Kaboom context
const k = kaboom({
  width: 800,
  height: 400,
  background: [135, 206, 235], // Sky blue background
  scale: 1,
  debug: false,
});

// Game variables
let score = 0;
const FLOOR_HEIGHT = 350;
const JUMP_FORCE = 600;
const SPEED = 320;
const OBSTACLE_SPEED = 320;
const SPAWN_INTERVAL = [0.8, 2.5]; // Random interval between obstacle spawns

// Load assets
loadSprite("player-run", "sprites/player-run.png", {
  sliceX: 10, // 10 frames in the animation
  anims: {
    run: {
      from: 0,
      to: 9,
      speed: 20,
      loop: true
    }
  }
});

// Game scene
scene("game", () => {
  // Add a floor
  add([
    rect(width(), 50),
    pos(0, FLOOR_HEIGHT),
    color(120, 80, 40), // Brown color
    area(),
    solid(),
    "floor"
  ]);

  // Add player character
  const player = add([
    sprite("player-run"),
    pos(120, FLOOR_HEIGHT - 40),
    area({ width: 50, height: 80, offset: vec2(0, 10) }),
    body(),
    "player",
    {
      speed: SPEED,
      isAlive: true
    }
  ]);

  // Start running animation
  player.play("run");

  // Player controls (move up and down)
  onKeyDown("up", () => {
    if (player.isAlive && player.pos.y > 120) {
      player.pos.y -= 5;
    }
  });

  onKeyDown("down", () => {
    if (player.isAlive && player.pos.y < FLOOR_HEIGHT - 40) {
      player.pos.y += 5;
    }
  });

  // Score display
  const scoreLabel = add([
    text("Score: 0", { size: 24 }),
    pos(24, 24),
    fixed(),
    { value: 0 }
  ]);

  // Update score
  onUpdate(() => {
    if (player.isAlive) {
      score += dt();
      scoreLabel.value = Math.floor(score);
      scoreLabel.text = `Score: ${scoreLabel.value}`;
    }
  });

  // Obstacle spawning
  function spawnObstacle() {
    if (!player.isAlive) return;

    // Create random obstacle height
    const obstacleHeight = rand(60, 100);

    // Random vertical position
    const posY = rand(FLOOR_HEIGHT - obstacleHeight, FLOOR_HEIGHT - obstacleHeight / 2);

    // Add the obstacle
    add([
      rect(30, obstacleHeight),
      area(),
      pos(width(), posY),
      color(255, 0, 0), // Red color
      move(LEFT, OBSTACLE_SPEED),
      cleanup(),
      "obstacle"
    ]);

    // Schedule next obstacle spawn
    wait(rand(SPAWN_INTERVAL[0], SPAWN_INTERVAL[1]), spawnObstacle);
  }

  // Start spawning obstacles
  spawnObstacle();

  // Collision detection
  player.onCollide("obstacle", () => {
    player.isAlive = false;
    shake(12);
    go("gameover", scoreLabel.value);
  });
});

// Game over scene
scene("gameover", (score) => {
  add([
    text(`Game Over!\nScore: ${score}\nPress space to restart`, { 
      size: 36,
      align: "center"
    }),
    pos(center()),
    origin("center")
  ]);

  // Restart game
  onKeyPress("space", () => {
    go("game");
  });
});

// Start the game
go("game"); 