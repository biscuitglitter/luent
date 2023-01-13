import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";

class User extends Model {}

interface User {
  id: number;
  username: string;
  name: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "user",
  }
);

export { User };