// startWork.ts
import * as vscode from "vscode";
import { getBaseDir, getGitHubSession } from "./utils";
import { forkRepo, getGitHubUsername } from "./github";
import { cloneRepo, addUpstream, createBranch } from "./git";
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