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

export async function askWorkspaceLocation(): Promise<string> {
  const result = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select folder for GFG projects"
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
  if (saved) {return saved;}

  const selected = await askWorkspaceLocation();
  await context.globalState.update("gfgBaseDir", selected);
  return selected;
}