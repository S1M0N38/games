# Pendulum Pulse - Game Design Document

## Title, Genre, and Target Audience
**Title:** Pendulum Pulse  
**Genre:** Minimal Timing/Rhythm Arcade Game  
**Target Audience:** Desktop users seeking a challenging, precision-based game with simple mechanics

## Gameplay Description
Pendulum Pulse focuses on a single core mechanic: precise timing. A pendulum swings back and forth across the screen in a natural arc motion. Players must click at the exact moment when the pendulum crosses the center line. The closer to perfect timing, the more points awarded.

As the game progresses, the pendulum speed gradually increases, creating an escalating challenge. The game provides immediate visual feedback on timing accuracy through subtle animations and effects.

Players have three lives, losing one for each missed click or mistimed attempt. The game ends when all lives are lost, with the final score representing the player's timing precision.

## Visual Style
- **Color Palette:** Strictly black (`#000000`) background with white (`#FFFFFF`) and grayscale elements. Red (`#FF0000`) appears only for error feedback.
- **Graphics Approach:** All visual elements are created through code using simple geometric shapes (primarily lines, circles, and pulses).
- **UI Elements:**
  - Score counter: Top-right corner (numerical display only)
  - Lives indicator: Top-left corner (represented by white dots/circles)
  - Help button ("?"): Bottom-right corner
  - Center line: Vertical line across the center of the screen
- **Help Panel:** Toggles on "?" button click, containing minimal text explaining the goal (click when pendulum crosses center) and commands (ESC to pause, Q to quit)

## Controls
- **Input Mode:** Mouse-only
- **Interactions:**
  - Left-click: Click when pendulum crosses center line
  - ESC key: Pause/resume gameplay
  - Q key: Exit to landing page
- **No keyboard controls** for actual gameplay mechanics

## Technical Approach
- **Rendering Method:** Canvas-based implementation to smoothly animate the pendulum
- **Animation Techniques:**
  - `requestAnimationFrame` for pendulum physics animation
  - Natural pendulum motion using mathematical formulas
  - Pulse and particle effects for timing feedback
  - All transitions with ease-in-out timing
- **State Management:** Functional approach with state object tracking:
  - Game state (playing, paused, game over)
  - Score
  - Lives remaining
  - Pendulum angle and velocity
  - Speed multiplier as difficulty increases
- **Data Persistence:** Local storage for high score only

## Visual Feedback Guidelines
- **Timing Feedback:**
  - Perfect timing: Strong pulse effect with particle explosion
  - Good timing: Medium pulse effect
  - Miss: Weak pulse effect and life reduction
- **Pendulum Animation:**
  - Natural swinging motion with subtle damping
  - Smooth, continuous movement using physics simulation
- **Life Loss:** Visual feedback through life indicator reduction
- **Game Over:** Simple fade to reveal final score
- **Error Handling:** Red full-screen overlay with warning icon (no text) and trembling border if a critical error occurs

## Performance Considerations
- Target 60 FPS with optimized canvas rendering
- Efficient physics calculations for consistent motion
- Proper cleanup of animation frames and event listeners