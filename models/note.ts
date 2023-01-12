import {  DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db";

interface Note {
  id: number;
  content: string;
  important: boolean;
  date: string;
}

class Note extends Model {} // note is derived from model

Note.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // main key of the table
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    important: {
      type: DataTypes.BOOLEAN,
    },
    date: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    underscored: true, // model names that are derived will be converted to underscored names
    timestamps: false, // table doesn't have to use created_at & updated_at
    modelName: "note",
  }
);

export { Note };