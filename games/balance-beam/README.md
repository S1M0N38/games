# Balance Beam - Game Design Document

## Title, Genre, and Target Audience
**Title:** Balance Beam  
**Genre:** Precision/Balance Arcade Game  
**Target Audience:** Desktop users seeking a challenging, reflex-based game requiring focus and precision

## Gameplay Description
Balance Beam focuses on a single core mechanic: maintaining the equilibrium of a ball on a tilting beam. A white ball rests on a horizontal beam in the center of the screen. The player controls the beam's tilt angle using keyboard inputs, causing the ball to roll accordingly.

The game follows a minimalist approach with a pure physics-based challenge. Several elements create a demanding experience:

1. **Unstable Starting Position:** The beam begins in a random tilted position, requiring immediate player intervention.
2. **Random Disturbances:** Periodic wind gusts push the ball in random directions, simulated by subtle pulse effects.
3. **Increasing Sensitivity:** As time passes, the physics become increasingly sensitive, requiring more precise control inputs to maintain balance.

The game loop is endless, with players striving to keep the ball balanced for as long as possible to achieve the highest score. The game ends when the ball falls off either end of the beam.

## Visual Style
- **Color Palette:** Strictly black (#000000) background with white (#FFFFFF) and grayscale elements. Red (#FF0000) appears only for error feedback.
- **Graphics Approach:** All visual elements are created through code using simple geometric shapes (line for beam, circle for ball).
- **Visual Feedback:** Subtle pulse animations indicate wind disturbances affecting the ball.
- **UI Elements:**
  - Score counter: Top-right corner (numerical display only)
  - Help button ("?"): Bottom-right corner
  - Game area: Center of screen featuring the beam and ball
- **Help Panel:** Toggles on "?" button click, containing minimal text explaining the goal (keep the ball balanced) and commands (Left/Right to tilt, ESC to pause, Q to quit)

## Controls
- **Input Mode:** Keyboard-only
- **Interactions:**
  - Left Arrow key: Tilt beam left
  - Right Arrow key: Tilt beam right
  - ESC key: Pause/resume gameplay
  - Q key: Exit to landing page
- **No mouse controls** for actual gameplay mechanics

## Technical Approach
- **Rendering Method:** Canvas-based implementation for smooth physics simulation
- **Animation Techniques:**
  - requestAnimationFrame for continuous physics simulation
  - Simple rotation transformations for beam tilting
  - Ease-in-out transitions for all rotation movements
  - Subtle pulse animations for wind gusts
- **State Management:** Functional approach with clear state object tracking:
  - Game state (playing, paused, game over)
  - Score
  - Ball physics (position, velocity)
  - Beam position and angle
  - Wind gust timing and intensity
- **Data Persistence:** Local storage for high score only

## Visual Feedback Guidelines
- **Beam Animation:**
  - Smooth rotation animations with natural physics feel
  - White beam against black background for maximum contrast
- **Ball Movement:**
  - Natural physics-based rolling along the beam
  - Subtle acceleration/deceleration based on beam angle
  - Brief visual effects indicating wind disturbances
- **Game Over:** Visual feedback of ball falling off beam
- **Error Handling:** Red full-screen overlay with warning icon (no text) and trembling border if a critical error occurs

## Performance Considerations
- Fixed timestep physics calculations for consistent behavior
- Optimized canvas rendering with minimal redraws
- Efficient use of transformations for smooth animations
