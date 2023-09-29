import { hydrateRoot } from 'react-dom/client';
const { default: App } = await import(PATH_TO_PAGE);

import './styles.css';

hydrateRoot(document, <App />);
