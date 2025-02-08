#8: Fix: Handle new cursor rules file
State: open
URL: https://github.com/eastlondoner/cursor-tools/pull/8

## Pull Request
**@atreib** opened this pull request on 2/8/2025, 4:26:48 PM

Following twitter thread, implements the logic to properly handle the new Project Rules standard from Cursor IDE.

- When fresh install, use new standard file (.cursor/rules/cursor-tool.mdc)
- When existing install:
  - If using **new** standard, keep using **new** standard
  - If using **legacy** standard, keep using **legacy** standard, but print message
  - If using **both**, keep using **new** standard, and print message

Source: https://x.com/EastlondonDev/status/1887915998700798320
Docs on Cursor: https://docs.cursor.com/context/rules-for-ai#project-rules-recommended

Branch: `fix/handle-new-cursor-rules-dir` → `main`
Commits: 3
Changed files: 7
+115 -47


No discussion comments yet.

---
Labels: None
