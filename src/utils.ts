// utils.ts
import * as vscode from "vscode";
import { exec } from "child_process";

export function execCmd(cmd: string, cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve();
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