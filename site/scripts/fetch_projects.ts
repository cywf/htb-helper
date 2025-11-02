#!/usr/bin/env tsx
/**
 * Fetch project board items from GitHub API
 * Falls back to issues if Projects v2 is not available
 * Writes to public/data/projects.json
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'cywf';
const REPO_NAME = 'htb-helper';

interface ProjectItem {
  title: string;
  status: string;
  labels: string[];
  assignees: string[];
  url: string;
}

async function fetchIssuesAsFallback(): Promise<ProjectItem[]> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'htb-helper-site',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=50`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const issues = await response.json();

    const items: ProjectItem[] = issues
      .filter((issue: any) => !issue.pull_request) // Filter out PRs
      .map((issue: any) => {
        // Determine status based on labels or state
        let status = 'todo';
        const labelNames = issue.labels.map((l: any) => l.name);

        if (labelNames.some((l: string) => l.includes('in progress') || l.includes('doing'))) {
          status = 'in-progress';
        } else if (issue.state === 'closed' || labelNames.some((l: string) => l.includes('done'))) {
          status = 'done';
        } else if (labelNames.some((l: string) => l.includes('todo'))) {
          status = 'todo';
        }

        return {
          title: issue.title,
          status,
          labels: labelNames.filter((l: string) => !l.includes('status:')),
          assignees: issue.assignees.map((a: any) => a.login),
          url: issue.html_url,
        };
      });

    return items;
  } catch (error) {
    console.error('Error fetching issues:', error);
    return [];
  }
}

async function main() {
  console.log('Fetching project items (using issues as fallback)...');
  const items = await fetchIssuesAsFallback();

  const outputPath = join(process.cwd(), 'public', 'data', 'projects.json');
  writeFileSync(outputPath, JSON.stringify(items, null, 2));

  console.log(`✅ Project items written to ${outputPath}`);
  console.log(`   Found ${items.length} items`);
  
  const statusCounts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('   Status breakdown:', statusCounts);
}

main().catch(console.error);
