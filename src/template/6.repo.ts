function createRepoImplFromObjectMap(propertyMap: IPropertyMap): string {
  const repoClassName = `Repo${propertyMap.name}Impl`;
  const interfaceName = `IRepo${propertyMap.name}`;
  const modelName = `I${propertyMap.name}`;
  const dtoName = `DTO${propertyMap.name}`;

  const repositoryImplementationCode = `
  import { Model, Sequelize, Transaction } from "sequelize";
  import { injectable } from "inversify";
  import { ${modelName} } from "./0.model";
  import { ${interfaceName} } from "./5.repo.model";
  import { ${dtoName} } from "./7.dto.model";
  import { RequestContextProvider } from "../common/service/request-context.service";
  import { container } from "../ioc/container";

  @injectable()
  export class ${repoClassName} implements ${interfaceName} {
    private getModel<T extends typeof Model>(model: T): T {
      const contextProvider = container.get(RequestContextProvider);
      const context = contextProvider.get();

      if (!context || !context.databaseConnection) {
        throw new Error("Sequelize instance not found in context");
      }

      const modelInstance = context.databaseConnection.model(model.name) as T;
      if (!modelInstance) {
        throw new Error(\`Model \${model.name} not initialized\`);
      }

      return modelInstance;
    }

    async isExist(in${propertyMap.name}Id: number): Promise<boolean> {
      const ${propertyMap.name}Model = this.getModel(${dtoName});
      const found = await ${propertyMap.name}Model.findOne({
        where: { Id: in${propertyMap.name}Id },
      });
      return found !== null;
    }

    async getById(in${
      propertyMap.name
    }Id: number): Promise<${modelName} | null> {
      const ${propertyMap.name}Model = this.getModel(${dtoName});
      const foundObj = await ${propertyMap.name}Model.findOne<${dtoName}>({
        where: { Id: in${propertyMap.name}Id },
      });
      if (foundObj?.dataValues) {
        return this.convertToObject(foundObj?.dataValues);
      }
      return null;
    }

    async create(
      in${propertyMap.name}: Partial<${modelName}>,
      transaction?: Transaction
    ): Promise<${modelName} | null> {
      const ${propertyMap.name}Model = this.getModel(${dtoName});
      const createdObj = await ${propertyMap.name}Model.create(in${
    propertyMap.name
  }, {
        transaction,
      });
      return this.convertToObject(createdObj.dataValues);
    }

    async update(
      ${propertyMap.name.toLowerCase()}Id: number,
      in${propertyMap.name}: ${modelName},
      transaction?: Transaction
    ): Promise<number> {
      const ${propertyMap.name}Model = this.getModel(${dtoName});

      const [count] = await ${propertyMap.name}Model.update(in${
    propertyMap.name
  }, {
        where: { Id: ${propertyMap.name.toLowerCase()}Id },
        transaction,
      });

      return count;
    }

    async delete(
      in${propertyMap.name}Id: number,
      transaction?: Transaction
    ): Promise<number> {
      const ${propertyMap.name}Model = this.getModel(${dtoName});
      const count = await ${propertyMap.name}Model.destroy({
        where: { Id: in${propertyMap.name}Id },
        transaction,
      });
      return count;
    }

    convertToObject(srcObject: ${dtoName}): ${modelName} {
      return {
  ${Object.keys(propertyMap.properties)
    .map((key) => `      ${key}: srcObject.${key},`)
    .join("\n")}
      };
    }
  }
  `;

  return repositoryImplementationCode;
}
