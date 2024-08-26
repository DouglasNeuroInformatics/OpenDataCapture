import { builtinModules } from 'module';

export function validatePackageName(name: string): { issue: string; success: false } | { success: true } {
  if (!name.length) {
    return { issue: 'length must be greater than zero', success: false };
  }

  if (/^\./.exec(name)) {
    return { issue: 'cannot start with a period', success: false };
  }

  if (/^_/.exec(name)) {
    return { issue: 'cannot start with an underscore', success: false };
  }

  if (name.trim() !== name) {
    return { issue: 'cannot contain leading or trailing spaces', success: false };
  }

  if (name === 'node_modules' || name === 'favicon.ico') {
    return { issue: 'cannot be blacklisted name', success: false };
  }

  if (builtinModules.includes(name.toLowerCase())) {
    return { issue: 'cannot be node core mode', success: false };
  }

  if (name.length > 214) {
    return { issue: 'cannot contain more than 214 character', success: false };
  }

  if (name.toLowerCase() !== name) {
    return { issue: 'cannot contain capital letters', success: false };
  }

  if (/[~'!()*]/.test(name.split('/').slice(-1)[0]!)) {
    return { issue: 'cannot contain special characters ("~\'!()*")', success: false };
  }

  if (encodeURIComponent(name) !== name) {
    const scopedPackageMatch = /^(?:@([^/]+?)[/])?([^/]+?)$/.exec(name);
    if (scopedPackageMatch) {
      const user = scopedPackageMatch[1]!;
      const pkg = scopedPackageMatch[2]!;
      if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) {
        return { success: true };
      }
    }
    return { issue: 'must contain only URL-friendly characters', success: false };
  }

  return { success: true };
}
