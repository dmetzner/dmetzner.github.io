import { useEffect, useRef, useState } from "react";
import { CELL, COLS, createState, ROWS, type SnakeState, steer, step } from "./snakeEngine";

// Snake, played inside the terminal. Pure game logic lives in snakeEngine.ts;
// this component owns the loop, input, and canvas rendering.
export function Snake({ onExit }: { onExit: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);

  const game = useRef<SnakeState>(createState());

  const reset = () => {
    game.current = createState();
    setScore(0);
    setOver(false);
  };

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "Escape") return onExit(scoreRef.current);
      if (over && (e.key === "Enter" || k === " ")) {
        e.preventDefault();
        return reset();
      }
      const dirs: Record<string, [number, number]> = {
        arrowup: [0, -1],
        w: [0, -1],
        arrowdown: [0, 1],
        s: [0, 1],
        arrowleft: [-1, 0],
        a: [-1, 0],
        arrowright: [1, 0],
        d: [1, 0],
      };
      if (dirs[k]) {
        e.preventDefault();
        steer(game.current, dirs[k][0], dirs[k][1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [over]);

  useEffect(() => {
    if (over) return;
    const tick = setInterval(() => {
      const { dead, ate } = step(game.current);
      if (dead) {
        setOver(true);
        return;
      }
      if (ate) setScore((s) => s + 1);
      draw(canvasRef.current, game.current);
    }, 110);
    return () => clearInterval(tick);
  }, [over]);

  useEffect(() => {
    draw(canvasRef.current, game.current);
  }, []);

  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
      if (over) reset(); // tap = retry
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) steer(game.current, dx > 0 ? 1 : -1, 0);
    else steer(game.current, 0, dy > 0 ? 1 : -1);
  };

  return (
    <div className="cli-snake">
      <div className="cli-snake-stage">
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="cli-canvas"
          onTouchStart={(e) => {
            const t = e.touches[0];
            touchStart.current = { x: t.clientX, y: t.clientY };
          }}
          onTouchEnd={onTouchEnd}
        />
        <span className="cli-snake-score mono">
          score <b>{score}</b>
        </span>
        <button
          type="button"
          className="cli-snake-x mono"
          onClick={() => onExit(scoreRef.current)}
          aria-label="quit (esc)"
        >
          esc ✕
        </button>
        {over && (
          <button type="button" className="cli-snake-over mono" onClick={reset}>
            game over · {score}
            <br />
            tap to retry
          </button>
        )}
      </div>
      <div className="cli-snake-hint mono">swipe · or wasd / arrows to steer</div>
    </div>
  );
}

function draw(canvas: HTMLCanvasElement | null, g: SnakeState) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const css = getComputedStyle(document.documentElement);
  const cyan = css.getPropertyValue("--cyan").trim() || "#2ee6e6";
  const violet = css.getPropertyValue("--violet").trim() || "#b06bff";

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = violet;
  cell(ctx, g.food.x, g.food.y, 2);
  ctx.fill();

  g.snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? cyan : withAlpha(cyan, 0.55);
    cell(ctx, s.x, s.y, 1);
    ctx.fill();
  });
}

function cell(ctx: CanvasRenderingContext2D, x: number, y: number, inset: number) {
  ctx.beginPath();
  ctx.roundRect(x * CELL + inset, y * CELL + inset, CELL - inset * 2, CELL - inset * 2, 4);
}

function withAlpha(color: string, alpha: number) {
  const hex = color.replace("#", "");
  if (hex.length !== 3 && hex.length !== 6) return color;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
