import express from "express";
import dotenv from "dotenv";

import morgan from "morgan";

import { createServer } from "http";

import log from "@libs/logger";
import connectToDataBase from "utils/connect-db";
import authRouter from "@routes/auth.routes";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use("/api/auth", authRouter);

const httpServer = createServer(app);

app.use(morgan("dev"));
console.log("CLIENT_URL", process.env.CLIENT_URL);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

httpServer.listen(PORT, () => {
  connectToDataBase();
  log.info(`Server is Running on ${PORT}`);
});
