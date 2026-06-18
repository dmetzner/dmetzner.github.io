// Pure snake game logic — no DOM, no React. Deterministic when `rand` is injected,
// which is what the unit tests rely on.
export type Point = { x: number; y: number };
export type SnakeState = { snake: Point[]; dir: Point; next: Point; food: Point };

export const COLS = 24;
export const ROWS = 14;
export const CELL = 15;

const START: Point = { x: 8, y: 7 };

export function randFood(snake: Point[], rand: () => number = Math.random): Point {
  let f: Point;
  do {
    f = { x: Math.floor(rand() * COLS), y: Math.floor(rand() * ROWS) };
  } while (snake.some((s) => s.x === f.x && s.y === f.y));
  return f;
}

export function createState(rand: () => number = Math.random): SnakeState {
  const snake = [{ ...START }];
  return { snake, dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: randFood(snake, rand) };
}

// queue a direction change, refusing a direct 180° reversal into itself
export function steer(state: SnakeState, x: number, y: number): void {
  if (state.dir.x + x !== 0 || state.dir.y + y !== 0) state.next = { x, y };
}

// advance one tick (mutates state); reports whether the snake died and/or ate
export function step(
  state: SnakeState,
  rand: () => number = Math.random,
): { dead: boolean; ate: boolean } {
  state.dir = state.next;
  const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
  const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
  const hitSelf = state.snake.some((s) => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) return { dead: true, ate: false };

  state.snake.unshift(head);
  if (head.x === state.food.x && head.y === state.food.y) {
    state.food = randFood(state.snake, rand);
    return { dead: false, ate: true };
  }
  state.snake.pop();
  return { dead: false, ate: false };
}
