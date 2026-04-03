# GFG – Good First Guide (VS Code Extension)

> A beginner‑friendly VS Code extension that guides contributors through the **entire local Git workflow** for open‑source projects — safely, step by step.

GFG removes the fear and confusion around contributing to open source by providing **guided Git actions**, **clear confirmations**, and **conflict assistance**, all inside VS Code.

---

## What GFG Does (Current Features)

GFG helps contributors handle **everything locally** before opening a Pull Request.

### Implemented Features

- GitHub authentication via VS Code
- Choose & remember workspace location
- Fork repositories automatically (for OSS)
- Add `upstream` remote correctly
- Create and work on a dedicated feature branch
- Stage & unstage files with file selection
- Commit changes with validation
- Sync with upstream (`fetch + rebase`)
- Push changes safely to fork
- Revert commits (safe revert + optional hard reset)
- Detect merge conflicts
- Guide users through conflict resolution

> Pull Request creation is **intentionally not implemented yet**  
> (It will be added in the next phase with AI assistance.)

---

## 🎯 Why GFG?

Most beginners struggle with:
- Fork vs upstream confusion
- Rebasing & syncing
- Conflicts during rebase
- Unsafe Git commands
- Fear of breaking things

GFG solves this by:
- Blocking unsafe actions
- Asking for confirmations
- Explaining what’s happening
- Following **professional OSS workflows**

---

## 🧠 Core Design Principles

- **Beginner‑safe by default**
- **No magic automation**
- **Human‑in‑the‑loop**
- **Git best practices**
- **OSS‑friendly workflows**

---

## 🧩 Features in Detail

### 1. Workspace Selection
- User always chooses the base directory
- Last selected location is remembered
- Folder picker opens at the previous location

---

### 2. Fork & Setup (OSS‑Ready)
- Forks repo using **user’s GitHub identity**
- Clones fork locally
- Adds `upstream` remote automatically
- Creates a feature branch:
```bash
issue-<number>-<username>
```

---

### 3. Stage & Unstage Changes
- Lists changed files
- All files selected by default
- User can deselect files
- Supports unstaging files

---

### 4. Commit Changes
- Blocks commit if nothing is staged
- Prompts for commit message
- Validates commit message
- Uses standard `git commit`

---

### 5. Sync with Upstream
- Fetches `upstream`
- Rebases current branch on `upstream/main`
- Blocks action if:
- User is on `main`
- Working tree is dirty
- Provides clear confirmation before rebasing

---

### 6. Push Changes
- Detects current branch
- Prevents pushing from `main`
- Handles first push (`-u origin`)
- Avoids pushing if nothing changed
- Requires explicit confirmation

---

### 7. Revert Commits (Safe by Default)
- Shows recent commits
- Supports:
- **Safe revert** (`git revert`)
- **Hard reset** (`git reset --hard`) with strong warning
- Always asks for confirmation

---

### 8. Conflict Detection & Guidance
- Detects rebase conflicts
- Lists conflicted files
- Offers guided actions:
- Open conflicted files
- Continue rebase
- Abort rebase
- No silent failures

---

## 🛠️ Tech Stack

- VS Code Extension API
- TypeScript
- Native Git CLI
- GitHub Authentication (VS Code)
- No custom OAuth
- No token storage

---

## Security & Trust

- All Git actions run **locally**
- GitHub operations use **user’s identity**
- No background pushes
- No hidden automation
- Explicit confirmations for risky actions

---

## Roadmap

### Coming Next
- Pull Request creation
- AI‑assisted PR title & description
- PR preview UI
- Issue‑aware PR generation
- Tree View UI for actions
- Status summary panel

---

## Installation (Development)

### Run locally
```bash
npm install
npm run compile
```
OR press F5 to launch Extension Development Host.

### Install as VSIX
```bash
vsce package
code --install-extension gfg-0.0.1.vsix
```
