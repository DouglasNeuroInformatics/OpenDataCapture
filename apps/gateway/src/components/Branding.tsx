import Image from 'next/image';

export const Branding = () => (
  <div className="flex items-center p-1 md:p-2">
    <Image priority alt="logo" className="mr-3 h-10 w-auto" height={259} src="/logo.png" width={320} />
    <span className="hidden font-bold leading-tight tracking-tight subpixel-antialiased sm:block">
      Open Data Capture
    </span>
  </div>
);
