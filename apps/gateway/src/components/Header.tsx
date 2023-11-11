import { Branding } from './Branding';

export const Header = () => {
  return (
    <header className="bg-white text-slate-700 shadow dark:bg-slate-800 dark:text-slate-300">
      <div className="container py-2">
        <Branding />
      </div>
    </header>
  );
};
