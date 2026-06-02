#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

[ "${BASH_VERSINFO:-0}" -ge 5 ] || (echo "Error: Bash >= 5.0 is required for this script" >&2 && exit 1)

projectRoot="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

# package.json files (relative to projectRoot) kept in sync with the root version
packages=(
  "package.json"
  "runtime/v1/package.json"
  "packages/instrument-bundler/package.json"
  "packages/serve-instrument/package.json"
  "packages/instrument-guidelines/package.json"
)

currentVersion=$(node -e 'process.stdout.write(require(process.argv[1]).version)' "$projectRoot/package.json")
IFS='.' read -r major minor patch <<< "$currentVersion"
IFS=$'\n\t'

echo "Current version: $currentVersion"
PS3="Select a version bump: "
select bump in major minor patch quit; do
  case "${bump:-}" in
    major) newVersion="$((major + 1)).0.0"; break ;;
    minor) newVersion="$major.$((minor + 1)).0"; break ;;
    patch) newVersion="$major.$minor.$((patch + 1))"; break ;;
    quit) echo "Aborted."; exit 0 ;;
    *) echo "Invalid selection." ;;
  esac
done

read -r -p "Bump $currentVersion -> $newVersion? [y/N] " confirm
case "$confirm" in
  [yY]*) ;;
  *) echo "Aborted."; exit 0 ;;
esac

for pkg in "${packages[@]}"; do
  file="$projectRoot/$pkg"
  node -e '
    const fs = require("fs");
    const [file, version] = process.argv.slice(1);
    const contents = fs.readFileSync(file, "utf8");
    const updated = contents.replace(/("version":\s*)"[^"]*"/, `$1"${version}"`);
    if (updated === contents) {
      console.error(`Error: no version field updated in ${file}`);
      process.exit(1);
    }
    fs.writeFileSync(file, updated);
  ' "$file" "$newVersion"
  echo "Updated $pkg -> $newVersion"
done

echo "Done! All packages set to $newVersion"
