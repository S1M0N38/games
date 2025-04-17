# Orbit Dodge - Game Design Document

## 1. Title

Orbit Dodge

## 2. Genre

Endless Arcade Dodger

## 3. Target Audience

Players looking for a simple, fast-paced, minimalist reaction game for desktop browsers.

## 4. Gameplay Description

### Core Mechanic

The player controls a small white circle orbiting a central point on a black background. The core mechanic is switching the direction of the orbit (clockwise/counter-clockwise) with a single mouse click.

### Gameplay Loop

-   Obstacles (small gray squares) continuously spawn from the edges of the screen and move towards the center orbit path.
-   The player must click the mouse to change the orbit direction of their circle to avoid colliding with the incoming obstacles.
-   Successfully avoiding an obstacle increases the score.
-   Colliding with an obstacle results in losing a life.
-   The game ends when the player runs out of lives.

### Difficulty Progression

-   The speed of the incoming obstacles gradually increases over time.
-   The frequency of obstacle spawns gradually increases over time.
-   The player's orbital speed remains constant.

### Goal

Survive as long as possible, achieving the highest score by dodging obstacles.

## 5. Visual Style

-   **Palette**: Strictly black (`#000000`) background, white (`#FFFFFF`) for the player circle and orbit path, grayscale (`#999999`) for obstacles. Red (`#FF0000`) is used only for the critical error overlay.
-   **Graphics**: Minimalist geometric shapes drawn using the Canvas API. No images or complex sprites.
    -   Player: Small white filled circle.
    -   Orbit Path: Thin white dashed circle.
    -   Obstacles: Small gray filled squares.
-   **UI**:
    -   Score: Top-right (white numbers).
    -   Lives: Top-left (white dots).
    -   Help Button ('?'): Bottom-right.
    -   Help Panel: Standard overlay describing goal and controls.
    -   Pause Overlay: Standard overlay.
    -   Game Over Overlay: Standard overlay showing final score and high score.
    -   Error Overlay: Standard red overlay with icon.
-   **Animation**: Smooth `ease-in-out` transitions for UI elements (help panel, overlays). Player movement along the orbit is continuous. Obstacle movement is linear.

## 6. Controls

-   **Input Method**: Mouse only.
-   **Mouse Click**: Switch the player's orbit direction (clockwise/counter-clockwise).
-   **Escape Key**: Pause/Resume the game.
-   **'Q' Key**: Quit the game and return to the landing page.

## 7. Technical Approach

-   **Rendering**: HTML5 Canvas 2D API for drawing the game elements (player, orbit, obstacles).
-   **Structure**: Standard `index.html`, `style.css`, `game.js`.
-   **State Management**: Simple state variables managed within the `game.js` module (e.g., `gameState.playerAngle`, `gameState.orbitDirection`, `gameState.obstacles`). A formal state machine might be overkill for this simplicity.
-   **Animation**: `requestAnimationFrame` for the main game loop. CSS transitions for UI overlays.
-   **Physics**: Basic trigonometry for player orbital movement. Linear movement for obstacles. Simple circle-rectangle collision detection.
-   **Persistence**: `localStorage` for storing the high score.

## 8. Visual Feedback

-   Player movement clearly shows the current orbit direction.
-   Losing a life is indicated by the removal of a life dot in the top-left corner.
-   Game over state is clearly indicated by the game over overlay.
-   Error state uses the standard red overlay.

## 9. Game Instructions (for Help Panel)

-   **Goal**: Dodge the incoming gray squares by switching your orbit direction.
-   **Controls**:
    -   `Mouse Click`: Change orbit direction.
    -   `ESC`: Pause / Resume game.
    -   `Q`: Quit to game hub.
