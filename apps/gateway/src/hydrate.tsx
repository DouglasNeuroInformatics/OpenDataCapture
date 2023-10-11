import { hydrateRoot } from 'react-dom/client';

import { Layout } from './Layout';
import IndexPage from './pages';

import './styles.css';

hydrateRoot(
  document,
  <Layout>
    <IndexPage />
  </Layout>
);
