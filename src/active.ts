// startWork.ts
import * as vscode from "vscode";
import { execCmd, getBaseDir, getGitHubSession } from "./utils";
import { forkRepo, getGitHubUsername } from "./github";
import { cloneRepo, addUpstream, createBranch, getUnstagedFiles, getStagedFiles } from "./git";
import { openInNewWindow } from "./vscode";

export async function activeStartWork(
    context: vscode.ExtensionContext,
    owner: string,
    repo: string,
    issueNumber: number,
) {
    try {
        // 1. GitHub Login
        const session = await getGitHubSession();
        const token = session.accessToken;

        // 2. Fork Repo
        const forkFullName = await forkRepo(token, owner, repo);


        // 3. Clone Repo
        const baseDir = await getBaseDir(context);
        const repoPath = await cloneRepo(forkFullName, baseDir);

        // 4. Add Upstream
        await addUpstream(repoPath, owner, repo);

        const githubUsername = await getGitHubUsername(token);
        const safeUsername = githubUsername.replace(/[^a-zA-Z0-9-_]/g, "");
        const branchName = `gfg/issue-${issueNumber}-${safeUsername}`;
        await createBranch(repoPath, branchName);

        // 5. Open in New Window
        await openInNewWindow(repoPath);

    } catch (err: any) {
        vscode.window.showErrorMessage(err.toString());
    }
}

export async function stageChanges(repoPath: string) {
  const files = await getUnstagedFiles(repoPath);

  if (files.length === 0) {
    vscode.window.showInformationMessage("No unstaged changes found.");
    return;
  }

  const picks = files.map(file => ({
    label: file,
    picked: true // 👈 default selected
  }));

  const selected = await vscode.window.showQuickPick(picks, {
    canPickMany: true,
    title: "Stage changes",
    placeHolder: "Unselect files you don't want to stage"
  });

  if (!selected || selected.length === 0) {
    vscode.window.showInformationMessage("No files selected.");
    return;
  }

  for (const item of selected) {
    await execCmd(`git add "${item.label}"`, repoPath);
  }

  vscode.window.showInformationMessage(
    `Staged ${selected.length} file(s).`
  );
}


export async function unstageChanges(repoPath: string) {
  const files = await getStagedFiles(repoPath);

  if (files.length === 0) {
    vscode.window.showInformationMessage("No staged files found.");
    return;
  }

  const picks = files.map(file => ({
    label: file,
    picked: true
  }));

  const selected = await vscode.window.showQuickPick(picks, {
    canPickMany: true,
    title: "Unstage changes",
    placeHolder: "Unselect files you want to keep staged"
  });

  if (!selected || selected.length === 0) {
    vscode.window.showInformationMessage("No files selected.");
    return;
  }

  for (const item of selected) {
    await execCmd(`git restore --staged "${item.label}"`, repoPath);
  }

  vscode.window.showInformationMessage(
    `Unstaged ${selected.length} file(s).`
  );
}

