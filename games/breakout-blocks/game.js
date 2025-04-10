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
const BRICK_ROW_COUNT = 5;  // Added an extra row for more colors
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 65;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;
const INITIAL_BALL_SPEED = 6;  // Increased from 4 to 6 for faster gameplay
const SPEED_INCREMENT = 0.001; // Doubled from 0.0005 for more rapid speed increases

// Color constants
const COLORS = {
    BACKGROUND: '#0c0c2a',
    PADDLE: '#0ff7ff',
    BALL: '#ff3cac',
    BRICK_1: '#ff0055',
    BRICK_2: '#ff9500',
    BRICK_3: '#ffea00',
    BRICK_4: '#00ff9f',
    TEXT: '#ffffff'
};

// Game variables
let paddleX;
let ballX;
let ballY;
let ballDX;
let ballDY;
let ballSpeed;  // To track current ball speed
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
    ballSpeed = INITIAL_BALL_SPEED;

    // Set random initial direction with fixed speed
    const angle = Math.random() * Math.PI / 3 - Math.PI / 6; // -30 to +30 degrees
    ballDX = ballSpeed * Math.sin(angle);
    ballDY = -ballSpeed * Math.cos(angle);

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
            let brickColor;
            switch (r) {
                case 0: brickColor = COLORS.BRICK_1; break;
                case 1: brickColor = COLORS.BRICK_2; break;
                case 2: brickColor = COLORS.BRICK_3; break;
                case 3: brickColor = COLORS.BRICK_4; break;
                default: brickColor = COLORS.BRICK_1; break;
            }

            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1,
                color: brickColor,
                points: (BRICK_ROW_COUNT - r) * 10 // Higher rows worth more points
            };
        }
    }
}

// Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = COLORS.PADDLE;
    ctx.fill();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.PADDLE;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.BALL;

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.BALL;
    ctx.fill();
    ctx.shadowBlur = 0;
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

                // Add glow effect based on brick color
                ctx.shadowBlur = 8;
                ctx.shadowColor = bricks[c][r].color;
                ctx.fill();
                ctx.shadowBlur = 0;
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
                    score += brick.points;
                    scoreElement.textContent = score;

                    // Check for win
                    if (score === calculateTotalScore()) {
                        showMessage('YOU WIN!');
                        gameActive = false;
                        restartButton.style.display = 'block';
                    }
                }
            }
        }
    }
}

// Calculate total possible score
function calculateTotalScore() {
    let total = 0;
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            total += bricks[c][r].points;
        }
    }
    return total;
}

// Move the ball
function moveBall() {
    // Gradually increase ball speed
    ballSpeed += SPEED_INCREMENT;

    // Normalize direction vector and apply current speed
    const magnitude = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
    ballDX = (ballDX / magnitude) * ballSpeed;
    ballDY = (ballDY / magnitude) * ballSpeed;

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

            // Create more dynamic angles: range from -60 to +60 degrees
            const angle = (hitPosition - 0.5) * Math.PI * 0.6;

            // Set direction vector using the angle, maintaining current speed
            ballDX = Math.sin(angle) * ballSpeed;
            ballDY = -Math.cos(angle) * ballSpeed;
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
                ballSpeed = INITIAL_BALL_SPEED;

                // Set random initial direction
                const angle = Math.random() * Math.PI / 3 - Math.PI / 6;
                ballDX = ballSpeed * Math.sin(angle);
                ballDY = -ballSpeed * Math.cos(angle);

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

    const moveSpeed = 12; // Increased paddle speed for better control with faster ball

    if (e.key === 'ArrowRight' && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += moveSpeed;
    } else if (e.key === 'ArrowLeft' && paddleX > 0) {
        paddleX -= moveSpeed;
    }
});

// Restart button
restartButton.addEventListener('click', initGame);

// Start game when page loads
window.addEventListener('load', initGame);
