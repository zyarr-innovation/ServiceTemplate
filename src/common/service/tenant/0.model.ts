import { Sequelize } from "sequelize";

export interface ITenant {
  id: number;
  name: string;
  authentication: {
    authServer: string;
    clientId: string;
    clientSecret: string;
  };
  database: IDatabase;
}

export interface IDatabase {
  sqlDBName: string;
  connectionUri: string;
  username: string;
  password: string;
  options: {
    dialect: string;
    pool: {
      max: number;
      min: number;
      acquire: number;
      idle: number;
    };
  };
  connection: Sequelize | null;
}
