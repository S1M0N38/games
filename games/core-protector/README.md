# Core Protector - Game Design Document

## 1. Overview

-   **Title**: Core Protector
-   **Genre**: Action / Defense / Reflex
-   **Target Audience**: Casual players seeking a quick, minimalist reflex challenge.

## 2. Gameplay

-   **Core Mechanic**: Defend a central core from incoming projectiles using a shield that orbits the core.
-   **Goal**: Survive as long as possible by blocking projectiles. The game is endless.
-   **Progression**: Difficulty increases over time through faster projectile speeds and increased spawn rates.
-   **Controls**: Mouse only. The shield's angular position around the core mirrors the mouse cursor's angle relative to the screen center.
-   **Fail State**: The game ends when the core loses all its lives (hit by projectiles).

## 3. Visuals

-   **Style**: Minimalist, geometric.
-   **Color Palette**: Black background (`#000000`), white elements (`#FFFFFF`) for the core, shield, and projectiles. Grayscale accents (`#666666`, `#999999`) may be used for subtle effects (e.g., impact). Red (`#FF0000`) is strictly for the error overlay.
-   **Elements**:
    -   **Core**: A static white circle at the center of the screen.
    -   **Shield**: A white arc segment orbiting the core.
    -   **Projectiles**: Small white circles moving towards the core from the screen edges.
-   **Feedback**:
    -   Subtle visual effect (e.g., brief shield glow/thicken) on successful block.
    -   Core briefly flashes or changes color slightly upon taking damage.
    -   Projectiles disappear upon collision with the shield or core.
-   **UI**: Standard UI elements (Score top-right, Lives top-left, Help bottom-right) as defined in the global guidelines. No in-game text other than score/lives numbers and help panel content.

## 4. Technical Approach

-   **Rendering**: HTML5 Canvas 2D API.
-   **Animation**: `requestAnimationFrame` for the main game loop. CSS transitions for UI elements (overlays, help panel).
-   **State Management**: Simple state machine (e.g., INTRO, PLAYING, PAUSED, GAME_OVER, ERROR).
-   **Input**: Mouse movement (`mousemove`) to control the shield angle.
-   **Physics**: Basic linear motion for projectiles. Collision detection between projectiles and the shield arc / core circle.

## 5. Game Flow

1.  **Intro**: Brief visual indication (e.g., elements fading in).
2.  **Playing**: Player controls the shield via mouse. Projectiles spawn from edges and move towards the center. Score increases over time. Blocking projectiles prevents damage. Missing projectiles reduces lives. Difficulty ramps up.
3.  **Pause**: Game state freezes. A pause overlay is shown. Resumed via Escape key.
4.  **Game Over**: Triggered when lives reach zero. Game loop stops. Game over overlay displays final score and high score. Restart option available.
5.  **Error**: If a critical JS error occurs, the red error overlay is displayed.

## 6. Instructions (for Help Panel)

-   **Goal**: Protect the central core by blocking incoming projectiles with your shield.
-   **Controls**: Move your mouse around the screen to position the shield.
-   **Commands**:
    -   `ESC`: Pause / Resume game.
    -   `Q`: Return to games hub.
