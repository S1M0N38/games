# Mirror Dash

## Game Design Document (GDD)

**Title:** Mirror Dash  
**Genre:** Endless minimalist reflex/dodging game  
**Target Audience:** Desktop players who enjoy fast-paced, skill-based endless games with a unique twist.

---

### Gameplay Description

- **Core Mechanic:**  
  Control a white square at the bottom of the screen using left/right arrow keys (or A/D).  
  A mirrored "shadow" square moves in the opposite direction at the top of the screen.  
  Obstacles (rectangles) fall from the top and rise from the bottom.  
  The player must dodge obstacles with both the main and mirrored square simultaneously—if either collides, a life is lost.

- **Endless Progression:**  
  The speed and frequency of obstacles increase over time, making the game progressively harder.

- **Lives:**  
  The player starts with 3 lives. Losing all lives ends the game.

- **Scoring:**  
  Score increases by 1 for each obstacle successfully passed (i.e., every time both squares survive a new wave).

---

### Visual Style

- **Palette:**  
  Strictly black background, white and grayscale for all elements.  
  Red (#FF0000) is used only for error/life loss feedback (player square flashes red).

- **Graphics:**  
  All shapes are geometric (squares, rectangles), drawn with Canvas.  
  No images or icons except for the "?" help button.

- **UI Elements:**  
  - Score: Top-right (number only).
  - Lives: Top-left (dots/circles).
  - Help button ("?"): Bottom-right.
  - Help panel: Minimal, appears on "?" click.

---

### Controls

- **Input Mode:** Keyboard only (left/right arrows or A/D).
- **Pause:** Escape key.
- **Quit:** Q key.

---

### Technical Approach

- **Rendering:** Canvas API for all game elements and animations.
- **Animation:** All movement and transitions use requestAnimationFrame and ease-in-out timing.
- **State Management:** Simple state machine for intro, playing, paused, game over, error.
- **Persistence:** High score stored in localStorage.

---

### Visual Feedback

- **Life Loss:**  
  Player square flashes red briefly.  
  After losing a life, both squares blink (white/transparent) for 2 seconds (invincibility period).

- **Error Handling:**  
  On critical error, show full-screen red overlay with warning icon (no text).

---

### Difficulty Progression

- Obstacles spawn more frequently and move faster as the score increases.
- The mirrored control mechanic ensures increasing cognitive challenge.

---

### Compliance

- No in-game text except numbers, "?" button, and help panel.
- No external assets, no build steps, no mobile/touch support.
- Fully self-contained in its own folder.

---

## Game Instructions

- Move both squares using left/right arrows or A/D.
- Avoid all obstacles.
- Survive as long as possible to achieve a high score.
- Press "?" for help, ESC to pause, Q to quit.