import { hydrateRoot } from 'react-dom/client';
const { default: App } = await import(PATH_TO_PAGE);

hydrateRoot(document, <App />);
