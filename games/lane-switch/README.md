# Lane Switcher

## Genre & Audience
Arcade/endless‐dodge. Desktop players seeking quick reflex tests.

## Core Mechanic
Three vertical lanes. A white player dot sits at the bottom. Press ←/→ to instantly switch lanes. Blocks fall from top; collide → lose life.

## Progression
- Blocks spawn every `spawnInterval` seconds.
- Every 15 s, fall speed and spawn rate increase by 10%.
- Score increments by +1 per successful dodge.

## Visual Style
- Canvas, pure black background.
- Main elements in white; hazards in dark gray.
- No text in‐game—only numeric score and lives.

## Controls
- ← / → : move left/right lanes
- ESC : pause/resume
- Q : return to hub

## Technical
- Canvas rendering.
- Fixed timestep loop via `requestAnimationFrame`.
- State machine: INTRO → PLAYING → PAUSED → GAME_OVER → ERROR.
- Keyboard input only.
- localStorage for high score.

## Animations & Feedback
- Smooth ease‐in‐out for lane switch (instant).
- Flash red full‐screen overlay on critical error.

## Deliverables
- index.html, style.css, game.js, game.json (this file).
