## Git config

To perform git operation, use tools (git and github tools).

### Commit message style

1. understand the git status of the repo
2. create atomic commit following best practice. Use convential commits style with the following scopes:
    - `ci`: for files related to CI (usually files in .github/workflows)
    - `main`: for changes to ./index.html ./style.css ./script.js
    - `[game]`: for commit related to a specific game (e.g. `snake` for diff in games/snakes/* files)