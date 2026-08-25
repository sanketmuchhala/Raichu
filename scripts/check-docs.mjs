import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirectories = new Set(['.git', '.next', '.turbo', 'dist', 'node_modules']);
const markdownFiles = [];

function collectMarkdown(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      collectMarkdown(path);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      markdownFiles.push(path);
    }
  }
}

function localTarget(rawTarget) {
  const trimmed = rawTarget.trim();
  if (
    trimmed.length === 0 ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  ) {
    return null;
  }

  const withoutTitle = trimmed.startsWith('<')
    ? trimmed.slice(1, trimmed.indexOf('>'))
    : trimmed.split(/\s+["']/u, 1)[0];
  const pathOnly = withoutTitle.split('#', 1)[0].split('?', 1)[0];

  try {
    return decodeURIComponent(pathOnly);
  } catch {
    return pathOnly;
  }
}

function existsWithExactCase(target) {
  if (!existsSync(target)) return false;

  const repositoryPath = relative(repositoryRoot, target);
  if (repositoryPath === '' || repositoryPath.startsWith('..')) return true;

  let current = repositoryRoot;
  for (const segment of repositoryPath.split('/')) {
    const entries = readdirSync(current);
    if (!entries.includes(segment)) return false;
    current = resolve(current, segment);
  }
  return true;
}

function inspectMarkdown(file) {
  const contents = readFileSync(file, 'utf8');
  const lines = contents.split(/\r?\n/u);
  const errors = [];
  let h1Count = 0;
  let openFence = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;

    if (openFence) {
      const closeMatch = line.match(/^\s*([`~]{3,})\s*$/u);
      if (
        closeMatch &&
        closeMatch[1][0] === openFence.character &&
        closeMatch[1].length >= openFence.length
      ) {
        if (openFence.mermaid && !openFence.hasContent) {
          errors.push(`line ${openFence.lineNumber}: empty Mermaid diagram`);
        }
        openFence = null;
      } else if (openFence.mermaid && line.trim().length > 0) {
        if (!openFence.hasContent) {
          const supportedHeader = /^(flowchart|graph|sequenceDiagram|stateDiagram(?:-v2)?|erDiagram)\b/u;
          if (!supportedHeader.test(line.trim())) {
            errors.push(`line ${lineNumber}: unsupported Mermaid diagram header`);
          }
        }
        openFence.hasContent = true;
      }
      continue;
    }

    const openMatch = line.match(/^\s*(`{3,}|~{3,})(.*)$/u);
    if (openMatch) {
      openFence = {
        character: openMatch[1][0],
        length: openMatch[1].length,
        lineNumber,
        mermaid: openMatch[2].trim().toLowerCase() === 'mermaid',
        hasContent: false,
      };
      continue;
    }

    if (/^#\s+\S/u.test(line)) h1Count += 1;

    const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/gu;
    for (const match of line.matchAll(linkPattern)) {
      const target = localTarget(match[1]);
      if (!target) continue;

      const resolvedTarget = resolve(dirname(file), target);
      if (!existsWithExactCase(resolvedTarget)) {
        errors.push(`line ${lineNumber}: missing local link target "${target}"`);
      } else if (!statSync(resolvedTarget).isFile() && !statSync(resolvedTarget).isDirectory()) {
        errors.push(`line ${lineNumber}: unsupported link target "${target}"`);
      }
    }
  }

  const repositoryPath = relative(repositoryRoot, file);
  const requiresH1 = !repositoryPath.startsWith('.github/');
  if (requiresH1 && h1Count !== 1) {
    errors.push(`expected exactly one H1 outside code fences, found ${h1Count}`);
  }

  if (openFence?.mermaid) {
    errors.push(`line ${openFence.lineNumber}: unclosed Mermaid fence`);
  }

  return errors;
}

collectMarkdown(repositoryRoot);

const failures = [];
for (const file of markdownFiles.sort()) {
  const errors = inspectMarkdown(file);
  for (const error of errors) {
    failures.push(`${relative(repositoryRoot, file)}: ${error}`);
  }
}

if (failures.length > 0) {
  console.error(`Documentation check failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Documentation check passed for ${markdownFiles.length} Markdown files.`);
}
