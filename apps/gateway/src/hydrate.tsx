import { hydrateRoot } from 'react-dom/client';
const { default: App } = await import(globalThis.PATH_TO_PAGE as string);

hydrateRoot(document, <App />);
