# Browser-Based Minimal Game Development Guidelines

These guidelines outline the process for creating simple, engaging browser-based games using only HTML, CSS, and JavaScript. Follow this structure to develop clean, well-documented games that require no external libraries or frameworks, with an emphasis on minimalism and core mechanics.

---

## Game Development Requirements

- Technologies:
  - HTML5 for structure
  - CSS3 for styling
  - Vanilla JavaScript (ES6+) for logic
  - No external libraries or frameworks

- File Structure:
  - `index.html` (game container and HTML elements)
  - `style.css` (game styling and animations)
  - `script.js` (game logic and mechanics)
  - `README.md` (game documentation)

---

## NEW: Minimalist Approach Priority

**Focus on creating minimal games with these principles:**

- Implement only one core mechanic and execute it well
- Keep the codebase small and maintainable (under 500 lines total)
- Avoid feature creep - do not add "nice-to-have" features
- Prioritize game feel and responsiveness over complexity
- Choose simple visual representations over complex graphics
- Include only essential UI elements
- Skip optional features like:
  - Complex scoring systems
  - Multiple levels (unless extremely simple)
  - Character customization
  - Settings menus
  - Tutorial screens (use simple in-game cues instead)
  - Elaborate animations (focus on functional animations)

**Examples of appropriate minimal games:**
- Simple clicker games with one interaction
- Basic matching puzzles
- Single-screen platformers with limited controls
- Memory games with minimal elements
- Reaction tests with clear feedback
- Simple drawing applications

**Complexity will only be scaled up when explicitly requested.**

---

## Development Process

1. **Game Concept Design:**
   - Choose a game concept that's feasible with browser technologies
   - Prioritize games with simple mechanics but engaging gameplay
   - Focus on simplicity and fun rather than complexity
   - Consider performance limitations of browser environments
   - Focus on one core gameplay mechanic and execute it well

2. **Game Design Document (GDD):**
   - Title: Descriptive and engaging name
   - Genre: Clear classification (puzzle, arcade, platformer, etc.)
   - Target Audience: Age range and player experience level
   - Gameplay Description: Core loop and mechanics
   - Visual Style: Color scheme, art style, UI elements
   - Controls: Input methods and response handling
   - Win/Loss Conditions: Clear objectives and failure states
   - Technical Approach: Canvas vs. DOM, animation techniques, state management

3. **Implementation Best Practices:**
   - Separate concerns (HTML for structure, CSS for presentation, JS for behavior)
   - Use requestAnimationFrame for smooth animations
   - Implement responsive design for different screen sizes
   - Optimize for performance (minimize DOM manipulations, use efficient algorithms)
   - Structure code with clear functions and meaningful variable names
   - Implement proper state management patterns

4. **Testing Requirements:**
   - Test just for Chrome
   - Focus on desktop environments (large screens, mouse and keyboard input)
   - Use manual testing for all game features
   - Test for performance issues with longer gameplay sessions
   - Validate win/loss conditions function correctly

---

## Code Quality Standards

- **HTML:**
  - Semantic markup
  - Proper document structure
  - Accessibility considerations (ARIA attributes where needed)

- **CSS:**
  - Logical organization of rules
  - Use of CSS variables for theming
  - Clear class naming conventions
  - Responsive design principles

- **JavaScript:**
  - Functional programming approach preferred
  - Consistent coding style
  - Comprehensive error handling
  - Clear comments for complex logic
  - Modular function design
  - Proper event handling and cleanup
  - Choose appropriate storage mechanism (localStorage, sessionStorage) based on game needs

---

## Deliverables

1. Complete GDD in markdown format
2. Clean, commented source code in HTML, CSS, and JavaScript
3. Playable game that runs directly in the browser (will be deployed by GitHub action on GitHub pages)

---

## Constraints

- No build steps or transpilation
- No external dependencies or CDN resources
- Single HTML, CSS, and JS file only
- No server-side components or backend dependencies. It must works as static site.
- For game assets (images, sounds), request them from the repository owner
- Choose rendering approach (Canvas or DOM) based on what's best for the specific game

---

## Repository Structure

For a collection of games maintained in a single repository, follow this structure:

```
├── games
│   └── snake
│       ├── assets
│       │   ├── image1.png
│       │   └── sound1.mp3
│       ├── game.js
│       ├── index.html
│       ├── README.md
│       └── style.css
├── index.html
├── LICENSE
├── README.md
├── script.js
└── style.css
```

- **Root Directory**:
  - `index.html`: Main landing page that links to all games
  - `style.css`: Styling for the landing page
  - `script.js`: Any JavaScript needed for the landing page
  - `README.md`: Project overview, setup instructions, and game catalog
  - `LICENSE`: Project license file

- **Games Directory**:
  - Each game has its own subfolder (e.g., `snake`)
  - Each game folder is completely self-contained with all necessary files
  - Game-specific files follow the pattern of:
    - `index.html`: Game container and HTML elements
    - `style.css`: Game-specific styling
    - `game.js`: Game logic and mechanics
    - `README.md`: Game design document and specific instructions
    - `assets/`: Directory for game-specific assets (images, sounds, etc.)
  - Keep all assets for a game within its own assets directory
  - Never share code between games - each game must be completely independent

This structure ensures modular development where each game is independent while maintaining a consistent organization across the repository.

---

## Git Workflow & Commit Standards

### Branch Management

- When working on a game:
  1. Create a new branch with the same name as the game (e.g., `snake`)
  2. Switch to that branch
  3. Write code and make changes
  4. Check status to see what files have changed
  5. Review changes before staging
  6. Stage changes
  7. Verify staged changes
  8. Commit changes following commit message style
  9. Push the branch to remote

**IMPORTANT:** NEVER COMMIT OR MERGE INTO MAIN. The repository owner will handle merges to the main branch.

**IMPORTANT** NEVER USE TERMINAL COMMANDS BUT USE GIT TOOLS (e.g. git_status, git_add, git_commit, ...)

Each game will have its own development branch, and when a new version is ready, it will be manually merged into main by the repository owner. For updates to existing games, continue using the same branch - do not create new branches for updates to the same game.

### Commit Message Style

Follow conventional commits with these guidelines:

1. Understand the git status of the repo before committing
2. Create atomic commits following best practices (one commit per logical change)
3. Use conventional commits style with standard types:
   - `feat`: New features
   - `fix`: Bug fixes
   - `style`: Style/formatting changes
   - `refactor`: Code refactoring
   - `docs`: Documentation updates
   - `chore`: Maintenance tasks

4. Use the following scopes to indicate which part of the project is affected:
   - `[type](ci)`: For files related to CI (usually files in .github/workflows)
   - `[type](main)`: For changes to root files (./index.html, ./style.css, ./script.js)
   - `[type]([game])`: For commits related to a specific game (e.g., `feat(snake): add collision detection`)

Examples of well-formatted commit messages:
```
feat(snake): implement game over screen
fix(snake): fix collision detection with walls
style(tetris): improve block colors and visibility
docs(main): update repository README with new game
refactor(snake): optimize game loop performance
chore(ci): update GitHub actions workflow
```

---

## Minimalist Game Development Process

### 1. Idea Generation & Evaluation (1 day)
- Brainstorm 2-3 minimal game concepts
- Evaluate ideas based on:
  - Technical simplicity (lower is better)
  - Single core mechanic focus
  - Feasibility to complete in a short timeframe
- Select one concept to pursue

### 2. Simplified Game Design Document (1 day)
- Create a concise GDD with:
  - Game Overview: title, one-paragraph summary
  - Core Mechanic: detailed explanation of the ONE gameplay loop
  - Controls: specific input method (keep it simple)
  - Visual Design: minimal color palette (3-4 colors maximum)
  - Technical Approach: Canvas vs. DOM
  - MVP Features: absolute minimum needed for playable game

### 3. Technical Implementation (2-3 days)
- Build minimal HTML structure
- Implement basic CSS for essential styling only
- Create JavaScript for:
  - Game initialization
  - Core game loop
  - Simple state management
  - Basic collision detection if needed
  - Input handling (keyboard OR mouse, not both unless necessary)

### 4. Testing & Refinement (1 day)
- Test core gameplay functionality
- Fix any critical bugs
- Add minimal polish:
  - Basic feedback for player actions
  - Simple win/loss indicators
  - Score display if needed

### 5. Documentation & Delivery (1 day)
- Complete README with brief game description and instructions
- Clean up code and ensure proper organization
- Create final commit with proper message

### 6. Submission & Integration (1 day)
- Commit the completed game using the commit instructions:
  1. Always use the git tool (never direct file uploads)
  2. Follow the commit message style guidelines
  3. Ensure all game files are committed to the appropriate game branch
- Add the new game to the main landing page:
  1. Update the ./script.js file to include your new game in the games catalog
  2. Commit this change to the same game branch (NOT to main)
  3. Use an appropriate commit message (e.g., `feat(main): add [game] to landing page`)

## Critical Checkpoints

1. **Pre-Implementation Checkpoint**
   - Minimal GDD completed
   - Technical approach decided

2. **Core Mechanic Checkpoint**
   - Single gameplay mechanic functioning

3. **Delivery Checkpoint**
   - Game is playable and bug-free
   - Code is clean and minimal
   - Documentation complete

4. **Integration Checkpoint**
   - Game committed to its branch
   - Landing page updated to include the new game
   - All changes pushed to remote repository