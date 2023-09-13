export type SetupState = {
  isSetup: boolean | null;
};

export type SetupOptions = {
  admin: {
    username: string;
    password: string;
  };
  initDemo?: boolean;
};
