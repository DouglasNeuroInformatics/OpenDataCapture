import fs from 'node:fs';

import { checkPullRequest } from '../.github/scripts/pr-body.ts';

const { passed, report } = checkPullRequest(() => {
  const [eventPath, commitMessagesPath] = process.argv.slice(2);
  if (!eventPath || !commitMessagesPath) {
    throw new Error('Usage: node scripts/check-pr-body.ts <event.json> <commit-messages.txt>');
  }
  return {
    commitMessages: fs.readFileSync(commitMessagesPath, 'utf8'),
    eventJson: fs.readFileSync(eventPath, 'utf8')
  };
});
process.stdout.write(report);
process.exitCode = passed ? 0 : 1;
