# Shape Shift

## Title, Genre, and Target Audience
- **Title**: Shape Shift  
- **Genre**: Endless Shape‑Matching Runner  
- **Target Audience**: Casual desktop gamers who enjoy quick‑reaction minimalist challenges.

## Gameplay Description
Shape Shift centers on a single core mechanic: the player controls a geometric avatar that continuously moves forward through a series of oncoming gates. Each gate silhouette has a specific shape (circle, square, triangle, hexagon) and only the matching avatar shape can pass through without collision. The game speeds up gradually, narrowing the window for correct shape alignment.  

- The avatar cycles through shapes in a fixed order using a single key (Spacebar).  
- Gates spawn at regular intervals on the right side and move left across the screen.  
- Passing through a correct gate increments the score by 1; colliding with a mismatched gate or missing a gate ends the game.  
- Difficulty progression: over time, gate speed increases and spawn frequency rises, creating an escalating challenge curve.

## Visual Style Specifications
- **Color Palette**:  
  - Background: pure black (`#000000`)  
  - Foreground shapes: white (`#FFFFFF`)  
  - Grayscale accents for gate outlines and transition effects  
- **Shapes**: drawn programmatically on Canvas—no image assets.  
- **UI Elements**:  
  - Score (numeric) in top‑right corner  
  - Lives indicator (dots) top‑left (3 lives to start)  
  - Help button (“?”) bottom‑right, toggles instructions panel  

## Controls
- **Input Method**: Keyboard only  
  - **Spacebar**: cycle to the next shape  
  - **Escape**: pause/resume  
  - **Q**: return to hub  

## Technical Approach
- **Rendering**: HTML5 Canvas for game area and shape drawing.  
- **Animation**: `requestAnimationFrame` driving game loop, smooth ease‑in‑out transitions for shape changes and gate movement.  
- **State Management**: simple finite state machine (`intro`, `playing`, `paused`, `gameover`, `error`).  
- **Timing**: fixed timestep for gate spawn logic; delta‑time for movement.  
- **Persistence**: high score stored in `localStorage` under key `shapeShiftHighScore`.  

## Visual Feedback Guidelines
- Correct gate passage: subtle white glow around avatar.  
- Collision/game over: red full‑screen trembling error overlay if critical JS error; otherwise a game‑over screen showing final and high score.  
- Help panel: minimal text instructing goal and controls.
