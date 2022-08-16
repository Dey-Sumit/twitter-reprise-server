import logger from "@libs/logger";
import mongoose from "mongoose";

const connectToDataBase = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
  } catch (error) {
    logger.error(`DB Connection error : ${error.message} `);
  }

  const connection = mongoose.connection;

  if (connection.readyState >= 1) {
    logger.info("Connected to DataBase");
    return;
  }

  connection.on("connected", () => logger.info("Connected to DataBase"));

  connection.on("error", (error) => logger.error(`DB Connection error : ${error.message} `));
};
export default connectToDataBase;
