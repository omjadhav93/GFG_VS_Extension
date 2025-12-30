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