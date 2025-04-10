// Game canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game elements
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restartButton');

// Game constants
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 75;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 4;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 65;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;

// Game variables
let paddleX;
let ballX;
let ballY;
let ballDX;
let ballDY;
let score;
let lives;
let gameActive;
let bricks = [];

// Initialize the game
function initGame() {
    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 400;

    // Initialize game state
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = 2;
    ballDY = -2;
    score = 0;
    lives = 3;
    gameActive = true;

    // Update UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    messageElement.textContent = '';
    restartButton.style.display = 'none';

    // Initialize bricks
    initBricks();

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Initialize bricks array
function initBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            // Determine brick color based on row
            let colorIndex = Math.min(r + 1, 3);
            let brickColor = `var(--brick-color-${colorIndex})`;

            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1,
                color: brickColor
            };
        }
    }
}

// Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = 'var(--paddle-color)';
    ctx.fill();
    ctx.closePath();
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'var(--ball-color)';
    ctx.fill();
    ctx.closePath();
}

// Draw bricks
function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
                const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;

                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Check for brick collisions
function checkBrickCollision() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const brick = bricks[c][r];

            if (brick.status === 1) {
                if (
                    ballX > brick.x &&
                    ballX < brick.x + BRICK_WIDTH &&
                    ballY > brick.y &&
                    ballY < brick.y + BRICK_HEIGHT
                ) {
                    ballDY = -ballDY;
                    brick.status = 0;
                    score++;
                    scoreElement.textContent = score;

                    // Check for win
                    if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT) {
                        showMessage('YOU WIN!');
                        gameActive = false;
                        restartButton.style.display = 'block';
                    }
                }
            }
        }
    }
}

// Move the ball
function moveBall() {
    // Check for wall collisions
    if (ballX + ballDX > canvas.width - BALL_RADIUS || ballX + ballDX < BALL_RADIUS) {
        ballDX = -ballDX;
    }

    if (ballY + ballDY < BALL_RADIUS) {
        ballDY = -ballDY;
    } else if (ballY + ballDY > canvas.height - BALL_RADIUS - PADDLE_HEIGHT) {
        // Check for paddle collision
        if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
            // Calculate bounce angle based on where ball hit the paddle
            // Hit on the left side of paddle = bounce left, right side = bounce right
            const hitPosition = (ballX - paddleX) / PADDLE_WIDTH;
            ballDX = 4 * (hitPosition - 0.5); // Range from -2 to 2
            ballDY = -ballDY;
        } else if (ballY + ballDY > canvas.height - BALL_RADIUS) {
            // Ball missed paddle
            lives--;
            livesElement.textContent = lives;

            if (lives === 0) {
                showMessage('GAME OVER');
                gameActive = false;
                restartButton.style.display = 'block';
            } else {
                // Reset ball position
                ballX = canvas.width / 2;
                ballY = canvas.height - 30;
                ballDX = 2;
                ballDY = -2;
                paddleX = (canvas.width - PADDLE_WIDTH) / 2;
            }
        }
    }

    // Move ball
    ballX += ballDX;
    ballY += ballDY;
}

// Display message
function showMessage(text) {
    messageElement.textContent = text;
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawBricks();
    drawPaddle();
    drawBall();

    // Update game state if active
    if (gameActive) {
        checkBrickCollision();
        moveBall();
    }

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;

    if (e.key === 'ArrowRight' && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += 7;
    } else if (e.key === 'ArrowLeft' && paddleX > 0) {
        paddleX -= 7;
    }
});

// Restart button
restartButton.addEventListener('click', initGame);

// Start game when page loads
window.addEventListener('load', initGame);
