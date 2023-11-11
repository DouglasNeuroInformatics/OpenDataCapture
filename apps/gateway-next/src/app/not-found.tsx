import Image from 'next/image';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-3 text-center">
      <Image priority alt="logo" className="h-12 w-auto" height={259} src="/logo.png" width={320} />
      <div className="space-y-1">
        <h1 className="text-muted text-sm font-semibold uppercase tracking-wide">404 Error</h1>
        <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">Page Not Found</h3>
        <p className="text-muted mt-2 max-w-prose text-sm sm:text-base">
          {"Sorry, we couldn't find the page you're looking for."}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
