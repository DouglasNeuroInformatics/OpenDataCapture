declare type ConfigFactory = (
  options?:
    | {
        content?: string[] | undefined;
        include?: string[] | undefined;
        plugins?: any[] | undefined;
        root?: string | undefined;
      }
    | undefined
) => import('tailwindcss').Config;

declare const createConfig: ConfigFactory;

export { createConfig, type ConfigFactory };
