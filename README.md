# Git Worktree Guide

Git worktrees solve the common problem of needing to switch between multiple branches frequently without losing your current work. Imagine you're deep into developing a new feature, and suddenly a critical bug needs immediate attention on a different branch. Without worktrees, you'd have to stash or commit your unfinished changes, switch branches, fix the bug, switch back, and then unstash/revert. This context switching is time-consuming and error-prone.

## What is a Worktree?

A worktree is a linked working directory that allows you to have multiple branches of a single Git repository checked out *simultaneously*. Think of worktrees like having multiple desktops for your computer, each focused on a different task, but all accessing the same files. Each worktree has its own directory, but they all share the same `.git` repository data (history, objects, etc.).

This allows you to:
- Work on multiple features simultaneously
- Handle urgent hotfixes while keeping your current work intact
- Review and test code from different branches without disrupting your work
- Experiment with different approaches in parallel

## Common Commands

### Creating a Worktree
```bash
# Create a new worktree for an existing branch
git worktree add <path-to-new-worktree> <existing-branch-name>

# Example:
git worktree add ../feature-x develop  # Creates a worktree at ../feature-x based on the 'develop' branch

# Create a new worktree with a new branch (this creates the branch too)
git worktree add -b <new-branch-name> <path-to-new-worktree> [<start-point>]

# Example:
git worktree add -b my-new-feature ../my-feature-worktree  # Creates a new branch 'my-new-feature' and a worktree at ../my-feature-worktree

# You can optionally specify a start-point (like a branch or commit hash)
git worktree add -b hotfix-login ../hotfix main
```

### Managing Worktrees
```bash
# List all worktrees
git worktree list

# Example Output:
# /path/to/main/repo        0a1b2c3 [main]
# /path/to/feature-x        4d5e6f7 [feature-x]
# /path/to/hotfix          8g9h0i1 [bug-fix]

# Remove a worktree (this only removes the worktree directory, not the branch)
git worktree remove <path-to-worktree>

# Example:
git worktree remove ../feature-x

# Force removal if there are uncommitted changes
git worktree remove -f ../feature-x

# Move a worktree to a new location
git worktree move <path-to-worktree> <new-path-to-worktree>

# Example:
git worktree move ../feature-x ../../new-location/feature-x

# Clean up stale worktree entries
git worktree prune

# This removes entries from the worktree list that point to directories that no longer exist
```

## Best Practices

1. Create worktrees in a consistent location
   - Consider creating a `worktrees` directory at the root of your project
   - Example: `/path/to/project/worktrees/feature-x`

2. Use meaningful directory names that correspond to your branches
   - Good: `../worktrees/feature-login`
   - Avoid: `../worktrees/temp1`

3. Clean up worktrees when you're done with them
   - Always use `git worktree remove` instead of manually deleting directories
   - This ensures proper cleanup of Git's internal worktree metadata

4. Remember that worktrees share the same Git history
   - Changes (commits, branches) made in one worktree are immediately visible in all others
   - Pulling updates in one worktree will make them available to all worktrees

## Common Issues and Solutions

1. **Submodule Limitations**
   - Submodules require separate initialization in *each* worktree after creation
   - Run `git submodule update --init` in each new worktree that uses submodules

2. **Remote Branch Issues**
   - Bare repositories don't automatically fetch all remote branches
   - Add this to your Git config to fix fetch issues:
     ```
     [remote "origin"]
     fetch = +refs/heads/*:refs/remotes/origin/*
     ```

3. **Disk Space**
   - Each worktree creates a new working directory with its own copy of all files
   - The Git history is shared, so the `.git` directory is not duplicated

4. **Detached HEAD State**
   - Creating a worktree from a specific commit (instead of a branch) results in a detached HEAD
   - Always create worktrees from branches, or create a new branch with `-b` flag

5. **.git Location**
   - Main worktree: Has a regular `.git` directory
   - Linked worktrees: Have a `.git` file pointing to `.git/worktrees/<worktree-name>` in the main repository

## Example Workflow

1. **You're working on a feature in your main directory:**
   ```bash
   cd /path/to/your/main/repo
   git checkout -b feature-new-ui  # You're already on a feature branch
   # ... make some changes ...
   ```

2. **An urgent bug needs fixing:**
   ```bash
   # Create a worktree for the hotfix, based on the 'main' branch
   git worktree add ../hotfix-urgent-bug main
   cd ../hotfix-urgent-bug

   # Create a branch for the fix (best practice)
   git checkout -b fix-login-issue

   # ... fix the bug ...
   git add .
   git commit -m "Fix: Login issue causing 500 error"

   # Push the fix to the remote repository
   git push -u origin fix-login-issue

   # (Optional) Create a pull request for the fix
   ```

3. **Return to your feature work:**
   ```bash
   cd /path/to/your/main/repo
   # Continue working on your feature...
   ```

4. **Merge the hotfix (after it's been reviewed and approved):**
   ```bash
   # This can be done in any worktree, but let's do it in the main repo
   cd /path/to/your/main/repo
   git checkout main
   git pull  # Make sure you have the latest changes
   git merge --no-ff fix-login-issue  # Merge the fix
   git push

   # (Optional) Delete the hotfix branch
   git branch -d fix-login-issue
   git push origin --delete fix-login-issue
   ```

5. **Clean up the hotfix worktree:**
   ```bash
   git worktree remove ../hotfix-urgent-bug
   ```

## Further Reading

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [Pro Git Book - Git Tools - Worktree](https://git-scm.com/book/en/v2/Git-Tools-Worktree)
