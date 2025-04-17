/**
 * Gravity Field - A physics-based space game
 * Control a gravity field to attract objects to the center
 */

// Game constants
// Update visual settings to make planet larger and more visible
const CONFIG = {
    // Game settings
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'gravityFieldHighScore',

    // Visual settings
    VISUAL: {
        TARGET_COLOR: '#FFFFFF',        // Pure white for safe objects
        HAZARD_COLOR: '#666666',        // Medium gray for hazard objects
        COLLECTION_ZONE_COLOR: '#FFFFFF', // Pure white for visibility
        COLLECTION_ZONE_BORDER: '#FFFFFF',
        COLLECTION_ZONE_RADIUS: 80,     // Increased from 50 to 80 for better visibility
        COLLECTION_PULSE_AMOUNT: 0.08,  // Subtle pulse amount
        SCREEN_SHAKE_DURATION: 0.3,     // seconds
        SCREEN_SHAKE_INTENSITY: 5,      // pixels
    },

    // Physics constants
    PHYSICS: {
        GRAVITY_STRENGTH: 6000,         // Increased to handle larger objects
        GRAVITY_FALLOFF: 1.5,           // Power for inverse distance gravity falloff
        MIN_OBJECT_SPEED: 15,           // Reduced speed slightly for larger objects
        MAX_OBJECT_SPEED: 40,
        MAX_OBJECT_ROTATION: Math.PI / 3,
        SPAWN_RATE_INITIAL: 1.5,        // Reduced from 3 to 1.5 for fewer objects
        SPAWN_RATE_MAX: 4,              // Reduced from 8 to 4 for fewer objects
        DIFFICULTY_INCREASE_RATE: 0.04, // Reduced to balance fewer objects
        MIN_OBJECT_SIZE: 15,            // Increased from 8 to 15 for larger objects
        MAX_OBJECT_SIZE: 35,            // Increased from 20 to 35 for larger objects
        HAZARD_CHANCE_INITIAL: 0.2,
        HAZARD_CHANCE_MAX: 0.5,
        OFFSCREEN_BUFFER: 100,
    },

    // Object types
    OBJECT_TYPE: {
        TARGET: 'target',
        HAZARD: 'hazard',
    },

    // Game states
    GAME_STATE: {
        INTRO: 'intro',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover',
        ERROR: 'error'
    }
};

// Game state
const gameState = {
    // Core game state
    state: CONFIG.GAME_STATE.INTRO,
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    highScore: 0,
    isPlaying: false,
    isPaused: false,
    difficulty: 0,

    // Animation and timing
    lastTime: 0,
    delta: 0,
    animationFrameId: null,
    timers: [],
    lastSpawnTime: 0,
    gameTime: 0,

    // Screen effects
    screenShake: {
        active: false,
        duration: 0,
        timeRemaining: 0,
        intensity: 0
    },

    // Mouse input state
    mouse: {
        x: 0,
        y: 0,
        isDown: false
    },

    // Game objects
    objects: [],
    gravityField: {
        active: false,
        x: 0,
        y: 0,
        strength: CONFIG.PHYSICS.GRAVITY_STRENGTH,
        radius: 0,
        pulseTime: 0
    },
    collectionZone: {
        x: 0,
        y: 0,
        radius: CONFIG.VISUAL.COLLECTION_ZONE_RADIUS,
        pulseTime: 0
    },
    effects: []
};

// DOM elements
let canvas, ctx;
let scoreDisplay, livesContainer;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
let errorOverlay;

// Initialization
function initGame() {
    try {
        // Get DOM elements
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        scoreDisplay = document.getElementById('score');
        livesContainer = document.getElementById('lives-container');
        helpButton = document.getElementById('help-button');
        helpPanel = document.getElementById('help-panel');
        closeHelp = document.getElementById('close-help');
        pauseOverlay = document.getElementById('pause-overlay');
        gameOverOverlay = document.getElementById('game-over');
        finalScoreDisplay = document.getElementById('final-score');
        highScoreDisplay = document.getElementById('high-score');
        restartButton = document.getElementById('restart-button');
        errorOverlay = document.getElementById('error-overlay');

        // Set canvas dimensions
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        // Create lives indicators
        createLivesIndicators();

        // Add event listeners
        addEventListeners();

        // Initialize game elements
        initializeGameElements();

        // Start intro
        startIntro();

    } catch (error) {
        handleError('Game initialization error:', error);
    }
}

// Setup functions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Update collection zone position to center of canvas
    if (gameState.collectionZone) {
        gameState.collectionZone.x = canvas.width / 2;
        gameState.collectionZone.y = canvas.height / 2;
    }
}

function createLivesIndicators() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) {
        const life = document.createElement('div');
        life.className = 'life';
        livesContainer.appendChild(life);
    }
}

function addEventListeners() {
    // UI controls
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);
    restartButton.addEventListener('click', startGame);

    // Mouse controls for gravity field
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Keyboard controls for pause and quit
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'Escape':
                togglePause();
                break;
            case 'q':
            case 'Q':
                navigateToLanding();
                break;
        }
    });

    // Error handling
    window.addEventListener('error', (event) => {
        handleError('Global error:', event.error);
    });
}

function initializeGameElements() {
    // Set collection zone to center of screen
    gameState.collectionZone.x = canvas.width / 2;
    gameState.collectionZone.y = canvas.height / 2;

    // Initialize empty arrays
    gameState.objects = [];
    gameState.effects = [];
}

// UI functions
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

function togglePause() {
    if (!gameState.isPlaying) return;

    gameState.isPaused = !gameState.isPaused;
    gameState.state = gameState.isPaused ? CONFIG.GAME_STATE.PAUSED : CONFIG.GAME_STATE.PLAYING;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);

    if (gameState.isPaused) {
        cancelAnimationFrame(gameState.animationFrameId);
        gameState.timers.forEach(timer => clearTimeout(timer));
        gameState.timers = [];
    } else {
        gameState.lastTime = performance.now();
        gameLoop(gameState.lastTime);
    }
}

function updateLivesDisplay() {
    const lifeElements = document.querySelectorAll('.life');
    lifeElements.forEach((life, index) => {
        life.classList.toggle('lost', index >= gameState.lives);
    });
}

function navigateToLanding() {
    window.location.href = '../../index.html';
}

// Game state functions
function startIntro() {
    gameState.state = CONFIG.GAME_STATE.INTRO;
    gameState.isPlaying = false;
    gameState.isPaused = false;

    // Create some background objects for the intro
    for (let i = 0; i < 10; i++) {
        spawnRandomObject();
    }

    // Render the intro state once
    render();

    // Auto-start game after short delay
    setTimeout(() => {
        startGame();
    }, 2000);
}

function startGame() {
    // Reset game state
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.difficulty = 0;
    gameState.gameTime = 0;
    gameState.lastSpawnTime = 0;

    // Reset game-specific state
    resetGameState();

    // Update UI
    scoreDisplay.textContent = gameState.score;
    updateLivesDisplay();

    // Hide overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Start game loop
    gameState.lastTime = performance.now();
    gameLoop(gameState.lastTime);
}

function resetGameState() {
    // Clear objects and effects
    gameState.objects = [];
    gameState.effects = [];

    // Reset gravity field
    gameState.gravityField.active = false;

    // Reset collection zone
    gameState.collectionZone.x = canvas.width / 2;
    gameState.collectionZone.y = canvas.height / 2;
    gameState.collectionZone.pulseTime = 0;

    // Reset screen shake
    gameState.screenShake.active = false;
}

function gameOver() {
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    gameState.isPlaying = false;

    // Cancel animation frame and clear timers
    cancelAnimationFrame(gameState.animationFrameId);
    gameState.timers.forEach(timer => clearTimeout(timer));
    gameState.timers = [];

    // Check for high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem(CONFIG.STORAGE_KEY, gameState.highScore);
    }

    // Update game over screen
    finalScoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;

    // Add game over implosion effect
    addImplosionEffect();

    // Show game over overlay after a delay
    setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
    }, 1500);
}

function addImplosionEffect() {
    // Create an implosion effect by adding forces to all objects toward the center
    gameState.objects.forEach(obj => {
        // Calculate direction to center
        const dx = gameState.collectionZone.x - obj.x;
        const dy = gameState.collectionZone.y - obj.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize and set velocity toward center with increasing speed
        obj.velocityX = dx / distance * 300;
        obj.velocityY = dy / distance * 300;

        // Increase rotation for visual effect
        obj.rotationSpeed *= 3;
    });

    // Continue animation for a moment before showing game over screen
    const renderImplosion = () => {
        // Update positions
        gameState.objects.forEach(obj => {
            obj.x += obj.velocityX * 0.016; // Approx for 60fps
            obj.y += obj.velocityY * 0.016;
            obj.rotation += obj.rotationSpeed * 0.016;

            // Increase velocity for acceleration effect
            obj.velocityX *= 1.05;
            obj.velocityY *= 1.05;
        });

        // Render
        render();

        // Continue animation until game over screen appears
        if (gameState.state === CONFIG.GAME_STATE.GAME_OVER) {
            requestAnimationFrame(renderImplosion);
        }
    };

    requestAnimationFrame(renderImplosion);
}

// Input handlers
function handleMouseMove(event) {
    gameState.mouse.x = event.clientX;
    gameState.mouse.y = event.clientY;

    if (gameState.mouse.isDown && gameState.isPlaying) {
        // Update gravity field position to follow mouse
        gameState.gravityField.x = gameState.mouse.x;
        gameState.gravityField.y = gameState.mouse.y;
    }
}

function handleMouseDown(event) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    gameState.mouse.isDown = true;
    gameState.gravityField.active = true;
    gameState.gravityField.x = event.clientX;
    gameState.gravityField.y = event.clientY;
    gameState.gravityField.pulseTime = 0;

    // Add visual indication of active gravity
    canvas.classList.add('active-gravity');
}

function handleMouseUp() {
    gameState.mouse.isDown = false;
    gameState.gravityField.active = false;

    // Remove visual indication
    canvas.classList.remove('active-gravity');
}

// Game loop
function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Calculate delta time for smooth animation
    gameState.delta = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    // Cap delta time to prevent large jumps if tab was inactive
    const deltaTime = Math.min(gameState.delta / 1000, 0.1);

    // Update game time
    gameState.gameTime += deltaTime;

    try {
        // Update game state
        update(deltaTime);

        // Render frame
        render();

        // Continue loop
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    } catch (error) {
        handleError('Game loop error:', error);
    }
}

// Object creation
function spawnRandomObject() {
    // Determine if this is a target or hazard
    const hazardChance = Math.min(
        CONFIG.PHYSICS.HAZARD_CHANCE_INITIAL + gameState.difficulty * 0.02,
        CONFIG.PHYSICS.HAZARD_CHANCE_MAX
    );

    const isHazard = Math.random() < hazardChance;
    const type = isHazard ? CONFIG.OBJECT_TYPE.HAZARD : CONFIG.OBJECT_TYPE.TARGET;

    // Position object at the edge of the screen
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (side) {
        case 0: // Top
            x = Math.random() * canvas.width;
            y = -CONFIG.PHYSICS.MAX_OBJECT_SIZE;
            break;
        case 1: // Right
            x = canvas.width + CONFIG.PHYSICS.MAX_OBJECT_SIZE;
            y = Math.random() * canvas.height;
            break;
        case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + CONFIG.PHYSICS.MAX_OBJECT_SIZE;
            break;
        case 3: // Left
            x = -CONFIG.PHYSICS.MAX_OBJECT_SIZE;
            y = Math.random() * canvas.height;
            break;
    }

    // Calculate direction toward a random point on screen
    const targetX = canvas.width * (0.2 + Math.random() * 0.6);
    const targetY = canvas.height * (0.2 + Math.random() * 0.6);

    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Speed increases with difficulty
    const speedMultiplier = 1 + gameState.difficulty * 0.1;
    const speed = (CONFIG.PHYSICS.MIN_OBJECT_SPEED + Math.random() *
        (CONFIG.PHYSICS.MAX_OBJECT_SPEED - CONFIG.PHYSICS.MIN_OBJECT_SPEED)) *
        speedMultiplier;

    // Normalize direction and multiply by speed
    const velocityX = (dx / distance) * speed;
    const velocityY = (dy / distance) * speed;

    // Size and mass properties
    let size;
    if (isHazard) {
        // Hazards are larger to be more visible
        size = (CONFIG.PHYSICS.MIN_OBJECT_SIZE * 1.5) +
            Math.random() * ((CONFIG.PHYSICS.MAX_OBJECT_SIZE * 1.5) - (CONFIG.PHYSICS.MIN_OBJECT_SIZE * 1.5));
    } else {
        size = CONFIG.PHYSICS.MIN_OBJECT_SIZE +
            Math.random() * (CONFIG.PHYSICS.MAX_OBJECT_SIZE - CONFIG.PHYSICS.MIN_OBJECT_SIZE);
    }

    // Hazards are polygons, targets are circles
    const vertices = isHazard ? generateHazardVertices(size) : null;

    // Create the object
    const object = {
        x,
        y,
        velocityX,
        velocityY,
        size,
        mass: isHazard ? size * 0.7 : size, // Hazards have less mass
        type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() * 2 - 1) * CONFIG.PHYSICS.MAX_OBJECT_ROTATION,
        vertices,
        created: gameState.gameTime
    };

    gameState.objects.push(object);
}

function generateHazardVertices(size) {
    // Generate a polygon shape for hazards
    const numVertices = 3 + Math.floor(Math.random() * 3); // 3 to 5 vertices
    const vertices = [];

    for (let i = 0; i < numVertices; i++) {
        const angle = (i / numVertices) * Math.PI * 2;
        const variance = 0.6 + Math.random() * 0.3; // 0.6 to 0.9
        const vertexSize = size * variance;

        vertices.push({
            x: Math.cos(angle) * vertexSize,
            y: Math.sin(angle) * vertexSize
        });
    }

    return vertices;
}

// Update and render
function update(deltaTime) {
    // Update difficulty based on time
    updateDifficulty(deltaTime);

    // Spawn new objects based on difficulty
    updateObjectSpawning(deltaTime);

    // Update screen shake if active
    updateScreenShake(deltaTime);

    // Update all objects (position, velocity, rotation)
    updateObjects(deltaTime);

    // Check for collisions
    checkCollisions();

    // Update visual effects
    updateEffects(deltaTime);

    // Clean up objects that have left the screen
    cleanupObjects();
}

function updateDifficulty(deltaTime) {
    // Gradually increase difficulty over time
    gameState.difficulty += CONFIG.PHYSICS.DIFFICULTY_INCREASE_RATE * deltaTime;
}

function updateObjectSpawning(deltaTime) {
    // Calculate spawn rate based on difficulty
    const spawnRate = CONFIG.PHYSICS.SPAWN_RATE_INITIAL +
        (gameState.difficulty * 0.3);

    // Calculate time between spawns
    const spawnInterval = 1 / Math.min(spawnRate, CONFIG.PHYSICS.SPAWN_RATE_MAX);

    // Check if it's time to spawn a new object
    if (gameState.gameTime - gameState.lastSpawnTime >= spawnInterval) {
        spawnRandomObject();
        gameState.lastSpawnTime = gameState.gameTime;
    }
}

function updateScreenShake(deltaTime) {
    if (gameState.screenShake.active) {
        gameState.screenShake.timeRemaining -= deltaTime;

        if (gameState.screenShake.timeRemaining <= 0) {
            gameState.screenShake.active = false;
        }
    }
}

function updateObjects(deltaTime) {
    // Update collection zone pulsing
    gameState.collectionZone.pulseTime += deltaTime;
    if (gameState.collectionZone.pulseTime > CONFIG.VISUAL.COLLECTION_PULSE_DURATION) {
        gameState.collectionZone.pulseTime = 0;
    }

    // Update each object
    gameState.objects.forEach(obj => {
        // Apply gravity if active
        if (gameState.gravityField.active) {
            // Calculate distance to gravity field
            const dx = gameState.gravityField.x - obj.x;
            const dy = gameState.gravityField.y - obj.y;
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSquared);

            // Skip if too close to prevent extreme acceleration
            if (distance > 5) {
                // Calculate gravity force (inverse square law)
                const gravityForce = gameState.gravityField.strength /
                    Math.pow(distance, CONFIG.PHYSICS.GRAVITY_FALLOFF);

                // Scale by object mass
                const force = gravityForce * obj.mass * deltaTime;

                // Calculate force components
                const forceX = (dx / distance) * force;
                const forceY = (dy / distance) * force;

                // Apply to velocity
                obj.velocityX += forceX;
                obj.velocityY += forceY;
            }
        }

        // Update position
        obj.x += obj.velocityX * deltaTime;
        obj.y += obj.velocityY * deltaTime;

        // Update rotation
        obj.rotation += obj.rotationSpeed * deltaTime;
    });
}

function checkCollisions() {
    // Check each object for collision with collection zone
    gameState.objects.forEach((obj, index) => {
        // Calculate distance to collection zone center
        const dx = obj.x - gameState.collectionZone.x;
        const dy = obj.y - gameState.collectionZone.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If object enters collection zone
        if (distance < gameState.collectionZone.radius + obj.size / 2) {
            // Handle based on object type
            if (obj.type === CONFIG.OBJECT_TYPE.TARGET) {
                // Target captured - increase score
                increaseScore();
                addCaptureEffect(obj.x, obj.y);
            } else {
                // Hazard collision - lose a life
                reduceLife();
                addHazardEffect();
            }

            // Remove the object
            gameState.objects.splice(index, 1);
        }
    });
}

function updateEffects(deltaTime) {
    // Update all visual effects
    gameState.effects = gameState.effects.filter(effect => {
        effect.lifetime -= deltaTime;
        return effect.lifetime > 0;
    });
}

function cleanupObjects() {
    // Remove objects that have left the screen without life penalty
    const buffer = CONFIG.PHYSICS.OFFSCREEN_BUFFER;

    gameState.objects = gameState.objects.filter(obj => {
        return !(obj.x < -buffer ||
            obj.x > canvas.width + buffer ||
            obj.y < -buffer ||
            obj.y > canvas.height + buffer);
    });
}

function increaseScore() {
    gameState.score += 10;
    scoreDisplay.textContent = gameState.score;
}

function reduceLife() {
    gameState.lives--;
    updateLivesDisplay();

    // Add screen shake effect
    startScreenShake();

    if (gameState.lives <= 0) {
        gameOver();
    }
}

function startScreenShake() {
    gameState.screenShake.active = true;
    gameState.screenShake.timeRemaining = CONFIG.VISUAL.SCREEN_SHAKE_DURATION;
    gameState.screenShake.intensity = CONFIG.VISUAL.SCREEN_SHAKE_INTENSITY;
}

function addCaptureEffect(x, y) {
    // Add capture flash effect
    gameState.effects.push({
        type: 'capture',
        x,
        y,
        radius: 30,
        lifetime: 0.5
    });
}

function addHazardEffect() {
    // Add hazard effect (collection zone flash)
    gameState.effects.push({
        type: 'hazard',
        lifetime: 0.3
    });
}

// Rendering functions
function render() {
    // Prepare canvas context
    ctx.save();

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply screen shake if active
    if (gameState.screenShake.active) {
        const intensity = gameState.screenShake.intensity *
            (gameState.screenShake.timeRemaining / CONFIG.VISUAL.SCREEN_SHAKE_DURATION);
        ctx.translate(
            Math.random() * intensity * 2 - intensity,
            Math.random() * intensity * 2 - intensity
        );
    }

    // Render based on current game state
    switch (gameState.state) {
        case CONFIG.GAME_STATE.INTRO:
            renderIntro();
            break;
        case CONFIG.GAME_STATE.PLAYING:
        case CONFIG.GAME_STATE.PAUSED:
            renderGame();
            break;
        case CONFIG.GAME_STATE.GAME_OVER:
            renderGame(); // Continue rendering the game in game over state
            break;
    }

    ctx.restore();
}

function renderIntro() {
    // Render collection zone
    renderCollectionZone();

    // Render objects with a slow-motion effect
    gameState.objects.forEach(obj => {
        renderObject(obj);
    });
}

function renderGame() {
    // Render collection zone
    renderCollectionZone();

    // Render all objects
    gameState.objects.forEach(obj => {
        renderObject(obj);
    });

    // Render gravity field if active
    if (gameState.gravityField.active) {
        renderGravityField();
    }

    // Render effects
    renderEffects();
}

function renderCollectionZone() {
    // Draw the planet (a simple white circle) at the center of the screen
    ctx.beginPath();
    ctx.arc(
        gameState.collectionZone.x,
        gameState.collectionZone.y,
        CONFIG.VISUAL.COLLECTION_ZONE_RADIUS,
        0,
        Math.PI * 2
    );

    // Fill with solid white
    ctx.fillStyle = CONFIG.VISUAL.COLLECTION_ZONE_COLOR;
    ctx.fill();

    // Add a white border for better definition
    ctx.strokeStyle = CONFIG.VISUAL.COLLECTION_ZONE_BORDER;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function renderGravityField() {
    // Draw ripple effect for gravity field
    const maxRipples = 3;
    const rippleDuration = 0.8; // seconds

    for (let i = 0; i < maxRipples; i++) {
        const rippleTime = (gameState.gravityField.pulseTime + i * (rippleDuration / maxRipples)) % rippleDuration;
        const rippleProgress = rippleTime / rippleDuration;

        if (rippleProgress < 1) {
            const rippleSize = 50 + rippleProgress * 100;
            const opacity = 0.4 * (1 - rippleProgress);

            ctx.beginPath();
            ctx.arc(
                gameState.gravityField.x,
                gameState.gravityField.y,
                rippleSize,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
        }
    }

    // Update ripple animation time
    gameState.gravityField.pulseTime += 1 / 60; // Approximate for animation timing
}

function renderObject(obj) {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.rotation);

    if (obj.type === CONFIG.OBJECT_TYPE.TARGET) {
        // Targets are white circles
        ctx.beginPath();
        ctx.arc(0, 0, obj.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = CONFIG.VISUAL.TARGET_COLOR; // Pure white
        ctx.fill();
    } else {
        // Hazards are gray polygons
        ctx.beginPath();
        ctx.moveTo(obj.vertices[0].x, obj.vertices[0].y);

        for (let i = 1; i < obj.vertices.length; i++) {
            ctx.lineTo(obj.vertices[i].x, obj.vertices[i].y);
        }

        ctx.closePath();
        ctx.fillStyle = CONFIG.VISUAL.HAZARD_COLOR; // Gray
        ctx.fill();
    }

    ctx.restore();
}

function renderEffects() {
    // Render all visual effects
    gameState.effects.forEach(effect => {
        if (effect.type === 'capture') {
            // Capture effect is a flash circle
            const opacity = effect.lifetime * 2; // Fade out

            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
        } else if (effect.type === 'hazard') {
            // Hazard effect is a flash of the collection zone
            const opacity = effect.lifetime * 3; // Fade out faster

            ctx.beginPath();
            ctx.arc(
                gameState.collectionZone.x,
                gameState.collectionZone.y,
                gameState.collectionZone.radius,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(120, 120, 120, ${opacity})`;
            ctx.fill();
        }
    });
}

// Error handling
function handleError(message, error) {
    console.error(message, error);
    gameState.state = CONFIG.GAME_STATE.ERROR;
    showErrorOverlay();
}

function showErrorOverlay() {
    errorOverlay.classList.remove('hidden');
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);