import express from "express";
import { inject, injectable } from "inversify";

import { HttpStatusCode } from "./constant/http-status-code";
import TYPES from "../ioc/types";
import { LoggerService } from "./service/Logger/1.service";

@injectable()
export class BaseController {
  @inject(TYPES.ServiceLogger)
  protected logger!: LoggerService;

  public handleError(err: Error, res: express.Response) {
    this.logger.error(err);

    let errorCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
    let errorMessage = err.message || "Internal Server Error";

    if (err instanceof Error) {
      switch (err.name) {
        case "SequelizeUniqueConstraintError":
          errorCode = HttpStatusCode.CONFLICT_RESOURCE_ALREADY_EXISTS;
          errorMessage = "Resource already exists.";
          break;
        case "ValidationError":
          errorCode = HttpStatusCode.BAD_REQUEST;
          errorMessage = "Invalid data provided.";
          break;
        case "NotFoundError":
          errorCode = HttpStatusCode.NOT_FOUND;
          errorMessage = "Resource not found.";
          break;
        // Add additional error handling as needed
        default:
          errorCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
          errorMessage = err.message;
          break;
      }
    }

    // Send back the error response
    return res.status(errorCode).json({
      status: "error",
      code: errorCode,
      message: errorMessage,
    });
  }
}
