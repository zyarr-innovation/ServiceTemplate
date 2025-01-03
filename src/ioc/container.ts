import { Container } from "inversify";
import TYPES from "./types";

import { BaseController } from "../common/base-controller";
import { ILogger, LoggerService } from "../common/service/logger.service";
import { ServiceTenant } from "../common/service/tenant.service";
import { RequestContextProvider } from "../common/service/request-context.service";
import { MiddlewareProvider } from "../common/service/middleware.service";

import { ControllerStudent } from "../student/2.controller";
import { IServiceStudent } from "../student/3.service.model";
import { ServiceStudentImpl } from "../student/4.service";
import { IRepoStudent } from "../student/5.repo.model";
import { RepoStudentImpl } from "../student/6.repo";
import { Validate } from "../common/validate";


const container = new Container();
container.bind<ILogger>(TYPES.LoggerService).to(LoggerService);
container.bind(ServiceTenant).toSelf().inSingletonScope();
container.bind(RequestContextProvider).toSelf().inSingletonScope();
container.bind(MiddlewareProvider).toSelf().inSingletonScope();
container.bind<Validate>(Validate).to(Validate);

container
  .bind<ControllerStudent>(TYPES.ControllerStudent)
  .to(ControllerStudent);
container.bind<IServiceStudent>(TYPES.ServiceStudent).to(ServiceStudentImpl);
container.bind<IRepoStudent>(TYPES.RepoStudent).to(RepoStudentImpl);

export { container };
