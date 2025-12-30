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