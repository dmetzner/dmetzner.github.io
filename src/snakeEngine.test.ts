import { describe, expect, it } from "vitest";
import { COLS, createState, randFood, type SnakeState, steer, step } from "./snakeEngine";

// deterministic rand stub that yields a fixed sequence then 0
const seq = (...vals: number[]) => {
  let i = 0;
  return () => vals[i++] ?? 0;
};

describe("createState", () => {
  it("starts with a single segment and a moving direction", () => {
    const s = createState(seq(0.9, 0.9)); // food far from start
    expect(s.snake).toEqual([{ x: 8, y: 7 }]);
    expect(s.dir).toEqual({ x: 1, y: 0 });
    expect(s.food).not.toEqual({ x: 8, y: 7 });
  });
});

describe("steer", () => {
  it("queues a perpendicular turn", () => {
    const s = createState(seq(0.9, 0.9));
    steer(s, 0, 1);
    expect(s.next).toEqual({ x: 0, y: 1 });
  });

  it("refuses a direct 180° reversal", () => {
    const s = createState(seq(0.9, 0.9)); // moving right
    steer(s, -1, 0);
    expect(s.next).toEqual({ x: 1, y: 0 }); // unchanged
  });
});

describe("step", () => {
  it("moves the head and keeps length when not eating", () => {
    const s = createState(seq(0.9, 0.9));
    const r = step(s);
    expect(r).toEqual({ dead: false, ate: false });
    expect(s.snake).toEqual([{ x: 9, y: 7 }]);
  });

  it("grows and reports ate when hitting food", () => {
    const s: SnakeState = {
      snake: [{ x: 8, y: 7 }],
      dir: { x: 1, y: 0 },
      next: { x: 1, y: 0 },
      food: { x: 9, y: 7 },
    };
    const r = step(s, seq(0.9, 0.9));
    expect(r.ate).toBe(true);
    expect(r.dead).toBe(false);
    expect(s.snake).toHaveLength(2);
  });

  it("dies on the wall", () => {
    const s: SnakeState = {
      snake: [{ x: COLS - 1, y: 7 }],
      dir: { x: 1, y: 0 },
      next: { x: 1, y: 0 },
      food: { x: 0, y: 0 },
    };
    expect(step(s).dead).toBe(true);
  });

  it("dies on itself", () => {
    const s: SnakeState = {
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 7, y: 5 },
        { x: 7, y: 6 },
        { x: 6, y: 6 },
      ],
      dir: { x: 1, y: 0 },
      next: { x: 1, y: 0 }, // head → {6,5}, a body cell
      food: { x: 0, y: 0 },
    };
    expect(step(s).dead).toBe(true);
  });
});

describe("randFood", () => {
  it("never lands on the snake", () => {
    // first (0,0) collides with the snake, second (12,7) is free
    const food = randFood([{ x: 0, y: 0 }], seq(0, 0, 0.5, 0.5));
    expect(food).not.toEqual({ x: 0, y: 0 });
  });
});
