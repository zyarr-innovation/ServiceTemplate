import { Sequelize, Model, DataTypes } from "sequelize";
import { IStudent } from "./0.model";

export class DTOStudent extends Model {
  Id?: number;
  name!: string;
  adhaar!: string;
  school!: string;
}

export const initDTOStudentModel = (
  schemaName: string,
  sequelize: Sequelize
) => {
  DTOStudent.init(
    {
      Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      adhaar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      school: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      schema: schemaName,
      tableName: "student",
      timestamps: false,
    }
  );
};
