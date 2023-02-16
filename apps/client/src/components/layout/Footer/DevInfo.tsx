import React from 'react';

export const DevInfo = () => {
  return (
    <div className="flex items-center justify-center">
      <span>Branch: &apos;{import.meta.env.VITE_DEV_GIT_BRANCH}&apos;</span>
      <span className="mx-2">|</span>
      <span>
        Last Commit on {import.meta.env.VITE_DEV_GIT_COMMIT_DATE}: &apos;{import.meta.env.VITE_DEV_GIT_COMMIT}&apos;
      </span>
      <span className="mx-2">|</span>
    </div>
  );
};
