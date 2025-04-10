## Git config

To perform git operation, use tools (git and github tools).

### Commit message style

1. understand the git status of the repo
2. create atomic commit following best practice. Use convential commits style with standard `type` (e.g. `feat`, `fix`, `style`, `refactor`, `docs`, ...) with the following scopes:
    - `[type](ci)`: for files related to CI (usually files in .github/workflows)
    - `[type](main)`: for changes to ./index.html ./style.css ./script.js
    - `[type]([game])`: for commit related to a specific game (e.g. `snake` for diff in games/snakes/* files).