// Void Serpent - A minimalist snake game
// Canvas-based implementation with keyboard controls

// Game constants
const GRID_SIZE = 20; // Size of each grid cell in pixels
const INITIAL_SPEED = 10; // Initial frames per movement
const MAX_SPEED = 5; // Maximum speed (minimum frames per movement)
const SPEED_INCREMENT = 0.05; // How much speed increases per fragment collected
const INITIAL_LENGTH = 5; // Starting length of serpent
const FRAGMENT_TYPES = ['circle', 'square', 'triangle']; // Different fragment shapes

// Game state
const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: 0,
    serpent: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    fragment: { x: 0, y: 0, type: 'circle' },
    framesPerMovement: INITIAL_SPEED,
    lastMoveTime: 0,
    animationFrameId: null,
    shakeEffect: false,
    shakeTime: 0,
    pulseEffect: false,
    pulseTime: 0,
    pulseRadius: 0,
    trail: [],
    gameTime: 0
};

// DOM elements
let canvas, ctx;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay;
let scoreDisplay, highScoreDisplay;
let errorOverlay, livesContainer;

// Initialize the game
function initGame() {
    try {
        // Get DOM elements
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');

        helpButton = document.getElementById('help-button');
        helpPanel = document.getElementById('help-panel');
        closeHelp = document.getElementById('close-help');

        pauseOverlay = document.getElementById('pause-overlay');
        gameOverOverlay = document.getElementById('game-over');

        scoreDisplay = document.getElementById('score-display');
        highScoreDisplay = document.getElementById('high-score-display');

        errorOverlay = document.getElementById('error-overlay');
        livesContainer = document.getElementById('lives-container');

        // Set canvas size to match window
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem('voidSerpentHighScore')) || 0;
        updateScoreDisplay();

        // Add event listeners
        addEventListeners();

        // Reset game to initial state
        resetGame();

        // Start game loop
        gameLoop();

        // Set up error handling
        window.addEventListener('error', handleError);
    } catch (error) {
        showErrorOverlay();
        console.error('Game initialization error:', error);
    }
}

// Add event listeners
function addEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeydown);

    // Help button toggle
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);

    // Restart button
    document.getElementById('restart-button').addEventListener('click', startGame);
}

// Resize canvas to fill window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Reset game to initial state
function resetGame() {
    // Clear serpent array
    gameState.serpent = [];

    // Create initial serpent in the middle of the screen
    const centerX = Math.floor(canvas.width / (2 * GRID_SIZE));
    const centerY = Math.floor(canvas.height / (2 * GRID_SIZE));

    for (let i = 0; i < INITIAL_LENGTH; i++) {
        gameState.serpent.unshift({ x: centerX - i, y: centerY });
    }

    // Reset game variables
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.framesPerMovement = INITIAL_SPEED;
    gameState.score = 0;
    gameState.gameTime = 0;
    gameState.trail = [];
    gameState.isPlaying = false;
    gameState.isPaused = false;

    // Create initial fragment
    createFragment();

    // Update score display
    updateScoreDisplay();
}

// Start game
function startGame() {
    resetGame();
    gameState.isPlaying = true;

    // Hide overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
}

// Toggle help panel
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

// Toggle pause state
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);
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
    gameState.fragment = {
        x: newPos.x,
        y: newPos.y,
        type: randomType
    };

    // Trigger pulse effect
    gameState.pulseEffect = true;
    gameState.pulseTime = 0;
    gameState.pulseRadius = 0;
}

// Check if a position overlaps with the serpent
function isPositionOnSerpent(pos) {
    return gameState.serpent.some(segment => segment.x === pos.x && segment.y === pos.y);
}

// Handle keyboard input
function handleKeydown(e) {
    // Title screen - start game with any directional key
    if (!gameState.isPlaying) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            gameState.isPlaying = true;
        }
    }

    // Handle directional input based on key
    switch (e.key) {
        case 'ArrowUp':
            if (gameState.direction.y !== 1) { // Prevent 180 degree turns
                gameState.nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (gameState.direction.y !== -1) {
                gameState.nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (gameState.direction.x !== 1) {
                gameState.nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (gameState.direction.x !== -1) {
                gameState.nextDirection = { x: 1, y: 0 };
            }
            break;
        case 'Escape':
            // Toggle pause state
            togglePause();
            break;
        case 'q':
        case 'Q':
            // Exit to landing page
            window.location.href = '../../index.html';
            break;
        case 'r':
        case 'R':
            // Restart game (hidden feature)
            if (!gameState.isPlaying) {
                resetGame();
                gameState.isPlaying = true;
            }
            break;
    }
}

// Update game state
function update(timestamp) {
    // Increment game time
    gameState.gameTime += 1;

    // Only update game logic if playing and not paused
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Update movement based on frames
    if (timestamp - gameState.lastMoveTime > (1000 / 60) * gameState.framesPerMovement) {
        gameState.lastMoveTime = timestamp;

        // Apply nextDirection to current direction
        gameState.direction = { ...gameState.nextDirection };

        // Calculate new head position
        const head = { ...gameState.serpent[0] };
        head.x += gameState.direction.x;
        head.y += gameState.direction.y;

        // Add current head to trail for motion effect
        if (gameState.gameTime % 2 === 0) {
            gameState.trail.push({
                x: gameState.serpent[0].x,
                y: gameState.serpent[0].y,
                age: 0
            });
        }

        // Age and remove old trail segments
        gameState.trail.forEach(segment => segment.age++);
        gameState.trail = gameState.trail.filter(segment => segment.age < 10);

        // Check for collision with walls
        const gridWidth = Math.floor(canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(canvas.height / GRID_SIZE);

        if (head.x < 0 || head.y < 0 || head.x >= gridWidth || head.y >= gridHeight) {
            handleCollision();
            return;
        }

        // Check for collision with self (except when just starting)
        if (gameState.serpent.length > INITIAL_LENGTH) {
            for (let i = 0; i < gameState.serpent.length; i++) {
                if (gameState.serpent[i].x === head.x && gameState.serpent[i].y === head.y) {
                    handleCollision();
                    return;
                }
            }
        }

        // Check for fragment collection
        if (head.x === gameState.fragment.x && head.y === gameState.fragment.y) {
            // Increase score
            gameState.score++;
            updateScoreDisplay();

            // Create new fragment
            createFragment();

            // Increase speed
            gameState.framesPerMovement = Math.max(MAX_SPEED, gameState.framesPerMovement - SPEED_INCREMENT);
        } else {
            // Remove tail segment if no fragment was collected
            gameState.serpent.pop();
        }

        // Add new head
        gameState.serpent.unshift(head);
    }

    // Update pulse effect
    if (gameState.pulseEffect) {
        gameState.pulseTime += 1;
        gameState.pulseRadius = 30 * Math.sin(gameState.pulseTime * 0.1);

        if (gameState.pulseTime > 30) {
            gameState.pulseEffect = false;
        }
    }

    // Update shake effect
    if (gameState.shakeEffect) {
        gameState.shakeTime += 1;

        if (gameState.shakeTime > 30) {
            gameState.shakeEffect = false;
            gameState.shakeTime = 0;
        }
    }
}

// Handle collision events
function handleCollision() {
    gameState.isPlaying = false;
    gameState.shakeEffect = true;

    // Update high score if needed
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('voidSerpentHighScore', gameState.highScore);
        updateScoreDisplay();
    }

    // Show game over overlay
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('high-score').textContent = gameState.highScore;
    gameOverOverlay.classList.remove('hidden');
}

// Draw everything on the canvas
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply shake effect if active
    if (gameState.shakeEffect) {
        const shakeIntensity = 5;
        const shakeX = Math.random() * shakeIntensity * 2 - shakeIntensity;
        const shakeY = Math.random() * shakeIntensity * 2 - shakeIntensity;
        ctx.save();
        ctx.translate(shakeX, shakeY);
    }

    // Draw trails
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    gameState.trail.forEach(segment => {
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
    gameState.serpent.forEach((segment, index) => {
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
    const fragmentX = gameState.fragment.x * GRID_SIZE + GRID_SIZE / 2;
    const fragmentY = gameState.fragment.y * GRID_SIZE + GRID_SIZE / 2;
    const fragmentSize = GRID_SIZE * 0.7;

    // Draw pulse effect if active
    if (gameState.pulseEffect) {
        ctx.beginPath();
        ctx.arc(fragmentX, fragmentY, gameState.pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
    }

    // Draw fragment based on type
    ctx.fillStyle = '#FFFFFF';
    switch (gameState.fragment.type) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(fragmentX, fragmentY, fragmentSize / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'square':
            ctx.fillRect(
                gameState.fragment.x * GRID_SIZE + (GRID_SIZE - fragmentSize) / 2,
                gameState.fragment.y * GRID_SIZE + (GRID_SIZE - fragmentSize) / 2,
                fragmentSize,
                fragmentSize
            );
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(fragmentX, gameState.fragment.y * GRID_SIZE + (GRID_SIZE - fragmentSize) / 2);
            ctx.lineTo(gameState.fragment.x * GRID_SIZE + (GRID_SIZE - fragmentSize) / 2,
                gameState.fragment.y * GRID_SIZE + GRID_SIZE - (GRID_SIZE - fragmentSize) / 2);
            ctx.lineTo(gameState.fragment.x * GRID_SIZE + GRID_SIZE - (GRID_SIZE - fragmentSize) / 2,
                gameState.fragment.y * GRID_SIZE + GRID_SIZE - (GRID_SIZE - fragmentSize) / 2);
            ctx.closePath();
            ctx.fill();
            break;
    }

    // Reset transformation if shake was applied
    if (gameState.shakeEffect) {
        ctx.restore();
    }
}

// Empty function - left for compatibility
function drawTitleScreen() {
    // Animation removed per requirement
}

// Update score displays
function updateScoreDisplay() {
    scoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;
}

// Show error overlay
function showErrorOverlay() {
    errorOverlay.classList.remove('hidden');
}

// Handle game errors
function handleError(e) {
    console.error('Game error:', e);
    showErrorOverlay();
}

// Main game loop
function gameLoop(timestamp) {
    update(timestamp);
    draw();
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);
