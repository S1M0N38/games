# Browser-Based Game Development Guidelines

These guidelines outline the process for creating simple, engaging browser-based games using only HTML, CSS, and JavaScript. Follow this structure to develop clean, well-documented games that require no external libraries or frameworks.

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

- To perform git operations, use the provided Git tools (`git_status`, `git_diff_unstaged`, `git_diff_staged`, `git_diff`, `git_commit`, `git_add`, ...) rather than terminal commands
- When working on a game:
  1. Create a new branch with the same name as the game (e.g., `snake`)
  2. Switch to that branch using appropriate Git tools
  3. Write code and make changes
  4. Check status with `git_status` to see what files have changed
  5. Review changes with `git_diff_unstaged` before staging
  6. Stage changes with `git_add`
  7. Verify staged changes with `git_diff_staged`
  8. Commit changes with `git_commit` following commit message style
  9. Push the branch to remote

**IMPORTANT:** NEVER COMMIT OR MERGE INTO MAIN. The repository owner will handle merges to the main branch.

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

## Step-by-Step Game Development Process

### 1. Idea Generation & Evaluation (1-2 days)
- Brainstorm 3-5 game concepts that can be built with HTML/CSS/JavaScript
- For each idea, list core mechanics and technical feasibility
- Evaluate ideas based on:
  - Technical complexity (lower is better for prototyping)
  - Engagement factor (is it fun with minimal features?)
  - Scope (can it be completed in the timeframe?)
- Select one concept to pursue

### 2. Game Design Document Creation (1 day)
- Create a structured GDD with the following sections:
  - Game Overview: title, genre, one-paragraph summary
  - Core Mechanics: detailed explanation of gameplay loops
  - Controls: specific input methods and response behaviors
  - Visual Design: color palette, art style references, UI mockups
  - Technical Specifications: Canvas vs. DOM, state management approach
  - MVP Features: minimum features needed for a playable prototype
  - Stretch Goals: additional features if time permits
- Include basic sketches or wireframes of key game screens

### 3. Technical Planning (1 day)
- Define the game's technical architecture:
  - Game state structure (objects, properties, relationships)
  - Core functions and their responsibilities
  - Event handling approach
  - Animation and rendering strategy
- Create pseudocode for critical game mechanics
- Prepare HTML structure outline (key elements and containers)
- Define CSS approach (classes, variables, responsive strategy)

### 4. Core Mechanics Implementation (2-3 days)
- Build skeleton HTML structure
- Implement basic CSS for layout positioning
- Create JavaScript for:
  - Game initialization and setup
  - Core game loop with requestAnimationFrame
  - State management functions
  - Basic collision detection if needed
  - Input handling (keyboard, mouse, touch)
- Test core interactions without visual polish

### 5. Visual Implementation (1-2 days)
- Complete HTML structure with all game elements
- Implement full CSS styling:
  - Game container and layout
  - UI elements (menus, score displays, controls)
  - Game object appearances
  - Basic animations and transitions
- Add visual feedback for game states and interactions
- Implement responsive design adjustments

### 6. Game Logic Completion (2-3 days)
- Implement complete game cycle:
  - Start game/menu functionality
  - Win/loss condition checking
  - Score or progress tracking
  - Level progression if applicable
- Add sound effects triggers (if using)
- Implement any special mechanics unique to the game
- Complete all core gameplay interactions

### 7. Polishing & Refinement (1-2 days)
- Add juice (visual feedback that makes interactions satisfying):
  - Animation flourishes on important events
  - Transition effects between game states
  - Visual/audio feedback for player actions
- Improve performance:
  - Optimize animation and rendering
  - Reduce unnecessary calculations
  - Ensure smooth gameplay at target framerates
- Add final UI touches and quality-of-life features

### 8. Testing & Debugging (1 day)
- Systematically test all game features and interactions
- Verify game works across different screen sizes
- Check for edge cases in gameplay
- Fix all identified bugs and issues
- Test complete gameplay sessions multiple times
- Verify all win/loss conditions trigger correctly

### 9. Final Documentation & Delivery (1 day)
- Complete README with:
  - Game description and instructions
  - Development decisions and technical approach
  - Known issues or limitations
  - Future improvement possibilities
- Clean up code:
  - Remove console logs and debug code
  - Add final comments where needed
  - Ensure consistent formatting
- Ensure all files are properly organized in the repository
- Create final commit with proper message

## Critical Checkpoints

1. **Pre-Implementation Checkpoint**
   - Fully completed GDD
   - Technical plan with pseudocode for core mechanics
   - HTML/CSS/JS structure planned

2. **Core Mechanics Checkpoint**
   - Game is interactive with basic input handling
   - Core game loop is functioning
   - Basic collision or game rules implemented

3. **Gameplay Complete Checkpoint**
   - All game mechanics implemented
   - Win/loss conditions functioning
   - Game cycle (start→play→end) works completely

4. **Delivery Checkpoint**
   - All visual elements implemented
   - Bug-free gameplay
   - Complete documentation
   - Code is clean and commented