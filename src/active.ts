// startWork.ts
import * as vscode from "vscode";
import { askCommitMessage, confirmRevert, confirmSync, execCmd, getBaseDir, getGitHubSession, guideUserThroughConflict, isRebaseInProgress, openConflictedFiles, pickCommit, pickRevertType } from "./utils";
import { forkRepo, getGitHubUsername, hasCommitsToPush } from "./github";
import { cloneRepo, addUpstream, createBranch, getUnstagedFiles, getStagedFiles, getRecentCommits, getCurrentBranch, rebaseOnUpstream, fetchUpstream, hasUncommittedChanges, getConflictedFiles, continueRebase, abortRebase } from "./git";
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

export async function commitChanges(repoPath: string) {
  const stagedFiles = await getStagedFiles(repoPath);

  if (stagedFiles.length === 0) {
    vscode.window.showInformationMessage(
      "No staged changes to commit."
    );
    return;
  }

  const message = await askCommitMessage();

  await execCmd(
    `git commit -m "${message.replace(/"/g, '\\"')}"`,
    repoPath
  );

  vscode.window.showInformationMessage(
    `Committed ${stagedFiles.length} file(s).`
  );
}

export async function revertChanges(repoPath: string) {
  const commits = await getRecentCommits(repoPath);

  if (commits.length === 0) {
    vscode.window.showInformationMessage("No commits found.");
    return;
  }

  const commit = await pickCommit(commits);
  if (!commit) { return; }

  const type = await pickRevertType();
  if (!type) { return; }

  if (type === "revert") {
    const confirmed = await confirmRevert(
      `Revert commit:\n\n${commit.message}\n(${commit.hash})`
    );
    if (!confirmed) { return; }

    await execCmd(
      `git revert ${commit.hash} --no-edit`,
      repoPath
    );

    vscode.window.showInformationMessage(
      "Commit reverted successfully."
    );
  }

  if (type === "hard-reset") {
    const confirmed = await confirmRevert(
      `⚠️ HARD RESET WARNING ⚠️\n\nThis will permanently discard commits after:\n${commit.message}\n(${commit.hash})`,
      true
    );
    if (!confirmed) { return; }

    await execCmd(
      `git reset --hard ${commit.hash}`,
      repoPath
    );

    vscode.window.showInformationMessage(
      "Branch reset successfully."
    );
  }
}

export async function pushChanges(repoPath: string) {
  const branch = await getCurrentBranch(repoPath);

  if (branch === "main" || branch === "master") {
    vscode.window.showWarningMessage(
      "You are on the main branch. Pushing directly is not recommended."
    );
    return;
  }

  let hasChanges = true;

  try {
    hasChanges = await hasCommitsToPush(repoPath, branch);
  } catch {
    // origin/branch does not exist yet → first push
    hasChanges = true;
  }

  if (!hasChanges) {
    vscode.window.showInformationMessage(
      "No new commits to push."
    );
    return;
  }

  // First push or normal push (auto‑detect)
  await execCmd(
    `git push -u origin ${branch}`,
    repoPath
  );

  vscode.window.showInformationMessage(
    `Branch "${branch}" pushed successfully.`
  );
}

export async function syncWithUpstream(
  repoPath: string
) {
  const branch = await getCurrentBranch(repoPath);

  if (branch === "main" || branch === "master") {
    vscode.window.showWarningMessage(
      "You are already on the main branch."
    );
    return;
  }

  const dirty = await hasUncommittedChanges(repoPath);
  if (dirty) {
    vscode.window.showWarningMessage(
      "You have uncommitted changes. Please commit or stash them before syncing."
    );
    return;
  }

  const confirmed = await confirmSync(branch);
  if (!confirmed) { return; }

  try {
    await fetchUpstream(repoPath);
    await rebaseOnUpstream(repoPath);
    vscode.window.showInformationMessage(
      `Branch "${branch}" is now up to date with upstream/main.`
    );
  } catch (err: any) {
    await handleConflicts(repoPath);
  }
}

export async function detectConflicts(
  repoPath: string
): Promise<{
  inRebase: boolean;
  files: string[];
}> {
  const inRebase = isRebaseInProgress(repoPath);
  const files = await getConflictedFiles(repoPath);

  return { inRebase, files };
}

export async function handleConflicts(repoPath: string) {
  const { inRebase, files } = await detectConflicts(repoPath);

  if (files.length === 0) { return; }

  const action = await guideUserThroughConflict(files, inRebase);

  if (action?.title === "Open Conflicted Files") {
    await openConflictedFiles(repoPath, files);
  }

  if (action?.title === "Continue Rebase") {
    await continueRebase(repoPath);
    vscode.window.showInformationMessage("Rebase completed.");
  }

  if (action?.title === "Abort Rebase") {
    await abortRebase(repoPath);
    vscode.window.showInformationMessage("Rebase aborted.");
  }
}