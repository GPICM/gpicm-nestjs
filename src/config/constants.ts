/* eslint-disable prettier/prettier */

export type Constants = {
  node_env: string;
  databaseUrl: string;
};

const constants: Constants = {
  node_env:                 process.env.NODE_ENV ?? "development",
  databaseUrl:              String(process.env.DATABASE_URL),
};

export { constants };
