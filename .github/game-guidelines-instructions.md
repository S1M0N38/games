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
  - `game.js`: Game logic and mechanics
  - `README.md`: Game documentation (including the full in-line Game Design Document)

---

### Minimalist Approach Priority

**Design and development must adhere to these strict principles:**

- **Core Mechanic**:

  - Implement only one core gameplay mechanic and execute it exceptionally well.
  - **Only endless games are acceptable** - no level-based games. Focus on games that naturally increase in difficulty over time (like Snake).
  - Prioritize simplicity, engagement, and progressive difficulty curves that challenge the player without explicit level structures.

- **Codebase and Feature Set**:
  - Keep the total code small and maintainable. Aim for fewer than 500 lines per file; JavaScript files must not exceed 2000 lines.
  - Avoid adding nonessential features – no complex scoring systems (simple counters/timers are allowed), no customization, settings menus, or tutorial screens. Keep games simple and intuitive.
- **Visual and Interaction Design**:

  - **Color Palette**:
    - Use strictly black (`#000000`), white (`#FFFFFF`), and grayscale accents.
    - The color red (`#FF0000`) is reserved exclusively for error feedback.
  - **Graphics Approach**:
    - Draw simple geometric figures with code instead of using image assets.
    - Focus on clean, minimal shapes and forms.
  - **Typography**:
    - No text is allowed in the game except for:
      - Numbers indicating scores, counters, or timers
      - The "?" help button symbol
      - Text within the help panel (which should only describe game goal and list commands)
    - All other communication must be via icons, shapes, and animations.
  - **Input**:
    - Only one input mode is permitted per game—either keyboard or mouse, never both.
    - For keyboard games, use traditional input schemas (arrow keys, WASD, spacebar, etc.).
    - Escape key should be reserved for pause/resume functionality in all games.
    - The "q" key should be used for exiting the game back to the landing page.
  - **Animations and Effects**:
    - All animations must use smooth, ease-in-out transitions.
    - Start with simple CSS animations for most needs and add complexity only when explicitly requested.
    - Use the appropriate technology (CSS or Canvas) based on what makes the most sense for the specific animation needs.
  - **Desktop-Only**:
    - The games are designed exclusively for desktop environments (no touchscreen or mobile optimization).

- **Data Persistence**:

  - Minimal data, such as high scores or basic game state (new/played), may be stored using localStorage.
  - Each game should support data clearing/resetting via a reset button in the main landing page.

- **Error Handling**:
  - In case of a critical game error (e.g., a JavaScript crash), a full-screen red error overlay must appear, employing a standard visual error state (red panel with a trembling border, accompanied by an iconographic warning, and no text).

---

### Visual Aesthetic Requirements

- **Background**: Pure black.
- **Foreground & Elements**:
  - Main elements are rendered in white with subtle variations of grayscale to denote hierarchy and depth.
  - All shapes must be clean, geometric, and minimal, drawn directly with code rather than using image assets.
- **UI Consistency**:
  - Standard UI elements must be positioned consistently across all games:
    - Score (numerical display): Top-right corner
    - Lives (represented by dots/circles): Top-left corner
    - Help button ("?" symbol): Bottom-right corner
  - The help button must toggle a minimal help panel that describes the game's goal and lists available commands
  - No tutorials, hints, or other UI elements beyond these three standard components
  - Maintain consistent style and positioning for all common game elements to create a unified collection aesthetic
- **Motion**:
  - Animations and transitions should be smooth and natural using only ease-in-out timing.
- **Layout**:
  - Full-screen immersive design that adapts to various desktop resolutions.
  - Minimal use of UI elements; any overlays must be integrated discreetly.