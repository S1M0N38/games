**Browser-Based Minimal Game Development Guidelines**

These guidelines outline the process for creating simple, engaging browser-based games using only HTML, CSS, and JavaScript. They provide a clear, disciplined approach that emphasizes minimalism, a strict black-and-white (plus grayscale and red for error feedback) aesthetic, and a singular focus on one core mechanic per game.

---

### Game Development Requirements

- **Technologies**:
  - HTML5 for structure
  - CSS3 for styling
  - Vanilla JavaScript (ES6+) for logic
  - No external libraries or frameworks

- **File Structure**:
  - `index.html`: The game container and HTML elements
  - `style.css`: Game styling and animations
  - `script.js`: Game logic and mechanics
  - `README.md`: Game documentation (including the full in-line Game Design Document)

---

### Minimalist Approach Priority

**Design and development must adhere to these strict principles:**

- **Core Mechanic**:  
  - Implement only one core gameplay mechanic and execute it exceptionally well.
  - The game’s loop must be infinite or extremely long (e.g., an endless snake-like game), with no hard “game over” screens interrupting the experience.

- **Codebase and Feature Set**:
  - Keep the total code small and maintainable. Aim for fewer than 500 lines per file; JavaScript files must not exceed 2000 lines.
  - Avoid adding nonessential features – no scoring systems, levels, customization, settings menus, or tutorial screens unless integrated in a truly minimal way.
  
- **Visual and Interaction Design**:
  - **Color Palette**:  
    - Use strictly black (`#000000`), white (`#FFFFFF`), and grayscale accents.  
    - The color red (`#FF0000`) is reserved exclusively for error feedback.
  - **Typography**:  
    - No text is allowed anywhere in the game (UI, tutorials, feedback). All communication must be via icons, shapes, and animations.
  - **Input**:  
    - Only one input mode is permitted per game—either keyboard or mouse, never both.
  - **Animations and Effects**:
    - All animations must use smooth, ease-in-out transitions.
    - Rich, fluid animations are required to enhance the core mechanic.
    - Particle effects are a must, used to deliver visual feedback and rewards, integrated in a purpose-driven way.
  - **Audio**:
    - Minimal audio feedback is allowed. Sounds should be light, pleasing, and satisfying—never overwhelming.
  - **Desktop-Only**:
    - The games are designed exclusively for desktop environments (no touchscreen or mobile optimization).

- **Data Persistence**:
  - Minimal data, such as high scores or basic game state (new/played), may be stored using localStorage.

- **Error Handling**:
  - In case of a critical game error (e.g., a JavaScript crash), a full-screen red error overlay must appear, employing a standard visual error state (red panel with a trembling border, accompanied by an iconographic warning, and no text).

---

### Visual Aesthetic Requirements

- **Background**: Pure black.
- **Foreground & Elements**:  
  - Main elements are rendered in white with subtle variations of grayscale to denote hierarchy and depth.
  - All shapes must be clean, geometric, and minimal.
- **Motion**:
  - Animations and transitions should be smooth and natural using only ease-in-out timing.
  - Fluid, layered particle effects enhance the interaction feedback.
- **Layout**:
  - Full-screen immersive design that adapts to various desktop resolutions.
  - Minimal use of UI elements; any overlays (such as a subtle timer or state indicator) must be integrated discreetly.

---

### Development Process

1. **Game Concept Design**:
   - Choose a concept that is technically feasible with browser-only technologies.
   - Focus on a single, well-defined core mechanic to create an engaging gameplay loop.
   - Decide in advance which input mode (mouse OR keyboard) will be used.

2. **Game Design Document (GDD)**:
   - Include in the README.md:
     - Title, genre, and target audience.
     - Detailed gameplay description focusing on the one core mechanic.
     - Visual style specifications (black/white/grayscale with red only for errors).
     - Controls (mouse OR keyboard only).
     - Technical approach (Canvas vs. DOM, animation techniques, state management).
     - Animation plan that details the implementation of smooth ease-in-out transitions and robust particle systems.
     - Audio guidelines for minimal, pleasant sound feedback.
     
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
  - Adopt a modular and functional coding style.
  - Ensure comprehensive error handling, including the standardized red error overlay.
  - Optimize for performance: minimize DOM manipulations, employ object pooling for particles, and leverage `requestAnimationFrame`.
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
   - `README.md`: Contains the integrated GDD with all game specifications.
   - `assets/`: Folder for any game-specific assets like images or sounds.

3. The game must run directly in the browser without any build or server-side processes.

---

### Constraints

- **No Build Steps or External Resources**:
  - No transpilation, bundling, or external CDNs.
  - The entire project must work as a pure static site using HTML, CSS, and JavaScript.
  
- **Rendering Approach**:
  - Either Canvas or DOM may be used based on the game’s requirements.
  
- **Self-Containment**:
  - Each game must be completely independent with no code sharing between them.
  
- **Assets Management**:
  - All assets must be stored within the game’s own folder.
  
- **No Text in the Game**:
  - Communication and instructions must rely solely on icons, shapes, animations, and subtle visual cues.

---

### Repository Structure

```
├── games
│   ├── game1
│   │   ├── assets
│   │   ├── game.js
│   │   ├── index.html
│   │   ├── README.md (includes integrated GDD)
│   │   └── style.css
│   ├── game2
│   └── ... (up to a total of 10 games)
├── index.html         (Landing page hub)
├── style.css          (Styling for the landing page)
├── script.js          (Interactivity for the landing hub)
├── README.md          (Project overview and general documentation)
└── LICENSE
```

- The root landing page serves as the navigation hub, hosting up to 10 game panels.
- Each game is isolated in its own folder and branch (see Git Workflow).

---

### Git Workflow & Commit Standards

- **Branch Management**:
  - Create a separate branch for each game (named after the game, e.g., `snake`).
  - Never commit directly to the `main` branch.
  - Use Git UI tools exclusively; avoid terminal commands.

- **Commit Message Style (Conventional Commits)**:
  - Use prefixes such as `feat`, `fix`, `style`, `refactor`, `docs`, or `chore`.
  - Scopes include `main`, `ci`, or the individual game name (e.g., `feat(snake): add particles`).

Examples:
```
feat(game): implement new mechanic
fix(game): resolve edge-case bug
style(game): refine animation transitions
docs(main): update landing page with new game
refactor(game): optimize game loop
chore(ci): update deployment configuration
```

---

### Minimalist Game Development Process

1. **Idea Generation (1 day)**:
   - Brainstorm 2–3 concepts.
   - Select the idea that best satisfies simplicity, clarity, a singular input method (either keyboard or mouse), and strong animation potential.

2. **Game Design Document (GDD) (1 day)**:
   - Write the GDD in the README.md.
   - Focus on a single core mechanic, its infinite (or extremely long) loop, and strict visual style.

3. **Implementation (2–3 days)**:
   - Choose the appropriate rendering approach (Canvas preferred) and build the essential HTML/CSS/JS scaffold.
   - Develop the game loop, input handling (single mode), state management, and integrate smooth animations with particle effects.
   - Integrate minimal, pleasing audio feedback for critical interactions.

4. **Testing & Refinement (1 day)**:
   - Verify the game’s smooth performance and responsiveness.
   - Test that all visual feedback works correctly, including the red error overlay in case of failure.
   - Confirm that no text appears anywhere in the game; all instructions are conveyed visually.

5. **Documentation & Delivery (1 day)**:
   - Clean up code and ensure it adheres to style guidelines.
   - Include the full GDD in the README.md.
   - Finalize commits following the commit message guidelines.

6. **Submission & Integration (1 day)**:
   - Commit all game files to the game’s specific branch.
   - Update the landing hub (in `script.js`) to include the new game panel.
   - Use a commit message like `feat(main): add [game] to landing page`.

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
   - Particle effects for rewards or impact, layered to add depth.

3. **Implementation Techniques**:
   - Use CSS animations for UI elements and Canvas animations for in-game elements.
   - All animations must use `ease-in-out` timing.
   - Implement object pooling for particle systems to optimize performance.
   - Layer multiple animation effects (scale, opacity, translation) to create fluid, natural motion.

4. **Performance Considerations**:
   - Maintain a minimum of 60 FPS through careful optimization.
   - Use `requestAnimationFrame` for all time-sensitive animations.
   - Favor transform and opacity changes for DOM animations to leverage hardware acceleration.

---

### Error Handling

- All games must implement a generic error handling mechanism:
  - If a critical JavaScript error occurs, a red full-screen overlay must appear.
  - The error overlay includes a standard icon (e.g., a triangle with an exclamation mark) and a trembling border—all rendered without text.

---

### Game Hub Layout (Landing Page) – Interface Design

**Purpose:**  
Design a visually consistent, minimalist, and intuitive desktop interface to host 10 experimental web-based games. The page functions both as the visual gateway and the navigation hub.

**Design Principles:**  
- **Visual Language**:  
  - A high-contrast monochrome palette: pure black for the background, white with grayscale accents for game elements, and red strictly for error alerts.
  - No textual elements; all information is conveyed via icons, shapes, and animations.
- **Animation Style**:  
  - Smooth, minimal animations using only ease-in-out transitions.
  - Embedded particle effects in game panels emphasize interactivity.
- **Layout Overview**:  
  - Full-screen interface with a solid black background.
  - A grid layout (2 rows x 5 columns) displaying 10 game panels.
  - Each game panel is a clickable cell that displays a representative abstract icon and a looping micro-animation preview.
  - On hover, a panel slightly zooms in and starts its preview animation.
  - On click, a ripple or wave effect transitions the view and loads the game in full-screen mode.
- **States & Feedback**:  
  - **New Game**: Indicated by a pulsing white glow.
  - **Played Game**: Denoted by a static soft gray border.
  - **Error State**: If a game fails to load, the panel flashes a solid red overlay with a trembling border and a standardized error icon.
- **Interaction Constraints**:  
  - Interaction is based solely on mouse input; no keyboard or touch input is supported.
- **Technical Considerations**:  
  - The landing page (index.html) uses HTML/CSS/JS without external libraries.
  - It handles navigation to each game’s dedicated folder.
  - Game states (new/played) are stored via localStorage.
  
**File Structure for the Hub:**
```
/index.html        → Landing page hub
/style.css         → Styling for the landing page
/script.js         → Logic for panel animations and navigation
/games/            → Contains each game as a separate folder (game1, game2, …, game10)
```

---

**Final Notes**

This comprehensive document defines a highly disciplined, minimalist approach to browser-based game development. Every element—from the singular focus on one gameplay mechanic, to the wordless, icon-driven communication, and the robust particle effects and animations—must align to create a unified, immersive desktop experience. The guidelines ensure that from the individual game code to the landing hub interface, every component is coherent, clean, and purpose-driven.