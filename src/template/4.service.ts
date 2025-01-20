function createServiceImplFromObjectMap(propertyMap: IPropertyMap): string {
  const serviceName = `Service${propertyMap.name}Impl`;
  const interfaceName = `IService${propertyMap.name}`;
  const modelName = `I${propertyMap.name}`;
  const repoInterfaceName = `IRepo${propertyMap.name}`;
  const repoTypeName = `Repo${propertyMap.name}`;

  const serviceImplementationCode = `
  import { inject } from "inversify";
  import TYPE from "../ioc/types";
  import { container } from "../ioc/container";

  import { ${modelName} } from "./0.model";
  import { ${interfaceName} } from "./3.service.model";
  import { ${repoInterfaceName} } from "./5.repo.model";

  export class ${serviceName} implements ${interfaceName} {
    private repoService!: ${repoInterfaceName};

    constructor() {
      this.repoService = container.get(TYPE.${repoTypeName});
    }

    async get(in${propertyMap.name}Id: number): Promise<${modelName} | null> {
      const retObject = await this.repoService.getById(in${propertyMap.name}Id);
      return retObject;
    }

    async create(in${propertyMap.name}Info: ${modelName}): Promise<${modelName} | null> {
      const retObject = await this.repoService.create(in${propertyMap.name}Info);
      return retObject;
    }

    async update(in${propertyMap.name}Id: number, in${propertyMap.name}Info: ${modelName}): Promise<number> {
      const retObject = await this.repoService.update(in${propertyMap.name}Id, in${propertyMap.name}Info);
      return retObject;
    }

    async delete(in${propertyMap.name}Id: number): Promise<number> {
      const retObject = await this.repoService.delete(in${propertyMap.name}Id);
      return retObject;
    }
  }
  `;
  return serviceImplementationCode;
}
