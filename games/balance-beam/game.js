// Balance Beam Game Logic
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CONSTANTS
    // ==========================================
    const GAME_CONFIG = {
        BEAM: {
            LENGTH: 200,
            THICKNESS: 4,
            MAX_ROTATION_ANGLE: Math.PI / 6, // 30 degrees
            ROTATION_SPEED: 0.05,
            INITIAL_ANGLE_RANGE: Math.PI / 12 // Random initial tilt up to 15 degrees
        },
        BALL: {
            RADIUS: 8
        },
        PHYSICS: {
            INITIAL_GRAVITY: 0.0015,
            FRICTION: 0.99,
            DIFFICULTY_INCREASE_RATE: 0.0001,
            WIND_GUST: {
                MIN_FORCE: 0.005,
                MAX_FORCE: 0.02,
                MIN_INTERVAL: 1000,
                MAX_INTERVAL: 5000,
                DURATION: 300,
                WARNING_TIME: 1000  // Time before gust hits when arrow appears (ms)
            }
        },
        SCORING: {
            POINTS_PER_SECOND: 10
        },
        STORAGE_KEY: 'balanceBeamHighScore'
    };

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const DOM = {
        canvas: document.getElementById('gameCanvas'),
        score: document.getElementById('score'),
        helpButton: document.getElementById('help-button'),
        helpPanel: document.getElementById('help-panel'),
        closeHelp: document.getElementById('close-help'),
        pauseOverlay: document.getElementById('pause-overlay'),
        gameOver: {
            overlay: document.getElementById('game-over'),
            finalScore: document.getElementById('final-score'),
            highScore: document.getElementById('high-score'),
            restartButton: document.getElementById('restart-button')
        },
        errorOverlay: document.getElementById('error-overlay')
    };

    const ctx = DOM.canvas.getContext('2d');
    const canvasWidth = DOM.canvas.width;
    const canvasHeight = DOM.canvas.height;

    // ==========================================
    // GAME STATE
    // ==========================================
    const state = {
        game: {
            isPlaying: false,
            isPaused: false,
            score: 0,
            highScore: 0,
            lastTimestamp: 0,
            gameTime: 0,
            currentGravity: GAME_CONFIG.PHYSICS.INITIAL_GRAVITY,
            timers: [],
            nextWindTime: 0,
            windActive: false,
            windForce: 0,
            windDuration: 0,
            windDirection: 0,       // Direction of next/current wind gust
            windWarningActive: false, // Whether wind warning is currently active
            windWarningTime: 0,      // Start time for the warning
            windWarningProgress: 0   // Progress of the warning animation (0-1)
        },
        beam: {
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            length: GAME_CONFIG.BEAM.LENGTH,
            thickness: GAME_CONFIG.BEAM.THICKNESS,
            angle: 0,
            targetAngle: 0,
            rotationSpeed: GAME_CONFIG.BEAM.ROTATION_SPEED
        },
        ball: {
            x: canvasWidth / 2,
            y: canvasHeight / 2 - GAME_CONFIG.BALL.RADIUS - GAME_CONFIG.BEAM.THICKNESS / 2,
            velocity: 0,
            radius: GAME_CONFIG.BALL.RADIUS,
            pulseAnimation: 0 // For visual feedback of wind gusts
        },
        input: {
            left: false,
            right: false
        }
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        try {
            loadSavedData();
            setupEventListeners();
            render(); // Initial render
        } catch (error) {
            handleError('Game initialization error:', error);
        }
    }

    function loadSavedData() {
        state.game.highScore = parseInt(localStorage.getItem(GAME_CONFIG.STORAGE_KEY)) || 0;
    }

    function setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // UI controls
        DOM.helpButton.addEventListener('click', toggleHelpPanel);
        DOM.closeHelp.addEventListener('click', toggleHelpPanel);
        DOM.gameOver.restartButton.addEventListener('click', startGame);

        // Error handling
        window.addEventListener('error', (event) => {
            handleError('Global error:', event.error);
        });
    }

    // ==========================================
    // INPUT HANDLING
    // ==========================================
    function handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowLeft':
                state.input.left = true;
                break;
            case 'ArrowRight':
                state.input.right = true;
                break;
            case 'Escape':
                togglePause();
                break;
            case 'q':
            case 'Q':
                navigateToLanding();
                break;
        }

        // Start game on first key press if not already playing
        if (!state.game.isPlaying && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            startGame();
        }
    }

    function handleKeyUp(event) {
        switch (event.key) {
            case 'ArrowLeft':
                state.input.left = false;
                break;
            case 'ArrowRight':
                state.input.right = false;
                break;
        }
    }

    // ==========================================
    // UI MANAGEMENT
    // ==========================================
    function toggleHelpPanel() {
        DOM.helpPanel.classList.toggle('hidden');
    }

    function togglePause() {
        if (!state.game.isPlaying) return;

        state.game.isPaused = !state.game.isPaused;
        DOM.pauseOverlay.classList.toggle('hidden', !state.game.isPaused);

        if (state.game.isPaused) {
            // Clear any animation frame
            state.game.timers.forEach(timer => clearTimeout(timer));
            state.game.timers = [];
        } else {
            // Resume game loop
            state.game.lastTimestamp = performance.now();
            requestAnimationFrame(gameLoop);
        }
    }

    function navigateToLanding() {
        window.location.href = '../../index.html';
    }

    function updateDisplays() {
        DOM.score.textContent = state.game.score;
    }

    function showGameOverScreen() {
        DOM.gameOver.finalScore.textContent = state.game.score;
        DOM.gameOver.highScore.textContent = `Best: ${state.game.highScore}`;
        DOM.gameOver.overlay.classList.remove('hidden');
    }

    function showErrorOverlay() {
        DOM.errorOverlay.classList.remove('hidden');
    }

    function handleError(message, error) {
        console.error(message, error);
        showErrorOverlay();
    }

    // ==========================================
    // GAME MANAGEMENT
    // ==========================================
    function startGame() {
        resetGame();

        // Hide overlays
        DOM.pauseOverlay.classList.add('hidden');
        DOM.gameOver.overlay.classList.add('hidden');

        // Set random initial beam angle to make it challenging from the start
        const randomSign = Math.random() > 0.5 ? 1 : -1;
        state.beam.angle = randomSign * (Math.random() * GAME_CONFIG.BEAM.INITIAL_ANGLE_RANGE);

        // Schedule first wind gust
        scheduleNextWindGust();

        // Start game loop
        state.game.isPlaying = true;
        state.game.lastTimestamp = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function resetGame() {
        // Reset game state
        state.game.isPlaying = false;
        state.game.isPaused = false;
        state.game.score = 0;
        state.game.gameTime = 0;
        state.game.currentGravity = GAME_CONFIG.PHYSICS.INITIAL_GRAVITY;
        state.game.timers = [];
        state.game.windActive = false;
        state.game.windForce = 0;
        state.game.windDuration = 0;
        state.game.windDirection = 0;
        state.game.windWarningActive = false;
        state.game.windWarningTime = 0;
        state.game.windWarningProgress = 0;

        // Reset beam state - angle will be set in startGame
        state.beam.targetAngle = 0;

        // Reset ball state
        state.ball.x = canvasWidth / 2;
        state.ball.y = canvasHeight / 2 - state.ball.radius - state.beam.thickness / 2;
        state.ball.velocity = 0;
        state.ball.pulseAnimation = 0;

        // Update UI
        updateDisplays();
    }

    function gameOver() {
        state.game.isPlaying = false;

        // Check for high score
        if (state.game.score > state.game.highScore) {
            state.game.highScore = state.game.score;
            localStorage.setItem(GAME_CONFIG.STORAGE_KEY, state.game.highScore);
        }

        showGameOverScreen();
    }

    // ==========================================
    // GAME LOOP
    // ==========================================
    function gameLoop(timestamp) {
        if (!state.game.isPlaying || state.game.isPaused) return;

        // Calculate delta time
        const deltaTime = timestamp - state.game.lastTimestamp;
        state.game.lastTimestamp = timestamp;

        try {
            update(deltaTime);
            render();
            requestAnimationFrame(gameLoop);
        } catch (error) {
            handleError('Game loop error:', error);
        }
    }

    // ==========================================
    // GAME UPDATES
    // ==========================================
    function update(deltaTime) {
        updateGameTimeAndScore(deltaTime);
        updateDifficulty();
        updateBeamAngle(deltaTime);
        updateWindEffect(deltaTime);
        updateBallPhysics(deltaTime);
        updateVisualEffects(deltaTime);
        checkGameOver();
        updateDisplays();
    }

    function updateGameTimeAndScore(deltaTime) {
        // Update game time and calculate score
        state.game.gameTime += deltaTime / 1000;
        state.game.score = Math.floor(state.game.gameTime * GAME_CONFIG.SCORING.POINTS_PER_SECOND);
    }

    function updateDifficulty() {
        // Gradually increase gravity over time
        state.game.currentGravity = GAME_CONFIG.PHYSICS.INITIAL_GRAVITY +
            (state.game.gameTime * GAME_CONFIG.PHYSICS.DIFFICULTY_INCREASE_RATE);
    }

    function updateBeamAngle(deltaTime) {
        // Calculate target angle based on keyboard input
        if (state.input.left && !state.input.right) {
            state.beam.targetAngle = -GAME_CONFIG.BEAM.MAX_ROTATION_ANGLE;
        } else if (state.input.right && !state.input.left) {
            state.beam.targetAngle = GAME_CONFIG.BEAM.MAX_ROTATION_ANGLE;
        } else {
            state.beam.targetAngle = 0;
        }

        // Smoothly interpolate to target angle (ease-in-out effect)
        const angleDistance = state.beam.targetAngle - state.beam.angle;
        state.beam.angle += angleDistance * state.beam.rotationSpeed * (deltaTime / 16.67); // Normalize to ~60fps
    }

    function scheduleNextWindGust() {
        if (!state.game.isPlaying) return;

        // Calculate next wind gust time
        const interval = GAME_CONFIG.PHYSICS.WIND_GUST.MIN_INTERVAL +
            Math.random() * (GAME_CONFIG.PHYSICS.WIND_GUST.MAX_INTERVAL -
                GAME_CONFIG.PHYSICS.WIND_GUST.MIN_INTERVAL);

        // Determine wind direction for the next gust
        const direction = Math.random() > 0.5 ? 1 : -1;
        state.game.windDirection = direction;

        // Schedule warning to appear before the gust
        const warningTime = interval - GAME_CONFIG.PHYSICS.WIND_GUST.WARNING_TIME;
        state.game.nextWindTime = performance.now() + interval;

        // Schedule the warning to appear
        if (warningTime > 0) {
            const warningTimer = setTimeout(() => {
                if (state.game.isPlaying && !state.game.isPaused) {
                    activateWindWarning();
                }
            }, warningTime);
            state.game.timers.push(warningTimer);
        }

        // Schedule the wind gust
        const timer = setTimeout(() => {
            if (state.game.isPlaying && !state.game.isPaused) {
                activateWindGust();
            }
        }, interval);

        state.game.timers.push(timer);
    }

    function activateWindWarning() {
        if (!state.game.isPlaying || state.game.isPaused) return;

        state.game.windWarningActive = true;
        state.game.windWarningTime = performance.now();
        state.game.windWarningProgress = 0;
    }

    function activateWindGust() {
        if (!state.game.isPlaying || state.game.isPaused) return;

        // Determine wind force (direction was already set in scheduleNextWindGust)
        const force = GAME_CONFIG.PHYSICS.WIND_GUST.MIN_FORCE +
            Math.random() * (GAME_CONFIG.PHYSICS.WIND_GUST.MAX_FORCE -
                GAME_CONFIG.PHYSICS.WIND_GUST.MIN_FORCE);

        state.game.windActive = true;
        state.game.windForce = state.game.windDirection * force;
        state.game.windDuration = GAME_CONFIG.PHYSICS.WIND_GUST.DURATION;
        state.game.windWarningActive = false;

        // Visual feedback - start pulse animation
        state.ball.pulseAnimation = 1;

        // Schedule end of wind gust
        const timer = setTimeout(() => {
            if (state.game.isPlaying) {
                state.game.windActive = false;
                state.game.windForce = 0;
                scheduleNextWindGust();
            }
        }, GAME_CONFIG.PHYSICS.WIND_GUST.DURATION);

        state.game.timers.push(timer);
    }

    function updateWindEffect(deltaTime) {
        // Update wind warning
        if (state.game.windWarningActive) {
            const elapsedTime = performance.now() - state.game.windWarningTime;
            state.game.windWarningProgress = Math.min(elapsedTime / GAME_CONFIG.PHYSICS.WIND_GUST.WARNING_TIME, 1);

            if (state.game.windWarningProgress >= 1) {
                state.game.windWarningActive = false;
            }
        }

        // Update active wind
        if (state.game.windActive) {
            // Apply wind force to ball
            state.ball.velocity += state.game.windForce * (deltaTime / 16.67);

            // Update wind duration
            state.game.windDuration -= deltaTime;
            if (state.game.windDuration <= 0) {
                state.game.windActive = false;
                state.game.windForce = 0;
            }
        } else if (state.game.isPlaying && performance.now() >= state.game.nextWindTime) {
            activateWindGust();
        }
    }

    function updateBallPhysics(deltaTime) {
        // Apply gravity based on beam angle
        state.ball.velocity += Math.sin(state.beam.angle) * state.game.currentGravity * deltaTime;

        // Apply friction
        state.ball.velocity *= GAME_CONFIG.PHYSICS.FRICTION;

        // Update ball position
        state.ball.x += state.ball.velocity * deltaTime;

        // Update ball's position on the beam
        updateBallPositionOnBeam();
    }

    function updateVisualEffects(deltaTime) {
        // Update pulse animation for wind effect
        if (state.ball.pulseAnimation > 0) {
            state.ball.pulseAnimation -= deltaTime / 300; // Fade over 300ms
            if (state.ball.pulseAnimation < 0) {
                state.ball.pulseAnimation = 0;
            }
        }
    }

    function updateBallPositionOnBeam() {
        // Calculate beam endpoints
        const { x: beamX, y: beamY, length, angle } = state.beam;
        const halfLength = length / 2;

        const leftEndX = beamX - Math.cos(angle) * halfLength;
        const leftEndY = beamY - Math.sin(angle) * halfLength;
        const rightEndX = beamX + Math.cos(angle) * halfLength;
        const rightEndY = beamY + Math.sin(angle) * halfLength;

        // Calculate beam position under the ball using linear interpolation
        const relativeX = (state.ball.x - leftEndX) / (rightEndX - leftEndX);

        if (relativeX >= 0 && relativeX <= 1) {
            // Ball is above the beam
            const beamY = leftEndY + relativeX * (rightEndY - leftEndY);
            state.ball.y = beamY - state.ball.radius - state.beam.thickness / 2;
        }
    }

    function checkGameOver() {
        const { x: beamX, angle, length } = state.beam;
        const halfLength = length / 2;

        // Calculate beam endpoints
        const leftEndX = beamX - Math.cos(angle) * halfLength;
        const rightEndX = beamX + Math.cos(angle) * halfLength;

        // Calculate how far along the beam the ball is
        const relativeX = (state.ball.x - leftEndX) / (rightEndX - leftEndX);

        // Check if ball is off the beam or outside canvas
        if (relativeX < 0 || relativeX > 1 || state.ball.x < 0 || state.ball.x > canvasWidth) {
            gameOver();
        }
    }

    // ==========================================
    // RENDERING
    // ==========================================
    function render() {
        clearCanvas();

        // Draw wind warning if active
        if (state.game.windWarningActive) {
            drawWindWarning();
        }

        drawBeam();
        drawBall();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    function drawBeam() {
        const { x, y, length, thickness, angle } = state.beam;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-length / 2, -thickness / 2, length, thickness);
        ctx.restore();
    }

    function drawBall() {
        const { x, y, radius, pulseAnimation } = state.ball;

        // Draw pulse effect if active
        if (pulseAnimation > 0) {
            const pulseRadius = radius + (5 * pulseAnimation);
            const alpha = pulseAnimation * 0.5;

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw the ball
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawWindWarning() {
        const { windDirection, windWarningProgress } = state.game;
        const { x, y } = state.ball;

        // Only draw the arrow when we're far enough into the warning period
        if (windWarningProgress > 0.2) {
            // Calculate arrow properties based on progress
            const arrowOpacity = Math.min(1, windWarningProgress * 1.5);
            const arrowSize = 6 + (windWarningProgress * 4); // Arrow grows as it approaches impact
            const arrowDistance = 30 - (windWarningProgress * 15); // Arrow moves closer to ball

            const arrowX = x - (windDirection * arrowDistance);
            const arrowY = y;

            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${arrowOpacity})`;

            // Draw arrow
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - (windDirection * arrowSize), arrowY - arrowSize);
            ctx.lineTo(arrowX - (windDirection * arrowSize), arrowY + arrowSize);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    // Initialize the game
    init();
});
