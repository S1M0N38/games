### Development Process

1. **Game Concept Design**:

   - Choose a concept that is technically feasible with browser-only technologies.
   - Focus on a single, well-defined core mechanic to create an engaging endless gameplay loop.
   - Design a progression system that gradually increases difficulty based on time, score, or other player metrics.
   - Decide in advance which input mode (mouse OR keyboard) will be used.

2. **Game Design Document (GDD)**:
   - Include in the README.md:
     - Title, genre, and target audience.
     - Detailed gameplay description focusing on the one core mechanic and how difficulty progresses over time.
     - Visual style specifications (black/white/grayscale with red only for errors).
     - Controls (mouse OR keyboard only).
     - Technical approach (Canvas vs. DOM, animation techniques, state management).
     - Visual feedback guidelines.
     
3. **Implementation Best Practices**:
   - Separate concerns: HTML for structure, CSS for presentation, JavaScript for behavior.
   - Use `requestAnimationFrame` for all animations to ensure smooth performance.
   - Emphasize code modularity, clear state management, and proper event cleanup.
   - Maintain a strict code size: aim for fewer than 500 lines, with an absolute maximum of 2000 lines per JavaScript file.
   - No in-game text—communicate solely via visuals (icons, shapes, motion).

4. **Testing Requirements**:
   - Testing should be carried out on Chrome, in desktop environments only (mouse input only).
   - Manual testing across long gameplay sessions to ensure performance stability.
   - Verify that all interactive elements and fail/win state behaviors (e.g., the red error overlay) function as intended.

---

### Code Quality Standards

- **HTML**:

  - Use semantic markup and accessible structure where necessary (ARIA only if needed).
  - The HTML must remain lean and free of unnecessary bloat.

- **CSS**:

  - Use CSS variables for consistent styling.
  - Follow a logical and consistent class naming scheme.
  - Ensure a responsive full-screen layout.
  - All animations and transitions must adhere to an ease-in-out standard.

- **JavaScript**:
  - Adopt a functional programming approach where possible.
  - Use state machine pattern for game state management when appropriate, with exceptions based on specific game requirements.
  - Use fixed timestep for timing-sensitive games to ensure consistent physics/behavior.
  - Ensure comprehensive error handling, including the standardized red error overlay.
  - Use localStorage sparingly, only for essential data persistence (e.g., high scores).

---

### Deliverables

1. **README.md**

   - Must include the complete in-line GDD and game instructions.

2. **Game Folder Structure**:
   Each game must be fully self-contained:

   - `index.html`: Game container and HTML structure.
   - `style.css`: Game-specific styling.
   - `game.js`: Game logic and mechanics.
   - `game.json`: Game metadata.
   - `README.md`: Contains the integrated GDD with all game specifications.

3. The game must run directly in the browser without any build or server-side processes.

---

### Constraints

- **No Build Steps or External Resources**:
  - No transpilation, bundling, or external CDNs.
  - The entire project must work as a pure static site using HTML, CSS, and JavaScript.
- **Rendering Approach**:
  - Either Canvas or DOM may be used based on the game's requirements.
- **Self-Containment**:
  - Each game must be completely independent with no code sharing between them.
- **No External Assets**:
  - Draw all game elements using code rather than using image or audio files.
- **No Text in the Game**:
  - Communication and instructions must rely solely on icons, shapes, animations, and subtle visual cues.

---

### Repository Structure

```
├── games
│   ├── game1
│   │   ├── game.js
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── game.json
│   │   └── README.md (includes integrated GDD)
│   ├── game2
│   └── ...
├── index.html         (Landing page hub)
├── style.css          (Styling for the landing page)
├── script.js          (Interactivity for the landing hub)
├── README.md          (Project overview and general documentation)
└── LICENSE
```

- The root landing page serves as the navigation hub, hosting up to 10 game panels.
- Each game is isolated in its own folder.

---

### Game Template

An example template for a game folder structure is as follows:

- [game.js](../../games/_example/game.js)
- [index.html](../../games/_example/index.html)
- [style.css](../../games/_example/style.css)
- [game.json](../../games/_example/game.json)

---

### Minimalist Game Development Process

1. **Idea Generation (1 day)**:

   - Brainstorm 2–3 concepts for endless gameplay experiences.
   - Select the idea that best satisfies simplicity, clarity, a singular input method (either keyboard or mouse), strong animation potential, and an elegant difficulty progression.
   - Consider classic endless games for inspiration: Snake, Tetris, Asteroids, Flappy Bird, etc.
   - Do not repeat existing games listed in the [README.md](../../README.md) of the repository.

2. **Game Design Document (GDD) (1 day)**:

   - Write the GDD in the README.md.
   - Focus on a single core mechanic, its infinite loop, difficulty progression curve, and strict visual style.
   - Define how the game will become progressively more challenging (increased speed, more obstacles, reduced reaction time, etc.).

3. **Implementation (2–3 days)**:

   - Choose the appropriate rendering approach (Canvas preferred) and build the essential HTML/CSS/JS scaffold.
   - Develop the game loop, input handling (single mode), state management, and integrate smooth animations effects.

4. **Testing & Refinement (1 day)**:

   - Verify the game's smooth performance and responsiveness.
   - Test that all visual feedback works correctly, including the red error overlay in case of failure.
   - Confirm that no text appears anywhere in the game; all instructions are conveyed visually.

5. **Documentation & Delivery (1 day)**:

   - Clean up code and ensure it adheres to style guidelines.
   - Include the full GDD in the README.md.

6. **Create Metadata File (Final Step)**:
   - Create the `game.json` file.
   - Populate it with the game's `id` (unique identifier, e.g., "my-cool-game"), `title` (display name), `description` (short summary), `inputType` (must be exactly "keyboard" or "mouse"), and `storageKey` (unique key for localStorage high score, e.g., "myCoolGameHighScore").
   - Create a `fallbackImage`: This is a thumbnail preview for the game hub. Use an SVG data URI for this. The SVG should be simple, represent the game visually using only black, white, and grayscale, and adhere to the overall minimalist aesthetic.
    Example for `game.json`:
    - [orbit-dodge](../../games/orbit-dodge/game.json)
    - [reaction-dots](../../games/reaction-dots/game.json)
    - [gravity-field](../../games/gravity-field/game.json)

---

### Animation Enhancement Guidelines

1. **Purpose-Driven Animation**:

   - Every animation must directly communicate a state change or reinforce a game mechanic.
   - Use motion to provide immediate visual feedback during interactions.

2. **Types of Animation Required**:

   - Transitions between states (e.g., from menu to game, pause states).
   - Interactive feedback animations for player input.
   - Collision or impact effects.
   - Timing cues and rhythm indicators.

3. **Implementation Techniques**:

   - Choose the appropriate animation technology (CSS or Canvas) based on specific requirements.
   - Prefer CSS animations for most use cases, starting with simple animations.
   - All animations must use `ease-in-out` timing.
   - Balance animation complexity - avoid overly complex animations while ensuring they're not too basic.
   - Opacity variations are allowed to create depth and visual hierarchy.

4. **Performance Considerations**:
   - Target 60 FPS as a development goal.
   - Use `requestAnimationFrame` for all time-sensitive animations.
   - Favor transform and opacity changes for DOM animations to leverage hardware acceleration.

---

### Error Handling

- All games must implement a basic error handling mechanism:
- If a critical JavaScript error occurs, a simple red full-screen overlay should appear.
- The error overlay includes a basic warning icon - avoid complex animations for error states.

---

**Final Notes**

This comprehensive document defines a highly disciplined, minimalist approach to browser-based game development. Every element—from the singular focus on one gameplay mechanic within an endless structure, to the wordless, icon-driven communication and animations—must align to create a unified, immersive desktop experience. The guidelines ensure that from the individual game code to the landing hub interface, every component is coherent, clean, and purpose-driven.