import { inject, injectable } from "inversify";
import { LoggerService } from "../Logger/1.service";
import { ITenant } from "./0.model";
import { Sequelize, Transaction } from "sequelize";
import jwt from "jsonwebtoken";
import { initModels } from "../../../ioc/init-models";

@injectable()
export class ServiceTenant {
  @inject(LoggerService)
  protected logger!: LoggerService;

  private tenantData: { [tenantId: string]: ITenant } = {};

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
    return this.tenantData[tenantId] != null;
  }

  async connect() {
    try {
      for (const [tenantId, tenant] of Object.entries(this.tenantData)) {
        const databaseConnection = new Sequelize(
          tenant.database.connectionUri,
          {
            username: tenant.database.username,
            password: tenant.database.password,
            dialect: tenant.database.options.dialect as any,
            pool: tenant.database.options.pool,
          }
        );
        await databaseConnection.authenticate();
        await initModels(tenant.name, databaseConnection);
        this.tenantData[tenantId].database.connection = databaseConnection;
      }
    } catch (error: any) {
      this.logger.error(`Failed to connect the database: ${error.message}`);
    }
  }

  async disconnect() {
    try {
      for (const [tenantId, tenant] of Object.entries(this.tenantData)) {
        if (this.tenantData[tenantId].database.connection) {
          this.tenantData[tenantId].database.connection.close();
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to disconnect the database: ${error.message}`);
    }
  }

  getTenantName(tenantId: string) {
    return this.tenantData[tenantId].name;
  }
  getConnection(tenantId: string) {
    return this.tenantData[tenantId].database.connection;
  }

  async executeTransaction(tenantId: string) {
    const connection = this.tenantData[tenantId]?.database?.connection;
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
