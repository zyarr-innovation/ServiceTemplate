import { IStudent } from "./0.model";

export interface IServiceStudent {
  get(studentId: number): Promise<IStudent | null>;
  create(studentInfo: IStudent): Promise<IStudent | null>;
  update(studentId: number, studentInfo: IStudent): Promise<number>;
  delete(studentId: number): Promise<number>;
}
