// git.ts
import * as path from "path";
import { execCmd } from "./utils";

export async function cloneRepo(
    repoFullName: string,
    baseDir: string
): Promise<string> {
    const repoName = repoFullName.split("/")[1];
    const repoPath = path.join(baseDir, repoName);

    await execCmd(`git clone https://github.com/${repoFullName}.git`, baseDir);

    return repoPath;
}

export async function addUpstream(
    repoPath: string,
    upstreamOwner: string,
    upstreamRepo: string
) {
    await execCmd(
        `git remote add upstream https://github.com/${upstreamOwner}/${upstreamRepo}.git`,
        repoPath
    );

    await execCmd(`git fetch upstream`, repoPath);
}

export async function createBranch(
  repoPath: string,
  branchName: string
) {
  await execCmd(`git checkout -b ${branchName}`, repoPath);
}

export async function getUnstagedFiles(
  repoPath: string
): Promise<string[]> {
  const output = await execCmd(
    "git diff --name-only",
    repoPath
  );

  return output
    .split("\n")
    .map(f => f.trim())
    .filter(Boolean);
}

export async function getStagedFiles(
  repoPath: string
): Promise<string[]> {
  const output = await execCmd(
    "git diff --cached --name-only",
    repoPath
  );

  return output
    .split("\n")
    .map(f => f.trim())
    .filter(Boolean);
}

export interface GitCommit {
  hash: string;
  message: string;
}

export async function getRecentCommits(
  repoPath: string,
  limit = 10
): Promise<GitCommit[]> {
  const output = await execCmd(
    `git log --oneline -n ${limit}`,
    repoPath
  );

  return output
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [hash, ...msg] = line.split(" ");
      return {
        hash,
        message: msg.join(" ")
      };
    });
}

export async function getCurrentBranch(
  repoPath: string
): Promise<string> {
  const output = await execCmd(
    "git branch --show-current",
    repoPath
  );

  const branch = output.trim();

  if (!branch) {
    throw new Error("Unable to detect current branch");
  }

  return branch;
}

export async function hasUncommittedChanges(
  repoPath: string
): Promise<boolean> {
  const output = await execCmd(
    "git status --porcelain",
    repoPath
  );

  return output.trim().length > 0;
}

export async function fetchUpstream(
  repoPath: string
) {
  await execCmd("git fetch upstream", repoPath);
}

export async function rebaseOnUpstream(
  repoPath: string,
  baseBranch = "main"
) {
  await execCmd(
    `git rebase upstream/${baseBranch}`,
    repoPath
  );
}

export async function getConflictedFiles(
  repoPath: string
): Promise<string[]> {
  const output = await execCmd(
    "git diff --name-only --diff-filter=U",
    repoPath
  );

  return output
    .split("\n")
    .map(f => f.trim())
    .filter(Boolean);
}

export async function continueRebase(repoPath: string) {
  await execCmd("git rebase --continue", repoPath);
}

export async function abortRebase(repoPath: string) {
  await execCmd("git rebase --abort", repoPath);
}