#!/usr/bin/env tsx
/**
 * Fetch discussions from GitHub API
 * Writes to public/data/discussions.json
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'cywf';
const REPO_NAME = 'htb-helper';

interface Discussion {
  title: string;
  url: string;
  author: string;
  category: string;
  createdAt: string;
  commentsCount: number;
}

async function fetchDiscussions(): Promise<Discussion[]> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'htb-helper-site',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    // Use GraphQL API for discussions
    const query = `
      query {
        repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
          discussions(first: 25, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              title
              url
              author {
                login
              }
              category {
                name
              }
              createdAt
              comments {
                totalCount
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const nodes = data?.data?.repository?.discussions?.nodes || [];

    const discussions: Discussion[] = nodes.map((node: any) => ({
      title: node.title,
      url: node.url,
      author: node.author?.login || 'Unknown',
      category: node.category?.name || 'General',
      createdAt: node.createdAt,
      commentsCount: node.comments?.totalCount || 0,
    }));

    return discussions;
  } catch (error) {
    console.error('Error fetching discussions:', error);
    // Return empty array on error
    return [];
  }
}

async function main() {
  console.log('Fetching discussions...');
  const discussions = await fetchDiscussions();

  const outputPath = join(process.cwd(), 'public', 'data', 'discussions.json');
  writeFileSync(outputPath, JSON.stringify(discussions, null, 2));

  console.log(`✅ Discussions written to ${outputPath}`);
  console.log(`   Found ${discussions.length} discussions`);
}

main().catch(console.error);
