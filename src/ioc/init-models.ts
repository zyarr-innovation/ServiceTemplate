import { Sequelize } from "sequelize";
import { initDTOSchoolModel } from "../school/7.dto.model";
import { initDTOStudentModel } from "../student/7.dto.model";

export async function initModels(schemaName: string, sequelize: Sequelize) {
  initDTOSchoolModel(schemaName, sequelize);
  initDTOStudentModel(schemaName, sequelize);
  sequelize.sync();
}
