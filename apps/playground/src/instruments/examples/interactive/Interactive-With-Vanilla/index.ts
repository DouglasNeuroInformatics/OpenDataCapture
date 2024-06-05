const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

import './styles.css';

export default defineInstrument({
  content: {
    render(done) {
      const startTime = Date.now();

      const canvas = document.createElement('canvas');
      canvas.height = 320;
      canvas.width = 480;
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d')!;
      const ballRadius = 10;
      const brickRowCount = 5;
      const brickColumnCount = 3;
      const brickWidth = 75;
      const brickHeight = 20;
      const brickPadding = 10;
      const brickOffsetTop = 30;
      const brickOffsetLeft = 30;
      const paddleHeight = 10;
      const paddleWidth = 75;

      let x = canvas.width / 2;
      let y = canvas.height - 30;
      let dx = 2;
      let dy = -2;
      let paddleX = (canvas.width - paddleWidth) / 2;
      let score = 0;
      let lives = 3;

      let rightPressed = false;
      let leftPressed = false;

      const bricks: { status: number; x: number; y: number }[][] = [];
      for (let i = 0; i < brickColumnCount; i++) {
        bricks[i] = [];
        for (let j = 0; j < brickRowCount; j++) {
          bricks[i][j] = { status: 1, x: 0, y: 0 };
        }
      }

      document.addEventListener('keydown', keyDownHandler, false);
      document.addEventListener('keyup', keyUpHandler, false);
      document.addEventListener('mousemove', mouseMoveHandler, false);

      function keyDownHandler(e: KeyboardEvent) {
        if (e.code === 'ArrowRight') {
          rightPressed = true;
        } else if (e.code === 'ArrowLeft') {
          leftPressed = true;
        }
      }
      function keyUpHandler(e: KeyboardEvent) {
        if (e.code === 'ArrowRight') {
          rightPressed = false;
        } else if (e.code === 'ArrowLeft') {
          leftPressed = false;
        }
      }
      function mouseMoveHandler(e: MouseEvent) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
          paddleX = relativeX - paddleWidth / 2;
        }
      }

      function collisionDetection() {
        for (let i = 0; i < brickColumnCount; i++) {
          for (let j = 0; j < brickRowCount; j++) {
            const b = bricks[i][j];
            if (b.status === 1) {
              if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                dy = -dy;
                b.status = 0;
                score++;
                if (score === brickRowCount * brickColumnCount) {
                  done({
                    livesRemaining: lives,
                    timeElapsed: Date.now() - startTime
                  });
                }
              }
            }
          }
        }
      }

      function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
      }
      function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
      }
      function drawBricks() {
        for (let i = 0; i < brickColumnCount; i++) {
          for (let j = 0; j < brickRowCount; j++) {
            if (bricks[i][j].status === 1) {
              const brickX = j * (brickWidth + brickPadding) + brickOffsetLeft;
              const brickY = i * (brickHeight + brickPadding) + brickOffsetTop;
              bricks[i][j].x = brickX;
              bricks[i][j].y = brickY;
              ctx.beginPath();
              ctx.rect(brickX, brickY, brickWidth, brickHeight);
              ctx.fillStyle = '#0095DD';
              ctx.fill();
              ctx.closePath();
            }
          }
        }
      }
      function drawScore() {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#0095DD';
        ctx.fillText('Score: ' + score, 8, 20);
      }
      function drawLives() {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#0095DD';
        ctx.fillText('Lives: ' + lives, canvas.width - 65, 20);
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        collisionDetection();

        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
          dx = -dx;
        }
        if (y + dy < ballRadius) {
          dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
          if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
          } else {
            lives--;
            if (!lives) {
              done({
                livesRemaining: lives,
                timeElapsed: Date.now() - startTime
              });
            } else {
              x = canvas.width / 2;
              y = canvas.height - 30;
              dx = 2;
              dy = -2;
              paddleX = (canvas.width - paddleWidth) / 2;
            }
          }
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
          paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
          paddleX -= 7;
        }

        x += dx;
        y += dy;
        requestAnimationFrame(draw);
      }

      draw();
    }
  },
  details: {
    authors: ['Andrzej Mazur', 'Mozilla Contributors', 'Joshua Unrau'],
    description:
      'This is a very simple interactive instrument, adapted from a 2D breakout game in the Mozilla documentation.',
    estimatedDuration: 1,
    instructions: ['Please attempt to win the game as quickly as possible.'],
    license: 'CC0-1.0',
    referenceUrl: 'https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript',
    sourceUrl: 'https://github.com/end3r/Gamedev-Canvas-workshop/tree/gh-pages',
    title: 'Breakout Task'
  },
  edition: 1,
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
  name: 'Breakout Task',
  tags: ['Interactive'],
  validationSchema: z.object({
    livesRemaining: z.number().int(),
    timeElapsed: z.number()
  })
});
