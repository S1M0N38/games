// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
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
const BALL_SPEED = 3.5; // Reduced from 5 to 3.5 for slower ball movement
const PADDLE_SPEED = 8;

// Game state
let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = BALL_SPEED;
let ballDY = -BALL_SPEED;
let score = 0;
let lives = 3;
let gameActive = true;
let rightPressed = false;
let leftPressed = false;
let bricks = [];

// Brick colors (row-based)
const brickColors = [
    getComputedStyle(document.documentElement).getPropertyValue('--brick-color-1').trim(),
    getComputedStyle(document.documentElement).getPropertyValue('--brick-color-2').trim(),
    getComputedStyle(document.documentElement).getPropertyValue('--brick-color-3').trim(),
    getComputedStyle(document.documentElement).getPropertyValue('--brick-color-4').trim()
];

// Initialize brick array
function initBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;

            bricks[c][r] = {
                x: brickX,
                y: brickY,
                status: 1,
                color: brickColors[r % brickColors.length],
                points: (BRICK_ROW_COUNT - r) * 10 // Higher rows worth more points
            };
        }
    }
}

// Draw a single brick
function drawBrick(brick) {
    ctx.beginPath();
    ctx.rect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
    ctx.fillStyle = brick.color;
    ctx.fill();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 8;
    ctx.shadowColor = brick.color;
    ctx.strokeStyle = brick.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Draw all bricks
function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                drawBrick(bricks[c][r]);
            }
        }
    }
}

// Draw the paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--paddle-color').trim();
    ctx.fill();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--paddle-color').trim();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--paddle-color').trim();
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ball-color').trim();
    ctx.fill();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--ball-color').trim();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ball-color').trim();
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Check for collisions with bricks
function checkBrickCollisions() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const brick = bricks[c][r];

            if (brick.status === 1) {
                // Check if ball is inside brick boundaries
                if (ballX > brick.x &&
                    ballX < brick.x + BRICK_WIDTH &&
                    ballY > brick.y &&
                    ballY < brick.y + BRICK_HEIGHT) {

                    ballDY = -ballDY; // Reverse ball direction
                    brick.status = 0; // Brick is hit

                    // Update score
                    score += brick.points;
                    scoreElement.textContent = score;

                    // Check if all bricks are gone
                    checkWinCondition();
                }
            }
        }
    }
}

// Check if all bricks are cleared
function checkWinCondition() {
    let bricksRemaining = 0;

    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                bricksRemaining++;
            }
        }
    }

    if (bricksRemaining === 0) {
        showMessage("YOU WIN!");
        gameActive = false;
        restartButton.style.display = 'block';
    }
}

// Handle ball movement and collisions
function moveBall() {
    // Wall collisions (left and right)
    if (ballX + ballDX > canvas.width - BALL_RADIUS || ballX + ballDX < BALL_RADIUS) {
        ballDX = -ballDX;
    }

    // Top wall collision
    if (ballY + ballDY < BALL_RADIUS) {
        ballDY = -ballDY;
    }
    // Bottom collision (paddle or miss)
    else if (ballY + ballDY > canvas.height - BALL_RADIUS - PADDLE_HEIGHT) {
        // Ball hits paddle
        if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
            // Calculate hit position on paddle (0 to 1)
            const hitPosition = (ballX - paddleX) / PADDLE_WIDTH;

            // Adjust ball direction based on where it hit the paddle
            // Center = straight up, sides = angled
            ballDX = BALL_SPEED * (hitPosition - 0.5) * 2;
            ballDY = -Math.abs(ballDY); // Always go up, maintain speed
        }
        // Ball misses paddle
        else if (ballY + ballDY > canvas.height - BALL_RADIUS) {
            lives--;
            livesElement.textContent = lives;

            if (lives === 0) {
                showMessage("GAME OVER");
                gameActive = false;
                restartButton.style.display = 'block';
            } else {
                // Reset ball and paddle
                resetBall();
            }
        }
    }

    // Move the ball
    ballX += ballDX;
    ballY += ballDY;
}

// Reset the ball position after losing a life
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1); // Random direction
    ballDY = -BALL_SPEED;
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
}

// Handle paddle movement
function movePaddle() {
    if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += PADDLE_SPEED;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= PADDLE_SPEED;
    }
}

// Display a message
function showMessage(text) {
    messageElement.textContent = text;
}

// Main game loop
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawBricks();
    drawPaddle();
    drawBall();

    // Update game state if active
    if (gameActive) {
        checkBrickCollisions();
        movePaddle();
        moveBall();
    }

    // Continue game loop
    requestAnimationFrame(draw);
}

// Initialize the game
function initGame() {
    // Reset game state
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballDY = -BALL_SPEED;
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
}

// Event listeners for keyboard controls
function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

// Add event listeners
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
restartButton.addEventListener('click', initGame);

// Start the game
initGame();
draw();
