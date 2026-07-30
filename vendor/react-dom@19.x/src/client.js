/**
 * Mounting a root means owning the document, which only an interactive instrument does — a form
 * renders inside the host application's tree. The served copy of this module is bound to the React
 * it was built with, so a root mounted with it inside a host application produces a tree whose
 * hooks come from the wrong dispatcher. The check is on the call rather than the import because
 * every instrument bundle, interactive included, is first evaluated in the host page to read its
 * definition; only an interactive instrument goes on to mount, and it does so in its own iframe.
 */
import * as client from 'react-dom/client';

function assertOwnsDocument(name) {
  if (typeof __ODC_RUNTIME_BUILD__ !== 'undefined' && globalThis.__ODC_HOST_REACT) {
    throw new Error(`Cannot call '${name}': react-dom can only be used in an interactive instrument`);
  }
}

function createRoot(container, options) {
  assertOwnsDocument('createRoot');
  return client.createRoot(container, options);
}

function hydrateRoot(container, initialChildren, options) {
  assertOwnsDocument('hydrateRoot');
  return client.hydrateRoot(container, initialChildren, options);
}

export default { ...client.default, createRoot, hydrateRoot };

export { createRoot, hydrateRoot };

export const version = client.version;
