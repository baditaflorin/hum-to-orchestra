const MAIN_COMMIT_URL = 'https://api.github.com/repos/baditaflorin/hum-to-orchestra/commits/main';

interface GitHubCommitResponse {
  sha: string;
  html_url: string;
}

export interface LiveCommit {
  shortSha: string;
  url: string;
}

export async function fetchLiveMainCommit(signal?: AbortSignal): Promise<LiveCommit | null> {
  const response = await fetch(MAIN_COMMIT_URL, {
    headers: { Accept: 'application/vnd.github+json' },
    signal
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as GitHubCommitResponse;
  return {
    shortSha: payload.sha.slice(0, 7),
    url: payload.html_url
  };
}
