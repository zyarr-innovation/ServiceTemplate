import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import dotenv from "dotenv";

import { serverConfig } from "./server/0.server-config";
import { container } from "../ioc/container";
import { LoggerService } from "./service/Logger/1.service";
import { MiddlewareProvider } from "./service/middleware/service";
import { inject } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";

export default class App {
  @inject(MiddlewareProvider)
  middlewareService!: MiddlewareProvider;

  @inject(LoggerService)
  private logger!: LoggerService;

  constructor() {}

  public init(): Application {
    const app: Application = express();
    const server = new InversifyExpressServer(
      container,
      null,
      { rootPath: "/v1" },
      null,
      null,
      false
    );

    server.setConfig((app: Application) => {
      app.use(express.json({ limit: serverConfig.limit }));
      app.use(express.urlencoded({ extended: true }));
      app.use(express.static(path.join(__dirname, serverConfig.CLIENT_PATH)));

      this.initSecurity(app);
    });

    server.setErrorConfig((app: Application) => {
      app.use(this.middlewareService.middlewareException);
    });

    return server.build();
  }

  private initSecurity(app: Application) {
    app.use(cors(serverConfig.corsOption));
    app.use(helmet());
    app.use(this.middlewareService.middlewareValidateTenant);
  }
}
