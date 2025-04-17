**Commit Message Style (Conventional Commits)**:

- Use prefixes such as `feat`, `fix`, `style`, `refactor`, `docs`, or `chore`.
- Scopes include the individual game name (e.g. for changes related to snake game, `feat(snake): add particles`).
- Do not specify a scope when the commit is not related to a specific game or is related to the main landing page (e.g., `docs: add screenshot in readme`).


Examples:

```
feat([game]): implement new mechanic
fix([game]): resolve edge-case bug
style([game]): refine animation transitions
docs([main]): update landing page with new game
refactor([game]): optimize game loop
chore([ci]): update deployment configuration
docs: add project screenshots
feat: new style for game cards
```

**Keep the commit message title/subject line to 50 characters or less**
**It is really important the title capture the core diffs**