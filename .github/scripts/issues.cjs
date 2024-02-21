// @ts-check

/** @param {import('github-script').AsyncFunctionArguments} args */
function addPriorityAndDifficulty({ context, github }) {
  /** @type {(item: string) => string | null} */
  const extractItem = (item) => {
    const items = context.payload.issue?.body?.split('\n\n');
    const labelIndex = items?.findIndex((s) => s.includes(item));
    if (labelIndex === undefined || labelIndex === -1) {
      return null;
    }
    return items?.[labelIndex + 1] ?? null;
  };
  const priority = extractItem('Priority');
  const difficulty = extractItem('Estimated Difficulty');

  const labels = [];
  if (priority) {
    labels.push(`Priority: ${priority}`);
  }
  if (difficulty) {
    labels.push(`Difficulty: ${difficulty}`);
  }

  github.rest.issues.addLabels({
    issue_number: context.issue.number,
    labels: labels,
    owner: context.repo.owner,
    repo: context.repo.repo
  });
}

/** @param {import('github-script').AsyncFunctionArguments} args */
function addLabelToTitle({ context, github }) {
  const title = context.payload.issue?.title;
  const names = ['Bug', 'Feature', 'Enhancement', 'Discussion'];
  const kind = context.payload.issue?.labels.find((item) => names.includes(item.name))?.name;
  if (!kind) {
    console.error('Does not match kind');
    return;
  }
  github.rest.issues.update({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    title: `[${kind}]: ${title}`
  });
}

/** @param {import('github-script').AsyncFunctionArguments} args */
module.exports = (args) => {
  addPriorityAndDifficulty(args);
  addLabelToTitle(args);
};
