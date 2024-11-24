import "reflect-metadata";
import { inject } from "inversify";
import sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/../.env` });

import { LoggerService } from "../service/Logger/1.service";
import { Application } from "express";
import http, { Server as HttpServer } from "http";
import app from "../app";
import { serverConfig } from "./0.server-config";
import { ServerHealth } from "./2.server-health";
import { ServiceTenant } from "../service/tenant/1.service";
import { ILogger } from "../service/Logger/0.model";

export class Server {
  @inject(LoggerService)
  private logger!: ILogger;

  @inject(ServiceTenant)
  private tenantService!: ServiceTenant;

  private app: Application;
  private server!: HttpServer;
  private healthServer!: ServerHealth;
  private isServerRunning: boolean = false;

  constructor() {
    this.app = new app().init();
    this.server = http.createServer(this.app);
    this.healthServer = new ServerHealth(this.logger);
  }

  async startServer(): Promise<void> {
    try {
      this.tenantService.storeTenantConfiguration(serverConfig.tenantList);
      await this.tenantService.connect();

      this.server.listen(serverConfig.port, async () => {
        this.logger.info(`Server Started at port ${serverConfig.port}`);
        try {
          await this.healthServer.start(Number(serverConfig.healthPort));
          this.isServerRunning = true;
        } catch (err) {
          this.logger.error("Failed to start the Health Server: " + err);
          await this.stopServer(); // Ensures cleanup if health server fails
        }
      });
    } catch (err) {
      this.logger.error("Failed to start the server: " + err);
    }
  }

  async stopServer(): Promise<void> {
    if (!this.isServerRunning) {
      this.logger.warn("Server is not running, skipping stop sequence.");
      return;
    }

    try {
      this.server.close(async (err) => {
        if (err) {
          this.logger.error("Error while closing the server: " + err);
        }

        await this.tenantService.disconnect();
        await this.healthServer.stop();
        this.logger.info(`Server Closed at port ${serverConfig.port}`);
        this.isServerRunning = false;
      });
    } catch (err) {
      this.logger.error("Error during server shutdown: " + err);
    }
  }
}
