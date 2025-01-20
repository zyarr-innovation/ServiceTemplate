function createControllerFromObjectMap(propertyMap: IPropertyMap): string {
  const className = `Controller${propertyMap.name}`;
  const serviceName = `Service${propertyMap.name}`;
  const validateFunction = `validate${propertyMap.name}`;
  const modelInterface = `I${propertyMap.name}`;

  const controllerCode = `
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
    httpPut,
  } from "inversify-express-utils";

  import { ILogger, LoggerService } from "../common/service/logger.service";
  import TYPES from "../ioc/types";
  import { container } from "../ioc/container";

  import { BaseController } from "../common/base-controller";
  import { HttpStatusCode } from "../common/constant/http-status-code";
  import { validateId } from "../common/validator-id";

  import { ${modelInterface} } from "./0.model";
  import { ${validateFunction} } from "./1.validator";
  import { IService${propertyMap.name} } from "./3.service.model";

  @controller("/${propertyMap.name.toLowerCase()}")
  export class ${className} extends BaseController {
    private logger: ILogger;
    private service${propertyMap.name}: IService${propertyMap.name};

    constructor() {
      super();
      this.logger = container.get(TYPES.LoggerService);
      this.service${propertyMap.name} = container.get(TYPES.${serviceName});
    }

    private setCommonHeaders(res: Response) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000, includeSubDomains"
      );
    }

    @httpGet("/:id", validateId)
    async get(@request() req: Request, @response() res: Response) {
      try {
        const id = +req.params.id;
        const ${propertyMap.name.toLowerCase()} = await this.service${
    propertyMap.name
  }.get(id);
        this.logger.info("Retrieved ${propertyMap.name.toLowerCase()}:" + ${propertyMap.name.toLowerCase()});

        this.setCommonHeaders(res);
        if (!${propertyMap.name.toLowerCase()}) {
          return res
            .status(HttpStatusCode.NOT_FOUND)
            .json({ message: "${propertyMap.name} not found" });
        }

        res.status(HttpStatusCode.OK).json(${propertyMap.name.toLowerCase()});
      } catch (error: any) {
        this.logger.error(error);
        return this.handleError(error, res);
      }
    }

    @httpPost("/", ${validateFunction})
    async create(@request() req: Request, @response() res: Response) {
      try {
        const status = await this.service${propertyMap.name}.create(req.body);
        this.setCommonHeaders(res);
        res.status(HttpStatusCode.OK).json(status);
      } catch (error: any) {
        this.logger.error(error);
        return this.handleError(error, res);
      }
    }

    @httpPut("/:id", validateId, ${validateFunction})
    async update(@request() req: Request, @response() res: Response) {
      try {
        const id = +req.params.id;
        const status = await this.service${
          propertyMap.name
        }.update(id, req.body);
        this.setCommonHeaders(res);
        res.status(HttpStatusCode.OK).json(status);
      } catch (error: any) {
        this.logger.error(error);
        return this.handleError(error, res);
      }
    }

    @httpDelete("/:id", validateId)
    async delete(@request() req: Request, @response() res: Response) {
      try {
        const id = +req.params.id;
        const status = await this.service${propertyMap.name}.delete(id);
        this.setCommonHeaders(res);
        res.status(HttpStatusCode.OK).json(status);
      } catch (error: any) {
        this.logger.error(error);
        return this.handleError(error, res);
      }
    }
  }
  `;

  return controllerCode;
}
