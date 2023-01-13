import { Sequelize } from "sequelize";
import { DATABASE_URL } from "./config";
import "dotenv/config";
require("dotenv").config();

const sequelize = new Sequelize(DATABASE_URL!, { logging: false }); 
// added ! to tell typescript that it's not undefin

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("database connected");
  } catch (err) {
    console.log("connecting database failed");
    return process.exit(1);
  }

  return null;
};

export { sequelize, connectToDatabase };
