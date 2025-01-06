import { Sequelize, Transaction } from "sequelize";

import { IStudent } from "./0.model";
import { DTOStudent } from "./7.dto.model";

export interface IRepoStudent {
  isExist(inStudentId: number): Promise<boolean>;
  getById(inStudentId: number): Promise<IStudent | null>;
  create(
    inStudent: IStudent,
    transaction?: Transaction
  ): Promise<IStudent | null>;
  update(
    studentId: number,
    inStudent: IStudent,
    transaction?: Transaction
  ): Promise<number>;
  delete(inStudentId: number, transaction?: Transaction): Promise<number>;
  convertToObject(srcObject: DTOStudent): IStudent;
}
