import { useState, useEffect, useRef } from "react";
import p5 from "p5";
import kaboom from "kaboom";

const CharacterAnimation = () => {
  const [speed, setSpeed] = useState(5);
  const sketchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sketch = (p: p5) => {
      const images: p5.Image[] = [];
      let currentFrame = 0;
      const frameCount = 10; // Number of frames in the sprite sheet

      p.preload = () => {
        for (let i = 0; i < frameCount; i++) {
          images[i] = p.loadImage(
            `/run.png`,
            () => console.log(`Loaded frame${i}.png`),
            () => console.error(`Failed to load frame${i}.png`)
          );
        }
      };

      p.setup = () => {
        p.createCanvas(800, 400);
      };

      p.draw = () => {
        p.background(255);
        p.image(images[currentFrame], 100, 100);
        currentFrame = (currentFrame + 1) % frameCount;
        p.frameRate(speed);
      };
    };

    const p5Instance = new p5(sketch, sketchRef.current!);

    return () => {
      p5Instance.remove();
    };
  }, [speed]);

  useEffect(() => {
    kaboom({
      width: 800,
      height: 400,
      background: [255, 255, 255],
    });

    loadSprite("runner", "/run.png", {
      sliceX: 10, // Number of frames in the sprite sheet
      anims: {
        run: {
          from: 0,
          to: 9,
          speed: 10,
          loop: true,
        },
      },
    });

    const player = add([sprite("runner"), pos(100, 200), area(), body()]);

    player.play("run");

    function spawnObstacle() {
      add([
        rect(20, 40),
        area(),
        pos(width(), rand(0, height() - 40)),
        color(255, 0, 0),
        move(LEFT, 200),
        "obstacle",
      ]);

      wait(rand(1, 2), spawnObstacle);
    }

    spawnObstacle();

    keyDown("up", () => {
      player.move(0, -200);
    });

    keyDown("down", () => {
      player.move(0, 200);
    });

    player.collides("obstacle", () => {
      destroy(player);
      add([
        text("Game Over", 32),
        pos(width() / 2, height() / 2),
        origin("center"),
      ]);
    });
  }, []);

  return (
    <div>
      <div ref={sketchRef}></div>
      <input
        type="range"
        min="1"
        max="60"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
      />
      <label>Speed: {speed}</label>
    </div>
  );
};

export default CharacterAnimation;
