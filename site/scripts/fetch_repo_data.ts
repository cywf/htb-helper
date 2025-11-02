#!/usr/bin/env tsx
/**
 * Fetch repository statistics from GitHub API
 * Writes to public/data/stats.json
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'cywf';
const REPO_NAME = 'htb-helper';

interface RepoStats {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  languages: Record<string, number>;
  weeklyCommits: { week: string; commits: number }[];
}

async function fetchRepoStats(): Promise<RepoStats> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'htb-helper-site',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    // Fetch repository info
    const repoResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
      { headers }
    );

    if (!repoResponse.ok) {
      throw new Error(`GitHub API error: ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();

    // Fetch languages
    const langResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/languages`,
      { headers }
    );

    const languages = langResponse.ok ? await langResponse.json() : {};

    // Fetch commit activity (last 12 weeks)
    const activityResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/stats/participation`,
      { headers }
    );

    let weeklyCommits: { week: string; commits: number }[] = [];
    if (activityResponse.ok) {
      const activityData = await activityResponse.json();
      const lastWeeks = activityData.all?.slice(-12) || [];
      weeklyCommits = lastWeeks.map((commits: number, index: number) => ({
        week: `Week ${index + 1}`,
        commits,
      }));
    }

    const stats: RepoStats = {
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      watchers: repoData.watchers_count || 0,
      openIssues: repoData.open_issues_count || 0,
      languages,
      weeklyCommits,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching repo stats:', error);
    // Return default values on error
    return {
      stars: 0,
      forks: 0,
      watchers: 0,
      openIssues: 0,
      languages: { Python: 75, Shell: 20, Other: 5 },
      weeklyCommits: Array.from({ length: 12 }, (_, i) => ({
        week: `Week ${i + 1}`,
        commits: 0,
      })),
    };
  }
}

async function main() {
  console.log('Fetching repository statistics...');
  const stats = await fetchRepoStats();

  const outputPath = join(process.cwd(), 'public', 'data', 'stats.json');
  writeFileSync(outputPath, JSON.stringify(stats, null, 2));

  console.log(`✅ Stats written to ${outputPath}`);
  console.log(`   Stars: ${stats.stars}, Forks: ${stats.forks}, Watchers: ${stats.watchers}`);
}

main().catch(console.error);
