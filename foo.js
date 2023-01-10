import path from 'path';
import process from 'process';

const extensionsToFormat = ['.tsx', '.ts', 'js', '.cjs', '.mjs', '.json'];
const extensionsToLint = ['.tsx', '.ts'];


/**
 * Unfortunately, a custom config is necessary to specify the ESLint correct configs
 * @param {string[]} absolutePaths
 * */
export default function lintStaged(absolutePaths) {
  const lintCommands = [];
  const formatCommands = [];

  for (const absPath of absolutePaths) {
    const ext = path.extname(absPath);
    const relPath = path.relative(process.cwd(), absPath);

    console.log(relPath)
    if (extensionsToLint.includes(ext)) {
      lintCommands.push(`eslint --fix ${absPath} --resolve-plugins-relative-to ${absPath}`);
    }
    if (extensionsToFormat.includes(ext)) {
      formatCommands.push(`prettier --write ${absPath}`);
    }
  }

  return [...lintCommands, ...formatCommands];
}
