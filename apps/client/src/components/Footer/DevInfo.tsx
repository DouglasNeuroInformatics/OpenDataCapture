import React from 'react';

export const DevInfo = () => {
  const gitBranch = import.meta.env.VITE_DEV_GIT_BRANCH;
  const lastCommit = import.meta.env.VITE_DEV_GIT_COMMIT?.slice(0, 7);
  const lastCommitDate = import.meta.env.VITE_DEV_GIT_COMMIT_DATE;

  return (
    <div className="flex justify-center text-sm">
      <span>{`Last Commit '${lastCommit!}' to Branch '${gitBranch!}' on ${lastCommitDate!}`}</span>
    </div>
  );
};
