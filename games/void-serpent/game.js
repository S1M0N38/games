// Void Serpent - A minimalist snake game
// Canvas-based implementation with keyboard controls

// Game constants
const GRID_SIZE = 20; // Size of each grid cell in pixels
const INITIAL_SPEED = 10; // Initial frames per movement
const MAX_SPEED = 5; // Maximum speed (minimum frames per movement)
const SPEED_INCREMENT = 0.05; // How much speed increases per fragment collected
const INITIAL_LENGTH = 5; // Starting length of serpent
const FRAGMENT_TYPES = ['circle', 'square', 'triangle']; // Different fragment shapes

// Game variables
let canvas, ctx;
let serpent = []; // Array of serpent segments
let direction = { x: 1, y: 0 }; // Initial direction (right)
let nextDirection = { x: 1, y: 0 }; // Direction after next movement
let fragment = { x: 0, y: 0, type: 'circle' }; // Light fragment position and type
let score = 0;
let highScore = 0;
let framesPerMovement = INITIAL_SPEED; // Controls game speed
let lastMoveTime = 0;
let gameState = 'title'; // title, playing, paused, gameOver
let animationFrameId;
let shakeEffect = false;
let shakeTime = 0;
let shakeIntensity = 5;
let pulseEffect = false;
let pulseTime = 0;
let pulseRadius = 0;
let trail = [];
let gameTime = 0;

// Initialize the game
function init() {
    // Set up canvas
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Set canvas size to match window
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load high score from localStorage
    highScore = localStorage.getItem('voidSerpentHighScore') || 0;
    updateScoreDisplay();

    // Set up event listeners
    window.addEventListener('keydown', handleKeydown);

    // Initialize serpent in the middle of the canvas
    resetGame();

    // Start game loop
    gameLoop();

    // Set up error handling
    window.addEventListener('error', handleError);
}

// Resize canvas to fill window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Reset game to initial state
function resetGame() {
    // Clear serpent array
    serpent = [];

    // Create initial serpent in the middle of the screen
    const centerX = Math.floor(canvas.width / (2 * GRID_SIZE));
    const centerY = Math.floor(canvas.height / (2 * GRID_SIZE));

    for (let i = 0; i < INITIAL_LENGTH; i++) {
        serpent.unshift({ x: centerX - i, y: centerY });
    }

    // Reset game variables
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    framesPerMovement = INITIAL_SPEED;
    score = 0;
    gameTime = 0;
    trail = [];

    // Create initial fragment
    createFragment();

    // Update score display
    updateScoreDisplay();
}

// Create a new light fragment
function createFragment() {
    // Calculate grid dimensions
    const gridWidth = Math.floor(canvas.width / GRID_SIZE);
    const gridHeight = Math.floor(canvas.height / GRID_SIZE);

    // Generate random position ensuring it's not on the serpent
    let newPos;
    do {
        newPos = {
            x: Math.floor(Math.random() * (gridWidth - 2)) + 1,
            y: Math.floor(Math.random() * (gridHeight - 2)) + 1
        };
    } while (isPositionOnSerpent(newPos));

    // Select random fragment type
    const randomType = FRAGMENT_TYPES[Math.floor(Math.random() * FRAGMENT_TYPES.length)];

    // Set new fragment
    fragment = {
        x: newPos.x,
        y: newPos.y,
        type: randomType
    };

    // Trigger pulse effect
    pulseEffect = true;
    pulseTime = 0;
    pulseRadius = 0;
}

// Check if a position overlaps with the serpent
function isPositionOnSerpent(pos) {
    return serpent.some(segment => segment.x === pos.x && segment.y === pos.y);
}

// Handle keyboard input
function handleKeydown(e) {
    // Title screen - start game with any directional key
    if (gameState === 'title') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            gameState = 'playing';
        }
    }

    // Handle directional input based on key
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) { // Prevent 180 degree turns
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
        case 'Escape':
            // Toggle pause state
            if (gameState === 'playing') {
                gameState = 'paused';
            } else if (gameState === 'paused') {
                gameState = 'playing';
            }
            break;
        case 'q':
            // Exit to landing page
            window.location.href = '../../index.html';
            break;
        case 'r':
            // Restart game (hidden feature)
            if (gameState === 'gameOver') {
                resetGame();
                gameState = 'title';
            }
            break;
    }
}

// Update game state
function update(timestamp) {
    // Increment game time
    gameTime += 1;

    // Only update game logic if playing
    if (gameState !== 'playing') return;

    // Update movement based on frames
    if (timestamp - lastMoveTime > (1000 / 60) * framesPerMovement) {
        lastMoveTime = timestamp;

        // Apply nextDirection to current direction
        direction = { ...nextDirection };

        // Calculate new head position
        const head = { ...serpent[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Add current head to trail for motion effect
        if (gameTime % 2 === 0) {
            trail.push({
                x: serpent[0].x,
                y: serpent[0].y,
                age: 0
            });
        }

        // Age and remove old trail segments
        trail.forEach(segment => segment.age++);
        trail = trail.filter(segment => segment.age < 10);

        // Check for collision with walls
        const gridWidth = Math.floor(canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(canvas.height / GRID_SIZE);

        if (head.x < 0 || head.y < 0 || head.x >= gridWidth || head.y >= gridHeight) {
            handleCollision();
            return;
        }

        // Check for collision with self (except when just starting)
        if (serpent.length > INITIAL_LENGTH) {
            for (let i = 0; i < serpent.length; i++) {
                if (serpent[i].x === head.x && serpent[i].y === head.y) {
                    handleCollision();
                    return;
                }
            }
        }

        // Check for fragment collection
        if (head.x === fragment.x && head.y === fragment.y) {
            // Increase score
            score++;
            updateScoreDisplay();

            // Create new fragment
            createFragment();

            // Increase speed
            framesPerMovement = Math.max(MAX_SPEED, framesPerMovement - SPEED_INCREMENT);
        } else {
            // Remove tail segment if no fragment was collected
            serpent.pop();
        }

        // Add new head
        serpent.unshift(head);
    }

    // Update pulse effect
    if (pulseEffect) {
        pulseTime += 1;
        pulseRadius = 30 * Math.sin(pulseTime * 0.1);

        if (pulseTime > 30) {
            pulseEffect = false;
        }
    }

    // Update shake effect
    if (shakeEffect) {
        shakeTime += 1;

        if (shakeTime > 30) {
            shakeEffect = false;
            shakeTime = 0;
        }
    }
}

// Handle collision events
function handleCollision() {
    gameState = 'gameOver';
    shakeEffect = true;

    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('voidSerpentHighScore', highScore);
        updateScoreDisplay();
    }

    // Timeout to allow viewing of final state before restart prompt
    setTimeout(() => {
        gameState = 'title';
        resetGame();
    }, 2000);
}

// Draw everything on the canvas
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply shake effect if active
    if (shakeEffect) {
        const shakeX = Math.random() * shakeIntensity * 2 - shakeIntensity;
        const shakeY = Math.random() * shakeIntensity * 2 - shakeIntensity;
        ctx.save();
        ctx.translate(shakeX, shakeY);
    }

    // Draw trails
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    trail.forEach(segment => {
        const alpha = 0.3 - (segment.age / 10) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
    });
    ctx.globalAlpha = 1;

    // Draw serpent
    ctx.fillStyle = '#FFFFFF';
    serpent.forEach((segment, index) => {
        // Apply gradient to serpent segments - head is brightest
        const brightness = 255 - (index * 5);
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;

        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
    });

    // Draw fragment based on its type
    ctx.fillStyle = '#FFFFFF';
    const fragmentX = fragment.x * GRID_SIZE + GRID_SIZE / 2;
    const fragmentY = fragment.y * GRID_SIZE + GRID_SIZE / 2;
    const fragmentSize = GRID_SIZE * 0.7;

    // Draw pulse effect if active
    if (pulseEffect) {
        ctx.beginPath();
        ctx.arc(fragmentX, fragmentY, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
    }

    // Draw fragment based on type
    ctx.fillStyle = '#FFFFFF';
    switch (fragment.type) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(fragmentX, fragmentY, fragmentSize / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'square':
            ctx.fillRect(
                fragment.x * GRID_SIZE + (GRID_SIZE - fragmentSize) / 2,
                fragment.y * GRID_SIZE + (GRID_SIZE - fragmentSize) / 2,
                fragmentSize,
                fragmentSize
            );
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(fragmentX, fragment.y * GRID_SIZE + (GRID_SIZE - fragmentSize) / 2);
            ctx.lineTo(fragment.x * GRID_SIZE + (GRID_SIZE - fragmentSize) / 2,
                fragment.y * GRID_SIZE + GRID_SIZE - (GRID_SIZE - fragmentSize) / 2);
            ctx.lineTo(fragment.x * GRID_SIZE + GRID_SIZE - (GRID_SIZE - fragmentSize) / 2,
                fragment.y * GRID_SIZE + GRID_SIZE - (GRID_SIZE - fragmentSize) / 2);
            ctx.closePath();
            ctx.fill();
            break;
    }

    // Reset transformation if shake was applied
    if (shakeEffect) {
        ctx.restore();
    }

    // Draw title screen
    if (gameState === 'title') {
        drawTitleScreen();
    }

    // Draw pause screen
    if (gameState === 'paused') {
        drawPauseScreen();
    }

    // Draw game over effect
    if (gameState === 'gameOver') {
        drawGameOverScreen();
    }
}

// Draw title screen with pulsing serpent indicator
function drawTitleScreen() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw pulsing arrow
    const pulseScale = 1 + 0.2 * Math.sin(gameTime * 0.05);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(pulseScale, pulseScale);

    // Draw a simple arrow indicating start (no text)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-40, -20);
    ctx.lineTo(40, 0);
    ctx.lineTo(-40, 20);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Draw pause indicator
function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pause icon (two vertical bars)
    const barWidth = 20;
    const barHeight = 80;
    const spacing = 30;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(
        canvas.width / 2 - spacing / 2 - barWidth,
        canvas.height / 2 - barHeight / 2,
        barWidth,
        barHeight
    );

    ctx.fillRect(
        canvas.width / 2 + spacing / 2,
        canvas.height / 2 - barHeight / 2,
        barWidth,
        barHeight
    );
}

// Draw game over effect
function drawGameOverScreen() {
    // Fade effect based on time since game over
    const fadeProgress = Math.min(shakeTime / 30, 1);

    // Apply dissolution effect to serpent
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    serpent.forEach((segment, index) => {
        // Skip some segments based on fadeProgress to create dissolution
        if (Math.random() > fadeProgress) {
            const dissolutionX = segment.x * GRID_SIZE + (Math.random() * 10 - 5) * fadeProgress;
            const dissolutionY = segment.y * GRID_SIZE + (Math.random() * 10 - 5) * fadeProgress;

            ctx.fillRect(
                dissolutionX,
                dissolutionY,
                GRID_SIZE * (1 - fadeProgress * 0.5),
                GRID_SIZE * (1 - fadeProgress * 0.5)
            );
        }
    });
}

// Update score displays
function updateScoreDisplay() {
    document.getElementById('score-display').textContent = score;
    document.getElementById('high-score-display').textContent = highScore;
}

// Handle game errors
function handleError(e) {
    console.error('Game error:', e);
    document.getElementById('error-overlay').style.display = 'flex';
}

// Main game loop
function gameLoop(timestamp) {
    update(timestamp);
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Start the game
window.addEventListener('load', init);
