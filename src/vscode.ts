// open.ts
import * as vscode from "vscode";

export async function openInNewWindow(repoPath: string) {
  const uri = vscode.Uri.file(repoPath);

  await vscode.commands.executeCommand(
    "vscode.openFolder",
    uri,
    true // force new window
  );
}