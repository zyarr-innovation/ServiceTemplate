import "reflect-metadata";
import { Container } from "inversify";
import TYPES from "./types";

const container = new Container();

import { BaseController } from "../common/base-controller";
import { ILogger } from "../common/service/Logger/0.model";
import { LoggerService } from "../common/service/Logger/1.service";

import { ControllerStudent } from "../student/2.controller";
import { IServiceStudent } from "../student/3.service.model";
import { ServiceStudentImpl } from "../student/4.service";
import { IRepoStudent } from "../student/5.repo.model";
import { RepoStudentImpl } from "../student/6.repo";
import { ServiceTenant } from "../common/service/tenant/1.service";
import { RequestContextProvider } from "../common/service/RequestContext/service";

container.bind<BaseController>(TYPES.BaseController).to(BaseController);
container.bind(RequestContextProvider).toSelf().inSingletonScope();

container.bind<ILogger>(TYPES.ServiceLogger).to(LoggerService);
container.bind<ServiceTenant>(TYPES.ServiceTenant).to(ServiceTenant);

container
  .bind<ControllerStudent>(TYPES.ControllerStudent)
  .to(ControllerStudent);
container.bind<IServiceStudent>(TYPES.ServiceStudent).to(ServiceStudentImpl);
container.bind<IRepoStudent>(TYPES.RepoStudent).to(RepoStudentImpl);

export { container };
