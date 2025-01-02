import { Request, Response, NextFunction } from "express";
import TYPES from "../../../ioc/types";
import { container } from "../../../ioc/container";

import { ILogger } from "../logger/model";
import { CONSTANT } from "../../constant/constant";

import { ServiceTenant } from "../tenant/service";
import { HttpStatusCode } from "../../constant/http-status-code";
import { RequestContextProvider } from "../request-context/service";
import { RequestContext } from "../request-context/model";
import { validateHeaders } from "../../validator-header";

export class MiddlewareProvider {
  private logger: ILogger;
  private tenantService: ServiceTenant;

  constructor() {
    this.logger = container.get(TYPES.LoggerService);
    this.tenantService = container.get(ServiceTenant);
  }

  // Middleware to handle exception and modify response body
  public middlewareException(req: Request, res: Response, next: NextFunction) {
    res.setHeader(
      CONSTANT.SECURITY.STRICT_TRANSPORT_SECURITY,
      CONSTANT.SECURITY.MAX_AGE
    );

    const originalSend = res.send;
    res.send = function (data) {
      try {
        if (res?.statusCode && data) {
          const resBody = JSON.parse(data);
          if (resBody?.Error) {
            data = { code: res.statusCode, error: resBody.Error };
          }
        }
      } catch (err: any) {
        console.warn(`Error parsing response body: ${err.message}`);
      }
      return originalSend.call(this, data);
    };
    next();
  }

  // Main middleware to validate tenant information
  public async middlewareValidateTenant(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Validate headers
      validateHeaders(req, res, async () => {
        const tenantId = await this.extractTenantId(req);
        if (!tenantId) {
          return next({
            code: HttpStatusCode.BAD_REQUEST,
            message: CONSTANT.MESSAGE.TENANT_ID_MISSING,
          });
        }

        // Validate tenant existence and token
        const token = this.extractToken(req);
        const [isValidTenant, isValidToken] = await Promise.all([
          this.tenantService.isValidTenant(tenantId),
          this.tenantService.verifyToken(tenantId, token),
        ]);

        if (!isValidTenant || !isValidToken) {
          return next({
            code: HttpStatusCode.FORBIDDEN,
            message: CONSTANT.MESSAGE.ACCESS_DENIED,
          });
        }

        // Setup request context
        await this.setupRequestContext(req, tenantId);

        next();
      });
    } catch (error) {
      next(error);
    }
  }

  // Extract tenant ID from request headers
  private extractTenantId(req: Request): string | null {
    return (req.headers["tenantid"] as string) ?? null;
  }

  // Extract token from the request headers
  private extractToken(req: Request): string {
    return (req.headers["authorization"]?.replace("bearer ", "") ??
      "") as string;
  }

  // Setup request context with tenant information
  private async setupRequestContext(
    req: Request,
    tenantId: string
  ): Promise<void> {
    const requestHeaders = {
      tenantid: tenantId,
      traceparent: req.headers["traceparent"] as string,
      authorization: req.headers["authorization"] as string,
    };

    const contextProvider = container.get(RequestContextProvider);
    const context = new RequestContext();
    context.tenantId = tenantId;
    context.tenantName = this.tenantService.getTenantName(tenantId);
    context.traceparent = requestHeaders.traceparent;
    context.databaseConnection = this.tenantService.getConnection(tenantId);

    contextProvider.run(context, () => {});
  }
}
