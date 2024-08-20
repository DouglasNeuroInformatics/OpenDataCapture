export function addFrontmatter(content: string, frontmatter: { [key: string]: boolean | string }) {
  const entries = Object.entries(frontmatter).map(([key, value]) => `${key}: ${value}`);

  if (entries.length === 0) {
    return content;
  }

  return `---\n${entries.join('\n')}\n---\n\n${content}`;
}
