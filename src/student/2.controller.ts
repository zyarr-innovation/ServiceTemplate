import { Request, Response } from "express";
import { inject } from "inversify";
import {
  controller,
  httpGet,
  httpPost,
  httpPatch,
  httpDelete,
  request,
  response,
} from "inversify-express-utils";

import { ILogger, LoggerService } from "../common/service/logger.service";
import TYPES from "../ioc/types";
import { container } from "../ioc/container";

import { BaseController } from "../common/base-controller";
import { HttpStatusCode } from "../common/constant/http-status-code";
import { validateId } from "../common/validator-id";

import { IStudent } from "./0.model";
import { validateStudent } from "./1.validator";
import { IServiceStudent } from "./3.service.model";


@controller("/student")
export class ControllerStudent extends BaseController {
  private logger: ILogger;
  private serviceStudent: IServiceStudent;

  constructor() {
    super();
    this.logger = container.get(TYPES.LoggerService);
    this.serviceStudent = container.get(TYPES.ServiceStudent);
  }

  // Middleware to handle headers and set common response headers
  private setCommonHeaders(res: Response) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000, includeSubDomains"
    );
  }

  @httpGet("/", validateId)
  async get(@request() req: Request, @response() res: Response) {
    try {
      const student = await this.serviceStudent.get(req.body);
      this.setCommonHeaders(res);
      res.status(HttpStatusCode.OK).json(student);
    } catch (error: any) {
      this.logger.error(error);
      return this.handleError(error, res);
    }
  }

  @httpPost("/", validateStudent)
  async create(@request() req: Request, @response() res: Response) {
    try {
      const status = await this.serviceStudent.create(req.body);
      this.setCommonHeaders(res);
      res.status(HttpStatusCode.OK).json(status);
    } catch (error: any) {
      this.logger.error(error);
      return this.handleError(error, res);
    }
  }

  @httpPatch("/", validateId, validateStudent)
  async update(@request() req: Request, @response() res: Response) {
    try {
      const status = await this.serviceStudent.update(req.body);
      this.setCommonHeaders(res);
      res.status(HttpStatusCode.OK).json(status);
    } catch (error: any) {
      this.logger.error(error);
      return this.handleError(error, res);
    }
  }

  @httpDelete("/", validateId)
  async delete(@request() req: Request, @response() res: Response) {
    try {
      const status = await this.serviceStudent.delete(req.body);
      this.setCommonHeaders(res);
      res.status(HttpStatusCode.OK).json(status);
    } catch (error: any) {
      this.logger.error(error);
      return this.handleError(error, res);
    }
  }
}
