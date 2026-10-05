import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import instrument from '../interactive/DNP_BREAKOUT_TASK/index.ts';

type BreakoutData = { livesRemaining: number; timeElapsed: number };

type RecordingContext = ReturnType<typeof createRecordingContext>;

function createRecordingContext() {
  return {
    arc: vi.fn<(x: number, y: number, radius: number, startAngle: number, endAngle: number) => void>(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    fillText: vi.fn<(text: string, x: number, y: number) => void>(),
    font: '',
    rect: vi.fn<(x: number, y: number, width: number, height: number) => void>(),
    scale: vi.fn<(x: number, y: number) => void>()
  };
}

function setViewport(width: number, height: number) {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(width);
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(height);
}

let context: RecordingContext;
let nextFrame: FrameRequestCallback | undefined;
let done: ReturnType<typeof vi.fn<(data: BreakoutData) => void>>;
let addDocumentListener: MockInstance<typeof document.addEventListener>;

const CANVAS_WIDTH = 480;
const BALL_RADIUS = 10;
const BALL_SPEED = 2;
const PADDLE_STEP = 7;
const PADDLE_WIDTH = 75;
const FRAMES_TO_CROSS_CANVAS = Math.ceil(CANVAS_WIDTH / PADDLE_STEP);

function render() {
  instrument.content.render(done);
}

function start() {
  render();
  document.querySelector<HTMLButtonElement>('#root button')!.click();
}

function step(frames = 1) {
  for (let i = 0; i < frames; i++) {
    const frame = nextFrame!;
    nextFrame = undefined;
    addDocumentListener = vi.spyOn(document, 'addEventListener');
    frame(performance.now());
  }
}

function stepUntil(isReached: () => boolean, beforeEachFrame?: () => void) {
  for (let frames = 0; !isReached(); frames++) {
    if (frames === 100_000) {
      throw new Error('The game did not reach the expected state');
    }
    beforeEachFrame?.();
    step();
  }
}

function followBallWithMouse() {
  moveMouse(lastBall().x);
}

function lastBall() {
  const [x, y] = context.arc.mock.lastCall!;
  return { x, y };
}

function lastPaddleX() {
  return context.rect.mock.calls.findLast(([, y]) => y === 310)![0];
}

function pressKey(type: 'keydown' | 'keyup', code: string) {
  document.dispatchEvent(new KeyboardEvent(type, { code }));
}

function moveMouse(clientX: number) {
  document.dispatchEvent(new MouseEvent('mousemove', { clientX }));
}

function computeMeasure(key: string, data: BreakoutData) {
  const measure = instrument.measures?.[key];
  if (measure?.kind !== 'computed') {
    throw new Error(`Expected a computed measure: ${key}`);
  }
  return measure.value(data);
}

beforeEach(() => {
  context = createRecordingContext();
  done = vi.fn<(data: BreakoutData) => void>();
  nextFrame = undefined;
  addDocumentListener = vi.spyOn(document, 'addEventListener');
  // The page under test only calls the 2D context methods recorded here, and happy-dom has no canvas
  // adapter, so getContext would otherwise return null.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    nextFrame = callback;
    return 0;
  });
  vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(1);
  setViewport(480, 320);
});

afterEach(() => {
  for (const [type, listener, options] of addDocumentListener.mock.calls) {
    document.removeEventListener(type, listener, options);
  }
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('DNP_BREAKOUT_TASK', () => {
  describe('measures', () => {
    it('should report the elapsed time in milliseconds', () => {
      expect(computeMeasure('timeElapsed', { livesRemaining: 2, timeElapsed: 1500 })).toBe('1500ms');
    });

    it('should count the game as won while lives remain', () => {
      expect(computeMeasure('win', { livesRemaining: 1, timeElapsed: 0 })).toBe(true);
    });

    it('should count the game as lost once no lives remain', () => {
      expect(computeMeasure('win', { livesRemaining: 0, timeElapsed: 0 })).toBe(false);
    });
  });

  describe('render', () => {
    it('should show a welcome screen with a start button before the game begins', () => {
      render();
      expect(document.querySelector('#root h3')?.textContent).toBe('Welcome to the Breakout Task');
      expect(document.querySelector('#root canvas')).toBeNull();
    });

    it('should replace the welcome screen with the game canvas when started', () => {
      start();
      expect(document.querySelector('.initial-content')).toBeNull();
      expect(document.querySelector('#root canvas')).toBeTruthy();
    });

    it('should scale the canvas backing store by three times the device pixel ratio, so it stays sharp', () => {
      vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(2);
      start();
      const canvas = document.querySelector('canvas')!;
      expect([canvas.width, canvas.height]).toEqual([2880, 1920]);
      expect(context.scale).toHaveBeenCalledWith(6, 6);
    });
  });

  describe('scale', () => {
    it.each([
      { expected: '480px', height: 320, width: 480 },
      { expected: '600px', height: 500, width: 1000 },
      { expected: '720px', height: 1000, width: 1000 },
      { expected: '960px', height: 720, width: 1080 }
    ])('should size the canvas to $expected wide in a $width x $height window', ({ expected, height, width }) => {
      setViewport(width, height);
      start();
      expect(document.querySelector('canvas')!.style.width).toBe(expected);
    });
  });

  describe('paddle', () => {
    it('should start the paddle centered', () => {
      start();
      expect(lastPaddleX()).toBe(202.5);
    });

    it('should move the paddle right while the right arrow is held', () => {
      start();
      pressKey('keydown', 'ArrowRight');
      step(2);
      expect(lastPaddleX()).toBe(209.5);
    });

    it('should move the paddle left while the left arrow is held', () => {
      start();
      pressKey('keydown', 'ArrowLeft');
      step(2);
      expect(lastPaddleX()).toBe(195.5);
    });

    it('should stop the paddle when the arrow is released', () => {
      start();
      pressKey('keydown', 'ArrowRight');
      pressKey('keydown', 'ArrowLeft');
      pressKey('keyup', 'ArrowRight');
      pressKey('keyup', 'ArrowLeft');
      step(2);
      expect(lastPaddleX()).toBe(202.5);
    });

    it('should ignore keys other than the arrows', () => {
      start();
      pressKey('keydown', 'Space');
      pressKey('keyup', 'Space');
      step(2);
      expect(lastPaddleX()).toBe(202.5);
    });

    it('should stop the paddle at the right wall', () => {
      start();
      pressKey('keydown', 'ArrowRight');
      step(FRAMES_TO_CROSS_CANVAS);
      const stoppedX = lastPaddleX();
      step(5);
      expect(lastPaddleX()).toBe(stoppedX);
      expect(stoppedX).toBeGreaterThanOrEqual(CANVAS_WIDTH - PADDLE_WIDTH - PADDLE_STEP);
    });

    it('should stop the paddle at the left wall', () => {
      start();
      pressKey('keydown', 'ArrowLeft');
      step(FRAMES_TO_CROSS_CANVAS);
      const stoppedX = lastPaddleX();
      step(5);
      expect(lastPaddleX()).toBe(stoppedX);
      expect(stoppedX).toBeLessThanOrEqual(PADDLE_STEP);
    });

    it('should center the paddle on the mouse inside the canvas', () => {
      start();
      moveMouse(100);
      step();
      expect(lastPaddleX()).toBe(62.5);
    });

    it.each([0, 480])('should ignore the mouse at x = %i, outside the canvas', (clientX) => {
      start();
      moveMouse(clientX);
      step();
      expect(lastPaddleX()).toBe(202.5);
    });
  });

  describe('game', () => {
    it('should draw the full wall of bricks, the score and the lives on the first frame', () => {
      start();
      expect(context.rect).toHaveBeenCalledTimes(16);
      expect(context.fillText).toHaveBeenCalledWith('Score: 0', 8, 20);
      expect(context.fillText).toHaveBeenCalledWith('Lives: 3', 415, 20);
    });

    it('should stop drawing a brick once the ball breaks it', () => {
      start();
      stepUntil(() => context.fillText.mock.calls.some(([text]) => text === 'Score: 1'));
      context.rect.mockClear();
      step();
      expect(context.rect).toHaveBeenCalledTimes(15);
    });

    it('should bounce the ball off the side wall', () => {
      start();
      stepUntil(() => lastBall().x > CANVAS_WIDTH - BALL_RADIUS - BALL_SPEED);
      const before = lastBall();
      step();
      expect(lastBall().x).toBeLessThan(before.x);
    });

    it('should bounce the ball off the paddle', () => {
      start();
      stepUntil(() => lastBall().y === 310, followBallWithMouse);
      step();
      expect(lastBall().y).toBe(308);
    });

    it('should take a life and re-serve the ball from the start when the paddle misses', () => {
      start();
      step();
      const firstServe = lastBall();
      stepUntil(() => context.fillText.mock.calls.some(([text]) => text === 'Lives: 2'));
      expect(lastBall()).toEqual(firstServe);
    });

    it('should complete with no lives remaining after the paddle misses three times', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(1000);
      start();
      vi.setSystemTime(4000);
      stepUntil(() => done.mock.calls.length > 0);
      expect(done).toHaveBeenCalledWith({ livesRemaining: 0, timeElapsed: 3000 });
    });

    it('should complete with the lives remaining once every brick is broken', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(0);
      start();
      vi.setSystemTime(2500);
      stepUntil(() => done.mock.calls.length > 0, followBallWithMouse);
      expect(done).toHaveBeenCalledWith({ livesRemaining: 3, timeElapsed: 2500 });
    });
  });
});
