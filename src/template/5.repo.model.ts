function createRepoModelFromObjectMap(propertyMap: IPropertyMap): string {
  const interfaceName = `IRepo${propertyMap.name}`;
  const modelName = `I${propertyMap.name}`;
  const dtoName = `DTO${propertyMap.name}`;

  const repositoryInterfaceCode = `
    import { Sequelize, Transaction } from "sequelize";

    import { ${modelName} } from "./0.model";
    import { ${dtoName} } from "./7.dto.model";

    export interface ${interfaceName} {
      isExist(in${propertyMap.name}Id: number): Promise<boolean>;
      getById(in${propertyMap.name}Id: number): Promise<${modelName} | null>;
      create(
        in${propertyMap.name}: ${modelName},
        transaction?: Transaction
      ): Promise<${modelName} | null>;
      update(
        ${propertyMap.name.toLowerCase()}Id: number,
        in${propertyMap.name}: ${modelName},
        transaction?: Transaction
      ): Promise<number>;
      delete(in${
        propertyMap.name
      }Id: number, transaction?: Transaction): Promise<number>;
      convertToObject(srcObject: ${dtoName}): ${modelName};
    }
    `;

  return repositoryInterfaceCode;
}
