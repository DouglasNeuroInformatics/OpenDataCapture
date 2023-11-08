import { hydrateRoot } from 'react-dom/client';

import { Layout } from './components/Layout';

const Page = await import(__PATH_TO_PAGE__).then((module: { default: React.ComponentType }) => module.default);

import './styles.css';

hydrateRoot(
  document,
  <Layout>
    <Page {...__INITIAL_PROPS__} />
  </Layout>
);
