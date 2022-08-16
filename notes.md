
1. Set up Project with express-boilerplate
 (make sure to change the pino implementaion if you get any error)
https://github.com/Dey-Sumit/express-boilerplate 
main -> without mongo but wrong pino
feature/integrate-mongo-db : with mongo but correct pino

```
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  base: null,
});

export default logger;

```

2. Connect to MongoDB

```
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


```

3. 