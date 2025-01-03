import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { handleValidationError } from "./validation-error";

// Define the schema using zod
const idSchema = z.object({
  id: z.string().min(1, "Id is required"),
});

// Middleware for validating headers
const validateId = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    // Validate request headers
    idSchema.parse(request.headers);
    next();
  } catch (error) {
    // Use the common error handler
    handleValidationError(error, response, next);
  }
};

export { validateId };
