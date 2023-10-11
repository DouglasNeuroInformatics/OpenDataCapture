import { Counter } from '@/components/Counter';
import { Layout } from '@/components/Layout';

const SettingsPage = () => {
  return (
    <Layout title="Settings">
      <Counter />
      <div style={{ height: '20px' }}></div>
      <p>
        <a href="/">Home</a>
      </p>
      <p>
        <a href="/settings">Settings</a>
      </p>
    </Layout>
  );
};

export default SettingsPage;
