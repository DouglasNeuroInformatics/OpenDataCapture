export type SetupState = {
  isSetup: boolean | null;
};

export type SetupOptions = {
  admin: {
    password: string;
    username: string;
  };
  initDemo?: boolean;
};
