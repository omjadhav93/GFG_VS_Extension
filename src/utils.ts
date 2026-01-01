// utils.ts
import * as vscode from "vscode";
import { exec } from "child_process";
import { GitCommit } from "./git";
import path from "path";
import fs from "fs";

export function execCmd(
  cmd: string,
  cwd?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout || "");
      }
    });
  });
}

export async function getGitHubSession() {
  return vscode.authentication.getSession(
    "github",
    ["repo", "read:user"],
    { createIfNone: true }
  );
}

export async function askWorkspaceLocation(
  defaultPath?: string
): Promise<string> {
  const result = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select folder for GFG projects",
    defaultUri: defaultPath
      ? vscode.Uri.file(defaultPath)
      : undefined
  });

  if (!result || result.length === 0) {
    throw new Error("No folder selected");
  }

  return result[0].fsPath;
}

export async function getBaseDir(
  context: vscode.ExtensionContext
): Promise<string> {
  const saved = context.globalState.get<string>("gfgBaseDir");

  const selected = await askWorkspaceLocation(saved);

  await context.globalState.update("gfgBaseDir", selected);
  return selected;
}

export async function askIssueLink(): Promise<{
  owner: string;
  repo: string;
  issueNumber: number;
}> {
  const input = await vscode.window.showInputBox({
    prompt: "Paste GitHub issue link",
    placeHolder: "https://github.com/owner/repo/issues/123",
    ignoreFocusOut: true
  });

  if (!input) {
    throw new Error("Issue link is required");
  }

  const match = input.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)$/
  );

  if (!match) {
    throw new Error("Invalid GitHub issue URL");
  }

  const [, owner, repo, issue] = match;

  return {
    owner,
    repo,
    issueNumber: Number(issue)
  };
}

export async function askCommitMessage(): Promise<string> {
  const message = await vscode.window.showInputBox({
    prompt: "Enter commit message",
    placeHolder: "feat: fix footer alignment on mobile",
    ignoreFocusOut: true,
    validateInput: (value) => {
      if (!value || value.trim().length < 5) {
        return "Commit message must be at least 5 characters";
      }
      return null;
    }
  });

  if (!message) {
    throw new Error("Commit message is required");
  }

  return message.trim();
}

export async function pickCommit(
  commits: GitCommit[]
): Promise<GitCommit | undefined> {
  const items = commits.map(c => ({
    label: c.message,
    description: c.hash
  }));

  const selected = await vscode.window.showQuickPick(items, {
    title: "Select commit to revert",
    placeHolder: "Choose a commit (most recent first)"
  });

  if (!selected) {return;}

  return commits.find(c => c.hash === selected.description);
}

export type RevertType = "revert" | "hard-reset";

export async function pickRevertType(): Promise<RevertType | undefined> {
  const selected = await vscode.window.showQuickPick(
    [
      {
        label: "Revert commit (safe)",
        description: "Creates a new commit that undoes changes"
      },
      {
        label: "Hard reset (dangerous)",
        description: "Resets branch and discards commits"
      }
    ],
    {
      title: "How do you want to go back?"
    }
  );

  if (!selected) {return;}

  return selected.label.startsWith("Revert")
    ? "revert"
    : "hard-reset";
}

export async function confirmRevert(
  message: string,
  dangerous = false
): Promise<boolean> {
  const confirmText = dangerous ? "Yes, reset" : "Yes, revert";

  const result = await vscode.window.showWarningMessage(
    message,
    { modal: true },
    confirmText
  );

  return result === confirmText;
}

export async function confirmSync(
  branch: string
): Promise<boolean> {
  const result = await vscode.window.showInformationMessage(
    `Sync branch "${branch}" with upstream/main using rebase?`,
    {
      modal: true,
      detail:
        "This will replay your commits on top of the latest upstream changes."
    },
    "Sync"
  );

  return result === "Sync";
}


export function isRebaseInProgress(repoPath: string): boolean {
  const gitDir = path.join(repoPath, ".git");

  return (
    fs.existsSync(path.join(gitDir, "rebase-merge")) ||
    fs.existsSync(path.join(gitDir, "rebase-apply"))
  );
}

export async function openConflictedFiles(
  repoPath: string,
  files: string[]
) {
  for (const file of files) {
    const uri = vscode.Uri.file(path.join(repoPath, file));
    await vscode.window.showTextDocument(uri, { preview: false });
  }
}


export async function guideUserThroughConflict(
  files: string[],
  inRebase: boolean
) {
  const message =
    `⚠️ Merge conflicts detected.\n\n` +
    `Conflicted files:\n` +
    files.map(f => `• ${f}`).join("\n");

  const action = await vscode.window.showWarningMessage(
    message,
    { modal: true },
    { title: "Open Conflicted Files" },
    ...(inRebase ? [{ title: "Continue Rebase" }] : []),
    ...(inRebase ? [{ title: "Abort Rebase" }] : [])
  );

  return action;
}