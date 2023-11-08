import { hydrateRoot } from 'react-dom/client';

import { Layout } from './components/Layout';

const Page = await import(PATH_TO_PAGE).then((module: { default: React.ComponentType }) => module.default);

import './styles.css';

hydrateRoot(
  document,
  <Layout>
    <Page />
  </Layout>
);
