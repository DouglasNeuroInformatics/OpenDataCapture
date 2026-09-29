import type React from 'react';

type SearchSubmitGuardProps = {
  children: React.ReactNode;
};

/**
 * libui's SearchBar is a <form> with no submit handler, so pressing Enter in it reloads the page,
 * which drops the in-memory access token and sends the user to the login page. Wrap a search bar,
 * or a DataTable rendering one, in this to cancel that submit. Use it only where the search already
 * applies as the user types, since nothing happens on Enter.
 */
export const SearchSubmitGuard = ({ children }: SearchSubmitGuardProps) => {
  return <div onSubmit={(event) => event.preventDefault()}>{children}</div>;
};
