const generatePropertyDefinition = (key: string, definition: any) => {
  const dataTypeMap: Record<string, string> = {
    string: "DataTypes.STRING",
    number: "DataTypes.INTEGER",
    boolean: "DataTypes.BOOLEAN",
    object: "DataTypes.JSON",
    array: "DataTypes.ARRAY(DataTypes.STRING)",
  };

  const type: keyof typeof dataTypeMap = Array.isArray(definition.value)
    ? "array"
    : typeof definition.value === "object" && definition.value !== null
    ? "object"
    : typeof definition.value;

  return `
        ${key}: {
          type: ${dataTypeMap[type] || "DataTypes.STRING"},
          allowNull: ${definition.type === "required" ? "false" : "true"},
        },`;
};

function createDtoModelFromObjectMap(propertyMap: IPropertyMap): string {
  const dtoClassName = `DTO${propertyMap.name}`;
  const tableName = propertyMap.name.toLowerCase();

  const dtoModelCode = `
  import { Sequelize, Model, DataTypes } from "sequelize";
  import { I${propertyMap.name} } from "./0.model";

  export class ${dtoClassName} extends Model {
  ${Object.keys(propertyMap.properties)
    .map(
      (key) =>
        `  ${key}${
          propertyMap.properties[key].type === "optional" ? "?" : "!"
        }: ${typeof propertyMap.properties[key].value};`
    )
    .join("\n")}
  }

  export const init${dtoClassName}Model = (
    schemaName: string,
    sequelize: Sequelize
  ) => {
    ${dtoClassName}.init(
      {${Object.entries(propertyMap.properties)
        .map(([key, definition]) => generatePropertyDefinition(key, definition))
        .join("")}
      },
      {
        sequelize,
        schema: schemaName,
        tableName: "${tableName}",
        timestamps: false,
      }
    );
  };
  `;

  return dtoModelCode;
}
