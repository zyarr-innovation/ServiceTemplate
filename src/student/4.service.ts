import { inject } from "inversify";
import TYPE from "../ioc/types";
import { container } from "../ioc/container";

import { IStudent } from "./0.model";
import { IServiceStudent } from "./3.service.model";
import { IRepoStudent } from "./5.repo.model";

export class ServiceStudentImpl implements IServiceStudent {
  private repoService!: IRepoStudent;

  constructor() {
    this.repoService = container.get(TYPE.RepoStudent);
  }

  async get(studentId: number): Promise<IStudent | null> {
    const retObject = await this.repoService.getById(studentId);
    return retObject;
  }
  async create(studentInfo: IStudent): Promise<IStudent | null> {
    const retObject = await this.repoService.create(studentInfo);
    return retObject;
  }
  async update(studentInfo: IStudent): Promise<IStudent | null> {
    const retObject = await this.repoService.update(studentInfo);
    return retObject;
  }
  async delete(studentId: number) {
    await this.repoService.delete(studentId);
  }
}
