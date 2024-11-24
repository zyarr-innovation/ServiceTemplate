import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { handleValidationError } from "../common/validation-error";

// Define the schema
const studentSchema = z.object({
  name: z.string().min(1, "name is required"),
  adhaar: z.string().min(1, "adhaar is required"),
  school: z.string().min(1, "school is required"),
});

// Middleware for validation
const validateStudent = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    // Validate request body against schema
    studentSchema.parse(request.body);
    next();
  } catch (error) {
    // Use the common error handler
    handleValidationError(error, response, next);
  }
};

export { validateStudent };
