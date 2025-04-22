# Gap Hop

## Title, Genre, and Target Audience
- **Title:** Gap Hop  
- **Genre:** Endless Runner  
- **Target Audience:** Casual desktop gamers looking for a quick reflex challenge.

## Core Mechanic and Gameplay Loop
Press the Spacebar to make the character jump over incoming spikes in an endless runner format, running on a horizontal ground line centered vertically. Spikes spawn from the right and travel to the left along this midline. The game naturally increases difficulty by ramping up spawn frequency and obstacle speed over time. The goal is to survive as long as possible without colliding with a spike.

## Difficulty Progression
- **Time-Based Acceleration:** Every 15 seconds, obstacle speed increases by 10%.
- **Spawn Rate:** Initial spawn interval of 1.2 seconds, decreasing by 10% every 10 seconds.

## Visual Style Specifications
- **Background:** Pure black (`#000000`).  
- **Elements:** White character and spikes (variations of grayscale for hierarchy).  
- **Error Feedback:** Red (`#FF0000`) flash on character when life is lost; full-screen red overlay for critical errors.  
- **Typography:** Only numeric score display and help “?” icon; no other text in gameplay.

## Controls (Keyboard Only)
- **Spacebar:** Jump  
- **Escape:** Pause / Resume  
- **Q:** Exit to games hub

## Technical Approach
- **Rendering:** `<canvas>` element for all game visuals.  
- **Animation Loop:** `requestAnimationFrame` with fixed timestep for consistent physics.  
- **State Management:** Finite state machine: Intro → Playing → Paused → Game Over → Error.  
- **Input Handling:** Keyboard events for jump, pause, and exit.  
- **Data Persistence:** High score saved to `localStorage` under key `gapHopHighScore`.

## Visual Feedback Guidelines
- **Life Loss:** Character flashes red for 200 ms on losing a life, then becomes invincible for 2 seconds and blinks during invincibility.
- **Error Handling:** On any unhandled exception, display a full-screen red overlay with trembling border and warning icon (no text).
