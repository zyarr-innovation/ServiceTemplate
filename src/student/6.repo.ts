import { Model, Sequelize, Transaction } from "sequelize";
import { injectable } from "inversify";
import { IStudent } from "./0.model";
import { IRepoStudent } from "./5.repo.model";
import { DTOStudent } from "./7.dto.model";
import { RequestContextProvider } from "../common/service/request-context.service";
import { container } from "../ioc/container";

@injectable()
export class RepoStudentImpl implements IRepoStudent {
  private getModel<T extends typeof Model>(model: T): T {
    const contextProvider = container.get(RequestContextProvider);
    const context = contextProvider.get();

    if (!context || !context.databaseConnection) {
      throw new Error("Sequelize instance not found in context");
    }

    const modelInstance = context.databaseConnection.model(model.name) as T;
    if (!modelInstance) {
      throw new Error(`Model ${model.name} not initialized`);
    }

    return modelInstance;
  }

  async isExist(inStudentId: number): Promise<boolean> {
    const StudentModel = this.getModel(DTOStudent);
    const found = await StudentModel.findOne({
      where: { Id: inStudentId },
    });
    return found !== null;
  }

  async getById(inStudentId: number): Promise<IStudent | null> {
    const StudentModel = this.getModel(DTOStudent);
    const foundObj = await StudentModel.findOne<DTOStudent>({
      where: { Id: inStudentId },
    });
    if (foundObj) {
      return this.convertToObject(foundObj);
    }
    return null;
  }

  async create(
    inStudent: Partial<IStudent>,
    transaction?: Transaction
  ): Promise<IStudent | null> {
    const StudentModel = this.getModel(DTOStudent);
    const createdObj = await StudentModel.create(inStudent, {
      transaction,
    });
    return this.convertToObject(createdObj);
  }

  async update(
    inStudent: IStudent,
    transaction?: Transaction
  ): Promise<IStudent | null> {
    const StudentModel = this.getModel(DTOStudent);
    const [count, updatedObj] = await StudentModel.update(inStudent, {
      where: { Id: inStudent.Id },
      transaction,
      returning: true,
    });
    return updatedObj.length ? this.convertToObject(updatedObj[0]) : null;
  }

  async delete(inStudentId: number, transaction?: Transaction) {
    const StudentModel = this.getModel(DTOStudent);
    await StudentModel.destroy({
      where: { Id: inStudentId },
      transaction,
    });
  }

  convertToObject(srcObject: DTOStudent): IStudent {
    return {
      Id: srcObject.Id,
      name: srcObject.name,
      adhaar: srcObject.adhaar,
      school: srcObject.school,
    };
  }
}
