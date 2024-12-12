import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.23.x';

import './styles.css';

const BASE_HEIGHT = 320;
const BASE_WIDTH = 480;

const $Data = z.object({
  livesRemaining: z.number().int(),
  timeElapsed: z.number()
});

type Data = z.infer<typeof $Data>;

function getScale() {
  const ratios = [1, 1.25, 1.5, 2];
  for (let i = 1; i < ratios.length; i++) {
    const multiplier = ratios[i]! + 0.25;
    const [heightThreshold, widthThreshold] = [BASE_HEIGHT * multiplier, BASE_WIDTH * multiplier];
    if (window.innerHeight < heightThreshold || window.innerWidth < widthThreshold) {
      return ratios[i - 1]!;
    }
  }
  return ratios.at(-1)!;
}

function runTask(root: HTMLDivElement, onComplete: (data: Data) => void) {
  const startTime = Date.now();
  const ratio = window.devicePixelRatio * 3;
  const scale = getScale();

  const canvas = document.createElement('canvas');

  const height = BASE_HEIGHT * scale;
  const width = BASE_WIDTH * scale;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  root.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  ctx.scale(ratio, ratio);

  const ballRadius = 10 * scale;
  const brickRowCount = 5;
  const brickColumnCount = 3;
  const brickWidth = 75 * scale;
  const brickHeight = 20 * scale;
  const brickPadding = 10 * scale;
  const brickOffsetTop = 30 * scale;
  const brickOffsetLeft = 30 * scale;
  const paddleHeight = 10 * scale;
  const paddleWidth = 75 * scale;

  let x = width / 2;
  let y = height - 30;
  let dx = 2 * scale;
  let dy = -2 * scale;
  let paddleX = (width - paddleWidth) / 2;
  let score = 0;
  let lives = 3;

  let rightPressed = false;
  let leftPressed = false;

  const bricks: { status: number; x: number; y: number }[][] = [];
  for (let i = 0; i < brickColumnCount; i++) {
    bricks[i] = [];
    for (let j = 0; j < brickRowCount; j++) {
      bricks[i]![j] = { status: 1, x: 0, y: 0 };
    }
  }

  const keyDownHandler = (e: KeyboardEvent) => {
    if (e.code === 'ArrowRight') {
      rightPressed = true;
    } else if (e.code === 'ArrowLeft') {
      leftPressed = true;
    }
  };

  const keyUpHandler = (e: KeyboardEvent) => {
    if (e.code === 'ArrowRight') {
      rightPressed = false;
    } else if (e.code === 'ArrowLeft') {
      leftPressed = false;
    }
  };

  const mouseMoveHandler = (e: MouseEvent) => {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < width) {
      paddleX = relativeX - paddleWidth / 2;
    }
  };

  const collisionDetection = () => {
    for (let i = 0; i < brickColumnCount; i++) {
      for (let j = 0; j < brickRowCount; j++) {
        const b = bricks[i]![j]!;
        if (b.status === 1) {
          if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
            dy = -dy;
            b.status = 0;
            score++;
            // eslint-disable-next-line max-depth
            if (score === brickRowCount * brickColumnCount) {
              onComplete({
                livesRemaining: lives,
                timeElapsed: Date.now() - startTime
              });
            }
          }
        }
      }
    }
  };

  const drawBall = () => {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  };

  const drawPaddle = () => {
    ctx.beginPath();
    ctx.rect(paddleX, height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  };

  const drawBricks = () => {
    for (let i = 0; i < brickColumnCount; i++) {
      for (let j = 0; j < brickRowCount; j++) {
        if (bricks[i]![j]!.status === 1) {
          const brickX = j * (brickWidth + brickPadding) + brickOffsetLeft;
          const brickY = i * (brickHeight + brickPadding) + brickOffsetTop;
          bricks[i]![j]!.x = brickX;
          bricks[i]![j]!.y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = '#0095DD';
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  };

  const drawScore = () => {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Score: ' + score, 8, 20);
  };

  const drawLives = () => {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText('Lives: ' + lives, width - 65, 20);
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if (x + dx > width - ballRadius || x + dx < ballRadius) {
      dx = -dx;
    }
    if (y + dy < ballRadius) {
      dy = -dy;
    } else if (y + dy > height - ballRadius) {
      if (x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy;
      } else {
        lives--;
        if (!lives) {
          onComplete({
            livesRemaining: lives,
            timeElapsed: Date.now() - startTime
          });
        } else {
          x = width / 2;
          y = height - 30;
          dx = 2 * scale;
          dy = -2 * scale;
          paddleX = (width - paddleWidth) / 2;
        }
      }
    }

    if (rightPressed && paddleX < width - paddleWidth) {
      paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= 7;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
  };

  document.addEventListener('keydown', keyDownHandler, false);
  document.addEventListener('keyup', keyUpHandler, false);
  document.addEventListener('mousemove', mouseMoveHandler, false);

  draw();
}

export default defineInstrument({
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['Please attempt to win the game as quickly as possible.']
  },
  content: {
    render(done) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
      runTask(root, done);
    }
  },
  details: {
    authors: ['Andrzej Mazur', 'Mozilla Contributors', 'Joshua Unrau'],
    description:
      'This is a very simple interactive instrument, adapted from a 2D breakout game in the Mozilla documentation.',
    license: 'CC0-1.0',
    referenceUrl: 'https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript',
    sourceUrl: 'https://github.com/end3r/Gamedev-Canvas-workshop/tree/gh-pages',
    title: 'Breakout Task'
  },
  internal: {
    edition: 1,
    name: 'BREAKOUT_TASK'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {
    livesRemaining: {
      kind: 'const',
      label: 'Lives Remaining',
      ref: 'livesRemaining'
    },
    timeElapsed: {
      kind: 'computed',
      label: 'Time Elapsed',
      value(data) {
        return data.timeElapsed + 'ms';
      }
    },
    win: {
      kind: 'computed',
      label: 'Won Game',
      value(data) {
        return data.livesRemaining > 0;
      }
    }
  },
  tags: ['Interactive'],
  validationSchema: $Data
});
