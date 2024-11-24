import { IStudent } from "./0.model";

export interface IServiceStudent {
  get(studentId: number): Promise<IStudent | null>;
  create(studentInfo: IStudent): Promise<IStudent | null>;
  update(studentInfo: IStudent): Promise<IStudent | null>;
  delete(studentId: number): Promise<void>;
}
