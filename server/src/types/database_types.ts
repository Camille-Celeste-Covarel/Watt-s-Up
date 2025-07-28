import type { Dialect } from "sequelize";

export type DbConfig = {
  user: string | undefined;
  password: string | undefined;
  database: string | undefined;
  host: string | undefined;
  port: string | undefined;
  dialect: string | undefined;
  nodeEnv: string | undefined;
};

export type ValidDbConfig = {
  user: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
  nodeEnv: string | undefined;
};
