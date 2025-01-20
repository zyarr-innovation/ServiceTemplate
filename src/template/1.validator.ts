// Function to map types from propertyMap to zod types
const mapTypeToZod = (key: string, value: any) => {
  const baseType = typeof value.value;
  let zodType;

  switch (baseType) {
    case "string":
      zodType = "z.string()";
      break;
    case "number":
      zodType = "z.number()";
      break;
    case "boolean":
      zodType = "z.boolean()";
      break;
    case "object":
      if (Array.isArray(value.value)) {
        zodType = `z.array(z.string())`; // Assuming arrays contain strings
      } else if (value.value === null) {
        zodType = "z.string().nullable()"; // Null represents an unknown or any type
      } else {
        zodType = "z.object({})"; // Simplified for nested objects
      }
      break;
    default:
      zodType = "z.any()"; // Fallback for unrecognized types
  }

  if (value.type === "optional") {
    zodType += ".optional()";
  }

  return `${key}: ${zodType}`;
};

// Generate zod schema
const generateZodSchema = (properties: any) => {
  const schemaFields = Object.entries(properties)
    .map(([key, value]) => mapTypeToZod(key, value))
    .join(",\n  ");
  return `const ${propertyMap.name.toLowerCase()}Schema = z.object({\n  ${schemaFields}\n});`;
};

function createValidatorFromObjectMap(propertyMap: IPropertyMap): string {
  const schemaCode = generateZodSchema(propertyMap.properties);
  const fileContent = `import { Request, Response, NextFunction } from "express";
  import { z } from "zod";
  import { handleValidationError } from "../common/validation-error";

  ${schemaCode}

  const validate${propertyMap.name} = (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      // Validate request body against schema
      ${propertyMap.name.toLowerCase()}.parse(request.body);
      next();
    } catch (error) {
      // Use the common error handler
      handleValidationError(error, response, next);
    }
  };

  export { validate${propertyMap.name} };
  `;

  return fileContent;
}
