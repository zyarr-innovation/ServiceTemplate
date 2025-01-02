// tenant/service.ts
import { inject, injectable } from "inversify";
import { Sequelize, Transaction } from "sequelize";
import jwt from "jsonwebtoken";

import TYPES from "../../../ioc/types";
import { container } from "../../../ioc/container";

import { ILogger } from "../logger/model";
import { ITenant } from "./model";
import { initModels } from "../../../ioc/init-models";

@injectable()
export class ServiceTenant {
  private logger: ILogger;
  private tenantData: { [tenantId: string]: ITenant } = {};

  constructor() {
    this.logger = container.get(TYPES.LoggerService);
  }

  storeTenantConfiguration(tenantList: ITenant[]) {
    tenantList.forEach((tenant) => {
      if (this.tenantData[tenant.id]) {
        this.logger.error(
          `Tenant with ID ${tenant.id} already exists. Overwriting.`
        );
      }
      this.tenantData[tenant.id] = tenant;
    });
  }

  isValidTenant(tenantId: string) {
    return Boolean(this.tenantData[tenantId]);
  }

  async connect() {
    try {
      await Promise.all(
        Object.entries(this.tenantData).map(async ([tenantId, tenant]) => {
          const { connectionUri, username, password, options } =
            tenant.database;
          const databaseConnection = new Sequelize(connectionUri, {
            username,
            password,
            dialect: options.dialect as any,
            pool: options.pool,
          });
          await databaseConnection.authenticate();
          await initModels(tenant.name, databaseConnection);
          this.tenantData[tenantId].database.connection = databaseConnection;
        })
      );
    } catch (error: any) {
      this.logger.error(`Failed to connect the database: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    try {
      await Promise.all(
        Object.entries(this.tenantData).map(async ([tenantId, tenant]) => {
          const { connection } = tenant.database;
          if (connection) {
            await connection.close();
          }
        })
      );
    } catch (error: any) {
      this.logger.error(`Failed to disconnect the database: ${error.message}`);
    }
  }

  getTenantName(tenantId: string) {
    return this.tenantData[tenantId]?.name || null;
  }

  getConnection(tenantId: string) {
    return this.tenantData[tenantId]?.database?.connection || null;
  }

  async executeTransaction(tenantId: string) {
    const connection = this.getConnection(tenantId);
    if (!connection) {
      throw new Error("Database connection not available for the tenant");
    }
    return connection.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });
  }

  async verifyToken(tenantId: string, token: string) {
    const tenant = this.tenantData[tenantId];
    if (!tenant) {
      throw new Error("Tenant Not Found");
    }

    const { clientId, clientSecret } = tenant.authentication;
    try {
      jwt.verify(token, clientSecret, { audience: clientId });
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to validate the token: ${error.message}`);
      return false;
    }
  }
}
