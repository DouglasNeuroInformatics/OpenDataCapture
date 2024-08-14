import React from 'react';

export const VimStatusBar = () => {
  return (
    <div id="status">
      <span>--NORMAL--</span>
      <span />
      <span className="vim-notification" />
      <span className="float-right" />
    </div>
  );
};
