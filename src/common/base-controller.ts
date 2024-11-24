import express from "express";
import { inject, injectable } from "inversify";

import TYPES from "../ioc/types";
import { HttpStatusCode } from "./constant/http-status-code";
import { ILogger } from "./service/Logger/0.model";

export class BaseController {
  constructor() {}

  public handleError(err: Error, res: express.Response) {
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
