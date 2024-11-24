import { Request, Response, NextFunction } from "express";
import { ILogger } from "../Logger/0.model";
import { CONSTANT } from "../../constant/constant";

import { ServiceTenant } from "../tenant/1.service";
import { IRequestHeaders } from "../../utility/common-headers";
import { HttpStatusCode } from "../../constant/http-status-code";
import { container } from "../../../ioc/container";
import { RequestContextProvider } from "../RequestContext/service";
import { RequestContext } from "../RequestContext/model";
import { validateHeaders } from "../../validator-header";

export class MiddlewareProvider {
  constructor(private logger: ILogger, private tenantService: ServiceTenant) {
    this.tenantService = tenantService;
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
        if (res && res.statusCode && data) {
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
        // Extract and validate tenant info from headers
        const tenantId = await this.extractTenantId(req);
        if (!tenantId) {
          return next({
            code: HttpStatusCode.BAD_REQUEST,
            message: CONSTANT.MESSAGE.TENANT_ID_MISSING,
          });
        }

        // Validate tenant existence
        if (!(await this.isValidTenant(tenantId))) {
          return next({
            code: HttpStatusCode.FORBIDDEN,
            message: CONSTANT.MESSAGE.ACCESS_DENIED,
          });
        }

        // Validate token
        const token = this.extractToken(req);
        if (!(await this.isValidToken(tenantId, token))) {
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

  // Check if the tenant is valid
  private async isValidTenant(tenantId: string): Promise<boolean> {
    return this.tenantService.isValidTenant(tenantId);
  }

  // Extract token from the request headers
  private extractToken(req: Request): string {
    return (req.headers["authorization"]?.replace("bearer ", "") ??
      "") as string;
  }

  // Validate the token for the tenant
  private async isValidToken(
    tenantId: string,
    token: string
  ): Promise<boolean> {
    return this.tenantService.verifyToken(tenantId, token);
  }

  // Setup request context with tenant information
  private async setupRequestContext(
    req: Request,
    tenantId: string
  ): Promise<void> {
    const requestHeaders: IRequestHeaders = {
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
