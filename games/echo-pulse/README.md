# Echo Pulse

## Game Design Document

### Game Concept
Echo Pulse is a minimalist rhythm game where players must press the spacebar at the exact moment when an expanding pulse ring aligns with a fixed target ring. The game focuses on timing precision and gradually increases in difficulty as the player progresses.

### Game Overview
- **Title**: Echo Pulse
- **Genre**: Rhythm/Timing
- **Target Audience**: Casual players who enjoy rhythm-based challenges

### Gameplay Description
Players see a central point on screen that emits expanding pulse rings at regular intervals. Surrounding this central emitter is a stationary target ring. The player must press the spacebar exactly when a pulse ring aligns with the target ring, scoring points for precision.

The core mechanic revolves around timing precision:
- A successful hit (within the timing window) yields 1 point.
- Near misses (slightly outside the window) still count as a hit and yield 1 point. <!-- Updated -->
- Complete misses yield no points and result in losing a life. <!-- Updated -->
- There is no combo multiplier system. <!-- Updated -->

As the game progresses, difficulty increases in several ways:
- Pulse rings expand at varying speeds (speed increases over time). <!-- Updated -->
- The rhythm pattern becomes more complex (interval between pulses varies). <!-- Updated -->
- The timing window for successful hits becomes narrower.

### Visual Style
The game adheres to a strict black-and-white aesthetic with grayscale variations:
- Background: Pure black
- Pulse rings: White with decreasing opacity as they expand
- Target ring: Light gray, brightening to white when hit successfully
- Score and combo indicators: White
- Feedback animations: Gray to white pulses for hits, brief red flash for misses

### Controls
Input is keyboard-only, using the following keys:
- SPACEBAR: Hit the target ring when a pulse aligns with it
- ESC: Pause/Resume game
- Q: Return to games hub

### Technical Approach
- **Rendering**: Canvas-based rendering for smooth circular animations
- **Animation**: Use of `requestAnimationFrame` for the game loop and smooth pulse animations
- **State Management**: State machine pattern for managing game states (ready, playing, game over) <!-- Removed intro -->
- **Visual Feedback**:
  - Subtle glow effects when targets are hit
  - Opacity changes for feedback
  - Minimal particle effects for successful hits

### Progression System
The difficulty progression occurs naturally over time:
1. Game starts with simple, regular pulses and forgiving timing windows
2. Speed gradually increases
3. Pulse patterns become irregular (varying intervals) <!-- Updated -->
4. Timing windows become stricter

The scoring system rewards consistency, with high scores stored locally. <!-- Updated -->
