#!/usr/bin/env tsx
/**
 * Index scripts from the repository
 * Extracts metadata from scripts and writes to public/data/scripts.json
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

interface Script {
  filename: string;
  path: string;
  description: string;
  language: string;
  purpose?: string;
  usage?: string;
}

const SCRIPT_DIRS = [
  '../ctf_scripts',
  '../networking',
  '../systems',
  '../web',
];

function getLanguageFromExtension(ext: string): string {
  const langMap: Record<string, string> = {
    '.py': 'Python',
    '.sh': 'Shell',
    '.bash': 'Bash',
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
  };
  return langMap[ext] || 'Other';
}

function extractDescription(content: string, ext: string): string {
  const lines = content.split('\n').slice(0, 20); // Check first 20 lines
  
  if (ext === '.py') {
    // Look for docstring
    const docstringMatch = content.match(/"""([\s\S]*?)"""/);
    if (docstringMatch) {
      return docstringMatch[1].trim().split('\n')[0];
    }
    // Look for comment
    const commentMatch = lines.find(l => l.trim().startsWith('#') && l.length > 5);
    if (commentMatch) {
      return commentMatch.replace(/^#\s*/, '').trim();
    }
  } else if (ext === '.sh' || ext === '.bash') {
    // Look for comment after shebang
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#!')) continue;
      if (line.startsWith('#') && line.length > 5) {
        return line.replace(/^#\s*/, '').trim();
      }
    }
  }
  
  return 'No description available';
}

function determinePurpose(filename: string, content: string): string | undefined {
  const lower = filename.toLowerCase() + ' ' + content.toLowerCase();
  
  if (lower.includes('revshell') || lower.includes('reverse shell')) {
    return 'revshell';
  } else if (lower.includes('fuzz') || lower.includes('fuzzing')) {
    return 'fuzzing';
  } else if (lower.includes('enum') || lower.includes('enumeration')) {
    return 'enum';
  }
  
  return undefined;
}

function extractUsage(content: string, filename: string, ext: string): string | undefined {
  const lines = content.split('\n');
  
  // Look for usage examples in comments
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const line = lines[i];
    if (line.includes('Usage:') || line.includes('usage:') || line.includes('Example:')) {
      // Get next few non-empty lines
      const usageLines = [];
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const l = lines[j].trim();
        if (l && (l.startsWith('#') || l.startsWith('//'))) {
          usageLines.push(l.replace(/^[#/]+\s*/, ''));
        } else if (usageLines.length > 0) {
          break;
        }
      }
      if (usageLines.length > 0) {
        return usageLines.join(' ').trim();
      }
    }
  }
  
  // Generate basic usage
  if (ext === '.py') {
    return `python3 ${filename} --help`;
  } else if (ext === '.sh' || ext === '.bash') {
    return `./${filename} --help`;
  }
  
  return undefined;
}

function indexScripts(baseDir: string, relativePath: string = ''): Script[] {
  const scripts: Script[] = [];
  
  try {
    const fullPath = join(process.cwd(), baseDir, relativePath);
    const items = readdirSync(fullPath);
    
    for (const item of items) {
      const itemPath = join(fullPath, item);
      const relPath = join(relativePath, item);
      const stat = statSync(itemPath);
      
      if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
        // Recursively index subdirectories
        scripts.push(...indexScripts(baseDir, relPath));
      } else if (stat.isFile()) {
        const ext = extname(item);
        const supportedExtensions = ['.py', '.sh', '.bash', '.js'];
        
        if (supportedExtensions.includes(ext) && item !== 'setup.py') {
          try {
            const content = readFileSync(itemPath, 'utf-8');
            const script: Script = {
              filename: basename(item),
              path: join(baseDir.replace('../', ''), relPath),
              description: extractDescription(content, ext),
              language: getLanguageFromExtension(ext),
              purpose: determinePurpose(item, content),
              usage: extractUsage(content, item, ext),
            };
            scripts.push(script);
          } catch (error) {
            console.error(`Error reading ${itemPath}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error indexing ${baseDir}:`, error);
  }
  
  return scripts;
}

async function main() {
  console.log('Indexing scripts...');
  let allScripts: Script[] = [];
  
  for (const dir of SCRIPT_DIRS) {
    console.log(`  Scanning ${dir}...`);
    const scripts = indexScripts(dir);
    allScripts = allScripts.concat(scripts);
    console.log(`    Found ${scripts.length} scripts`);
  }
  
  const outputPath = join(process.cwd(), 'public', 'data', 'scripts.json');
  writeFileSync(outputPath, JSON.stringify(allScripts, null, 2));
  
  console.log(`✅ Scripts indexed to ${outputPath}`);
  console.log(`   Total: ${allScripts.length} scripts`);
}

main().catch(console.error);
