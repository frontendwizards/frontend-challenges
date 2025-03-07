import React, { forwardRef } from "react";

interface GameCanvasProps {
  width: number;
  height: number;
}

const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ width, height }, ref) => {
    return (
      <canvas
        ref={ref}
        width={width}
        height={height}
        tabIndex={0}
        className="border-4 border-gray-800 shadow-2xl"
        aria-label="Game Canvas"
      />
    );
  }
);

GameCanvas.displayName = "GameCanvas";

export default GameCanvas;
