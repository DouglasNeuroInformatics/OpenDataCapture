import { hydrateRoot } from 'react-dom/client';

import { Layout } from './components/Layout';
import IndexPage from './pages';

import './styles.css';

hydrateRoot(
  document,
  <Layout>
    <IndexPage />
  </Layout>
);
