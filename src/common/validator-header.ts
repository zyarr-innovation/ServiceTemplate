import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { handleValidationError } from "./validation-error";

// Define the schema using zod
const headerSchema = z.object({
  tenantid: z.string().min(1, "tenantId is required"),
  traceparent: z.string().min(1, "traceparent is required"),
  authorization: z.string().min(1, "authorization is required"),
});

// Middleware for validating headers
const validateHeaders = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    // Validate request headers
    headerSchema.parse(request.headers);
    next();
  } catch (error) {
    // Use the common error handler
    handleValidationError(error, response, next);
  }
};

export { validateHeaders };
