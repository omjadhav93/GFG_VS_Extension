import { execCmd } from "./utils";

// github.ts
export async function forkRepo(
  token: string,
  owner: string,
  repo: string
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/forks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fork repository");
  }

  const data: any = await res.json();
  return data.full_name; // username/repo
}

export async function getGitHubUsername(token: string): Promise<string> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch GitHub username");
  }

  const data: any = await res.json();
  return data.login;
}

export async function hasCommitsToPush(
  repoPath: string,
  branch: string
): Promise<boolean> {
  const output = await execCmd(
    `git rev-list --count origin/${branch}..HEAD`,
    repoPath
  );

  return Number(output.trim()) > 0;
}

