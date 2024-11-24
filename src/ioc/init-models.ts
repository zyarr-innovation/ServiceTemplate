import { Sequelize } from "sequelize";
import { initDTOStudentModel } from "../student/7.dto.model";

export async function initModels(schemaName: string, sequelize: Sequelize) {
  initDTOStudentModel(schemaName, sequelize);
  sequelize.sync();
}
